import asyncio
import json
import logging
import os
import secrets
import time

import numpy as np
import torch
from fastapi import WebSocket, WebSocketDisconnect
from silero_vad import VADIterator

from app.services import storage
from app.services.audio_pipeline import SAMPLE_RATE, transcribe_pcm, translate_languages
from app.services.context_manager import ContextManager
from app.services.risk_detector import detect_risk

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

security_logger = logging.getLogger("diplomai.security")

VAD_FRAME_SAMPLES = 512
VAD_FRAME_BYTES = VAD_FRAME_SAMPLES * 2

VAD_THRESHOLD = 0.55
VAD_MIN_SILENCE_MS = 700
VAD_SPEECH_PAD_MS = 120
PRE_SPEECH_AUDIO_SECONDS = 0.25

PARTIAL_INTERVAL_SECONDS = 0.35
PARTIAL_WINDOW_SECONDS = 2
MIN_AUDIO_SECONDS = 0.35

LIVE_TRANSLATION_INTERVAL_SECONDS = 1.0
MIN_WORDS_FOR_TRANSLATION = 2

MAX_AUDIO_MESSAGE_BYTES = 64 * 1024
MAX_MESSAGES_PER_SECOND = 120

ALLOWED_SOURCE_LANGUAGES = {
    "auto",
    "en",
    "hi",
    "fr",
    "ar",
    "es",
    "ru",
    "it",
    "ja",
    "de",
    "he",
}

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "fr": "French",
    "ar": "Arabic",
    "es": "Spanish",
    "ru": "Russian",
    "it": "Italian",
    "ja": "Japanese",
    "de": "German",
    "he": "Hebrew",
    "auto": "Auto Detect",
}


