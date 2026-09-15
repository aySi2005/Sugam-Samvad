import os
import time

from dotenv import load_dotenv

load_dotenv()

try:
    from faster_whisper import WhisperModel
except Exception:  # pragma: no cover
    WhisperModel = None

try:
    from groq import Groq
except Exception:  # pragma: no cover
    Groq = None

MODEL_NAME = os.getenv("DIPLOMAI_WHISPER_MODEL", "small")
DEVICE = os.getenv("DIPLOMAI_DEVICE", "auto")


def detect_device():
    if DEVICE == "cpu":
        return "cpu", "int8"
    if DEVICE == "cuda":
        return "cuda", "float16"
    try:
        import ctranslate2

        if ctranslate2.get_cuda_device_count() > 0:
            return "cuda", "float16"
    except Exception:
        pass
    return "cpu", "int8"


DEVICE_TYPE, COMPUTE_TYPE = detect_device()

_model = None
if WhisperModel is not None:
    try:
        _model = WhisperModel(
            MODEL_NAME,
            device=DEVICE_TYPE,
            compute_type=COMPUTE_TYPE,
            cpu_threads=max(1, os.cpu_count() or 2),
            num_workers=1,
        )
        print("✅ Local faster-whisper model loaded")
    except Exception as exc:  # pragma: no cover
        print(f"⚠️ Local Whisper init failed: {exc}")
        _model = None

_groq_client = None
if Groq is not None:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        try:
            _groq_client = Groq(api_key=groq_api_key)
        except Exception as exc:  # pragma: no cover
            print(f"⚠️ Groq client init failed: {exc}")
            _groq_client = None


def _local_transcribe(audio_path: str, language: str = "auto"):
    if _model is None:
        return None

    whisper_language = None if language == "auto" else language
    segments, info = _model.transcribe(
        audio_path,
        language=whisper_language,
        task="transcribe",
        beam_size=5,
        best_of=5,
        temperature=0.0,
        vad_filter=False,
        no_speech_threshold=0.6,
        compression_ratio_threshold=2.4,
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

    transcript = " ".join(transcript_parts).strip()
    detected_language = getattr(info, "language", None) or language or "auto"
    detected_probability = float(getattr(info, "language_probability", 0.0) or 0.0)

    return {
        "text": transcript,
        "language": detected_language,
        "language_probability": detected_probability,
    }


def _groq_transcribe(audio_path: str, language: str = "auto"):
    if _groq_client is None:
        return None

    try:
        with open(audio_path, "rb") as audio_file:
            response = _groq_client.audio.transcriptions.create(
                file=(os.path.basename(audio_path), audio_file, "audio/wav"),
                model="distil-whisper-large-v3-en",
                language=None if language == "auto" else language,
                response_format="json",
            )

        transcript = getattr(response, "text", "") or ""
        if transcript:
            return {
                "text": transcript.strip(),
                "language": language,
                "language_probability": 0.75,
            }
    except Exception as exc:  # pragma: no cover
        print(f"⚠️ Groq transcription failed: {exc}")
    return None


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
        result = _local_transcribe(audio_path, language)
        if result is None:
            result = _groq_transcribe(audio_path, language)

        if result is None:
            print("⚠️ No transcription backend available; returning empty output.")
            return empty_result if with_metadata else ""

        print("📝 TRANSCRIPT:", result["text"] or "No speech")
        print("🌐 Language:", result["language"])
        print("📊 Whisper language probability:", round(float(result.get("language_probability", 0.0) or 0.0), 3))
        print("⏱️ Processing time:", f"{time.time() - start_time:.2f}s")

        return result if with_metadata else result["text"]

    except Exception as error:
        print("❌ TRANSCRIPTION ERROR:", error)
        return empty_result if with_metadata else ""