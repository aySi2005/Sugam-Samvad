import os
import time

from faster_whisper import WhisperModel


MODEL_NAME = os.getenv(
    "DIPLOMAI_WHISPER_MODEL",
    "Systran/faster-whisper-medium",
)

DEVICE_SETTING = os.getenv(
    "DIPLOMAI_DEVICE",
    "auto",
)


def detect_device():
    if DEVICE_SETTING == "cpu":
        print("💻 Forced CPU mode")
        return "cpu", "int8"

    if DEVICE_SETTING == "cuda":
        print("🚀 Forced CUDA mode")
        return "cuda", "float16"

    try:
        import ctranslate2

        if ctranslate2.get_cuda_device_count() > 0:
            print("🚀 NVIDIA GPU detected")
            return "cuda", "float16"

    except Exception:
        pass

    print("💻 Using CPU")
    return "cpu", "int8"


DEVICE, COMPUTE_TYPE = detect_device()


print("=" * 60)
print("Loading DiplomAI Whisper model...")
print("Model:", MODEL_NAME)
print("Device:", DEVICE)
print("Compute type:", COMPUTE_TYPE)
print("=" * 60)


model_start = time.time()

model = WhisperModel(
    MODEL_NAME,
    device=DEVICE,
    compute_type=COMPUTE_TYPE,
    cpu_threads=4,
    num_workers=1,
)

print(
    "✅ Whisper model loaded in "
    f"{time.time() - model_start:.2f}s"
)


def transcribe_audio(
    audio_path: str,
    with_metadata: bool = False,
    language: str = "auto",
):
    empty_result = {
        "text": "",
        "language": language,
        "language_probability": 0.0,
    }

    if not os.path.exists(audio_path):
        print("❌ Audio file not found:", audio_path)
        return empty_result if with_metadata else ""

    if os.path.getsize(audio_path) == 0:
        print("❌ Audio file is empty")
        return empty_result if with_metadata else ""

    start_time = time.time()

    try:
        # Manual language selection.
        whisper_language = (
            None if language == "auto" else language
        )

        print(
            "🎤 Whisper input language:",
            language,
        )

        segments, info = model.transcribe(
            audio_path,

            language=whisper_language,

            task="transcribe",

            # Keep the decoder neutral.
            # Do NOT use initial_prompt here.
            beam_size=5,
            best_of=5,
            temperature=0.0,

            # Silero VAD is already used by the
            # streaming pipeline.
            vad_filter=False,

            # Reduce hallucinations.
            no_speech_threshold=0.6,
            compression_ratio_threshold=2.4,

            # Important for independent live chunks.
            condition_on_previous_text=False,

            without_timestamps=True,

            suppress_blank=True,

            max_new_tokens=128,
        )

        transcript_parts = []

        for segment in segments:
            text = segment.text.strip()

            if text:
                transcript_parts.append(text)

        transcript = " ".join(
            transcript_parts
        ).strip()

        detected_language = (
            getattr(info, "language", None)
            or language
            or "auto"
        )

        detected_probability = float(
            getattr(
                info,
                "language_probability",
                0.0,
            )
            or 0.0
        )

        print(
            "📝 TRANSCRIPT:",
            transcript or "No speech",
        )

        print(
            "🌐 Language:",
            detected_language,
        )

        print(
            "📊 Whisper language probability:",
            round(detected_probability, 3),
        )

        print(
            "⏱️ Processing time:",
            f"{time.time() - start_time:.2f}s",
        )

        result = {
            "text": transcript,
            "language": detected_language,
            "language_probability": detected_probability,
        }

        return result if with_metadata else transcript

    except Exception as error:

        print(
            "❌ TRANSCRIPTION ERROR:",
            error,
        )

        return (
            empty_result
            if with_metadata
            else ""
        )