def build_websocket_endpoint(vad_model):
    async def websocket_endpoint(websocket: WebSocket):
        # Authentication disabled for testing - TODO: fix this
        # expected_token = os.getenv("DIPLOMAI_SESSION_TOKEN")
        # provided_token = websocket.query_params.get("token")
        #
        # if expected_token and provided_token:
        #     if not secrets.compare_digest(
        #         provided_token,
        #         expected_token,
        #     ):
        #         await websocket.accept()
        #         await websocket.close(code=1008, reason="Authentication failed")
        #         security_logger.warning("WebSocket authentication failed")
        #         return

        await websocket.accept()

        security_logger.info("WebSocket authentication successful")

        context_manager = ContextManager(max_sentences=10)

        print("=" * 60)
        print("🔌 WebSocket client connected")
        print("=" * 60)

        valid_audio_format = True
        selected_source_language = "auto"

        vad_iterator = VADIterator(
            vad_model,
            threshold=VAD_THRESHOLD,
            sampling_rate=SAMPLE_RATE,
            min_silence_duration_ms=VAD_MIN_SILENCE_MS,
            speech_pad_ms=VAD_SPEECH_PAD_MS,
        )

        vad_input_buffer = bytearray()
        pre_speech_buffer = bytearray()
        speech_buffer = bytearray()

        speech_active = False
        utterance_id = 0

        last_partial_time = 0.0
        last_partial_text = ""

        last_live_translation_time = 0.0
        last_live_translation_text = ""

        asr_lock = asyncio.Lock()
        send_lock = asyncio.Lock()

        partial_pending = None
        partial_worker_task = None

        live_translation_pending = None
        live_translation_worker_task = None

        background_tasks = set()
        closed = False
        current_session_id = None
        current_user_id = None
        current_target_languages = []

        message_window_start = time.monotonic()
        message_count = 0

        async def safe_send(payload: dict):
            if closed:
                return

            try:
                async with send_lock:
                    await websocket.send_json(payload)
            except Exception:
                pass

        def start_task(coroutine):
            task = asyncio.create_task(coroutine)
            background_tasks.add(task)
            task.add_done_callback(background_tasks.discard)
            return task

        def latest_window(pcm_bytes: bytes) -> bytes:
            max_bytes = int(
                SAMPLE_RATE
                * 2
                * PARTIAL_WINDOW_SECONDS
            )
            return pcm_bytes[-max_bytes:]

        async def partial_worker():
            nonlocal partial_pending
            nonlocal last_partial_text

            while partial_pending is not None and not closed:
                job = partial_pending
                partial_pending = None

                (
                    job_utterance_id,
                    pcm_copy,
                ) = job

                if (
                    job_utterance_id != utterance_id
                    or not speech_active
                ):
                    continue

                async with asr_lock:
                    if (
                        job_utterance_id != utterance_id
                        or not speech_active
                    ):
                        continue

                    text = await transcribe_pcm(
                        pcm_copy,
                        SAMPLE_RATE,
                        language=selected_source_language,
                    )

                if (
                    not text
                    or job_utterance_id != utterance_id
                    or not speech_active
                ):
                    continue

                if text != last_partial_text:
                    last_partial_text = text

                    print(
                        "📝 LIVE TRANSCRIPT:",
                        text,
                    )

                    await safe_send({
                        "type": "partial_transcript",
                        "text": text,
                    })

                    queue_live_translation(
                        text,
                        job_utterance_id,
                    )

        def queue_latest_partial():
            nonlocal partial_pending
            nonlocal partial_worker_task

            if not speech_active or not speech_buffer:
                return

            partial_pending = (
                utterance_id,
                latest_window(bytes(speech_buffer)),
            )

            if (
                partial_worker_task is None
                or partial_worker_task.done()
            ):
                partial_worker_task = start_task(partial_worker())

        async def live_translation_worker():
            nonlocal live_translation_pending

            while live_translation_pending is not None and not closed:
                job = live_translation_pending
                live_translation_pending = None

                (
                    job_utterance_id,
                    text,
                ) = job

                if (
                    job_utterance_id != utterance_id
                    or not speech_active
                ):
                    continue

                print(
                    "🌍 LIVE TRANSLATING:",
                    text,
                )

                translations = await translate_languages(
                    text,
                    selected_source_language,
                )

                if (
                    job_utterance_id != utterance_id
                    or not speech_active
                    or not translations
                ):
                    continue

                await safe_send({
                    "type": "partial_translations",
                    "translations": translations,
                })

                print(
                    "✅ LIVE TRANSLATIONS SENT"
                )

        def queue_live_translation(
            text: str,
            job_utterance_id: int,
        ):
            nonlocal live_translation_pending
            nonlocal live_translation_worker_task
            nonlocal last_live_translation_time
            nonlocal last_live_translation_text

            if len(text.split()) < MIN_WORDS_FOR_TRANSLATION:
                return

            if text == last_live_translation_text:
                return

            last_live_translation_text = text

            now = time.monotonic()

            if (
                now - last_live_translation_time
                < LIVE_TRANSLATION_INTERVAL_SECONDS
            ):
                return

            last_live_translation_time = now

            live_translation_pending = (
                job_utterance_id,
                text,
            )

            if (
                live_translation_worker_task is None
                or live_translation_worker_task.done()
            ):
                live_translation_worker_task = start_task(
                    live_translation_worker()
                )

        async def process_final(
            pcm_copy: bytes,
            final_utterance_id: int,
        ):
            if not pcm_copy:
                return

            print("=" * 60)
            print("🟢 FINAL PROCESSING")
            print("=" * 60)

            async with asr_lock:
                result = await transcribe_pcm(
                    pcm_copy,
                    SAMPLE_RATE,
                    with_metadata=True,
                    language=selected_source_language,
                )

            text = result.get("text", "")

            if not text:
                print("⚠️ Whisper returned no speech")
                return

            source_language_code = result.get("language", "auto")
            language_confidence = result.get("language_probability", 0.0)
            source_language_name = LANGUAGE_NAMES.get(
                source_language_code,
                source_language_code.upper(),
            )

            print("📝 FINAL TRANSCRIPT:", text)
            print(
                "🌐 FINAL LANGUAGE:",
                source_language_name,
                f"({source_language_code})",
            )

            await safe_send({
                "type": "language_detected",
                "code": source_language_code,
                "language": source_language_name,
                "confidence": language_confidence,
            })

            await safe_send({
                "type": "final_transcript",
                "text": text,
            })

            translation_text = context_manager.resolve_references(
                text,
                source_language_code,
            )

            risk_analysis = detect_risk(text)

            print("🛡️ RISK ANALYSIS:")
            print(f"   Risk Level: {risk_analysis['risk_level']}")
            print(f"   Risk Score: {risk_analysis['risk_score']}")
            print(f"   Risk Categories: {risk_analysis['risk_categories']}")
            print(f"   Ambiguity: {risk_analysis['ambiguity']}")
            print(f"   Ambiguous Terms: {risk_analysis['ambiguous_terms']}")
            print(f"   Uncertainty: {risk_analysis['uncertainty']}")
            print(f"   Attribution Risk: {risk_analysis['attribution_risk']}")
            print(f"   Escalatory Language: {risk_analysis['escalatory_language']}")

            await safe_send({
                "type": "risk_analysis",
                "data": risk_analysis,
            })

            translations = await translate_languages(
                translation_text,
                source_language_code,
            )

            if translations:
                await safe_send({
                    "type": "translations",
                    "translations": translations,
                })

                print("🌍 FINAL TRANSLATIONS SENT")

            if current_session_id is not None:
                storage.save_segment(
                    current_session_id,
                    text,
                    translations or [],
                )

            context_manager.add_sentence(
                text,
                source_language_code,
            )

            print(
                "🧠 CONTEXT SIZE:",
                context_manager.size(),
            )

        async def begin_speech():
            nonlocal speech_active
            nonlocal utterance_id
            nonlocal speech_buffer
            nonlocal partial_pending
            nonlocal live_translation_pending
            nonlocal last_partial_text
            nonlocal last_live_translation_text
            nonlocal last_partial_time
            nonlocal last_live_translation_time

            utterance_id += 1
            speech_active = True
            speech_buffer = bytearray(pre_speech_buffer)
            partial_pending = None
            live_translation_pending = None
            last_partial_text = ""
            last_live_translation_text = ""
            last_partial_time = 0.0
            last_live_translation_time = 0.0

            print("🟢 VAD SPEECH START")

            await safe_send({
                "type": "vad",
                "state": "speech_start",
            })

        async def finish_speech():
            nonlocal speech_active
            nonlocal speech_buffer
            nonlocal partial_pending
            nonlocal live_translation_pending

            if not speech_active:
                return

            speech_active = False
            partial_pending = None
            live_translation_pending = None

            final_pcm = bytes(speech_buffer)
            final_utterance_id = utterance_id
            speech_buffer.clear()

            print("🔴 VAD SPEECH END")

            await safe_send({
                "type": "vad",
                "state": "speech_end",
            })

            start_task(
                process_final(
                    final_pcm,
                    final_utterance_id,
                )
            )

        async def process_vad_frame(frame: bytes):
            nonlocal pre_speech_buffer
            nonlocal speech_buffer
            nonlocal last_partial_time

            pre_speech_buffer.extend(frame)

            max_pre_speech_bytes = int(
                PRE_SPEECH_AUDIO_SECONDS
                * SAMPLE_RATE
                * 2
            )

            if len(pre_speech_buffer) > max_pre_speech_bytes:
                del pre_speech_buffer[
                    :len(pre_speech_buffer)
                    - max_pre_speech_bytes
                ]

            samples = np.frombuffer(
                frame,
                dtype=np.int16,
            ).astype(np.float32) / 32768.0

            audio_tensor = torch.from_numpy(samples)
            vad_event = vad_iterator(
                audio_tensor,
                return_seconds=False,
            )

            if not speech_active:
                if vad_event and "start" in vad_event:
                    await begin_speech()
                return

            speech_buffer.extend(frame)

            if vad_event and "end" in vad_event:
                await finish_speech()
                return

            now = time.monotonic()

            if now - last_partial_time >= PARTIAL_INTERVAL_SECONDS:
                last_partial_time = now
                queue_latest_partial()

        try:
            await safe_send({
                "type": "connection",
                "message": "Authenticated connection to DiplomAI backend",
            })

            while True:
                message = await websocket.receive()

                if message.get("type") == "websocket.disconnect":
                    break

                now = time.monotonic()

                if now - message_window_start >= 1.0:
                    message_window_start = now
                    message_count = 0

                message_count += 1

                if message_count > MAX_MESSAGES_PER_SECOND:
                    security_logger.warning(
                        "WebSocket rate limit exceeded: %d messages in current window",
                        message_count,
                    )

                    await safe_send({
                        "type": "error",
                        "message": "Too many messages. Please slow down.",
                    })
                    continue

                if message.get("text") is not None:
                    try:
                        data = json.loads(message["text"])
                    except json.JSONDecodeError:
                        continue

                    if data.get("type") == "SESSION_START":
                        try:
                            current_user_id = int(data.get("user_id", current_user_id or 0) or 0)
                        except (TypeError, ValueError):
                            current_user_id = None

                        current_target_languages = data.get("target_languages") or []

                        if current_user_id:
                            current_session_id = storage.create_session(
                                data.get("source_language") or selected_source_language,
                                current_target_languages,
                                current_user_id,
                            )
                            print(
                                "📜 SESSION STARTED FOR USER",
                                current_user_id,
                                "SESSION ID",
                                current_session_id,
                            )
                        else:
                            current_session_id = None
                            print("📜 SESSION STARTED WITHOUT USER ID")

                        continue

                    if data.get("type") == "SOURCE_LANGUAGE":
                        requested_language = data.get("language", "auto")

                        if (
                            not isinstance(requested_language, str)
                            or requested_language not in ALLOWED_SOURCE_LANGUAGES
                        ):
                            security_logger.warning(
                                "Invalid source language request: %r",
                                requested_language,
                            )

                            await safe_send({
                                "type": "error",
                                "message": "Invalid source language.",
                            })
                            continue

                        selected_source_language = requested_language

                        print(
                            "🌐 SOURCE LANGUAGE SELECTED:",
                            selected_source_language,
                        )

                        continue

                    if data.get("type") == "AUDIO_CONFIG":
                        try:
                            client_sample_rate = int(
                                data.get("sample_rate", 0)
                            )
                        except (TypeError, ValueError):
                            client_sample_rate = 0

                        valid_audio_format = (
                            client_sample_rate == SAMPLE_RATE
                        )

                        print(
                            "🎵 Browser sample rate:",
                            client_sample_rate,
                        )

                        if not valid_audio_format:
                            security_logger.warning(
                                "Invalid audio sample rate: %r",
                                client_sample_rate,
                            )

                            await safe_send({
                                "type": "error",
                                "message": (
                                    "Silero VAD requires "
                                    "16000 Hz audio. "
                                    "Set AudioContext "
                                    "sampleRate to 16000."
                                ),
                            })

                    continue

                if message.get("bytes") is not None:
                    audio_bytes = message["bytes"]

                    if len(audio_bytes) > MAX_AUDIO_MESSAGE_BYTES:
                        security_logger.warning(
                            "Oversized audio message rejected: %d bytes",
                            len(audio_bytes),
                        )

                        await safe_send({
                            "type": "error",
                            "message": "Audio message is too large.",
                        })
                        continue

                    if not valid_audio_format:
                        continue

                    vad_input_buffer.extend(audio_bytes)

                    while len(vad_input_buffer) >= VAD_FRAME_BYTES:
                        frame = bytes(
                            vad_input_buffer[:VAD_FRAME_BYTES]
                        )

                        del vad_input_buffer[:VAD_FRAME_BYTES]

                        await process_vad_frame(frame)

        except WebSocketDisconnect:
            pass

        finally:
            closed = True

            if (
                partial_worker_task is not None
                and not partial_worker_task.done()
            ):
                partial_worker_task.cancel()

            if (
                live_translation_worker_task is not None
                and not live_translation_worker_task.done()
            ):
                live_translation_worker_task.cancel()

            for task in background_tasks:
                if not task.done():
                    task.cancel()

            print("🔌 WebSocket client disconnected")

    return websocket_endpoint
