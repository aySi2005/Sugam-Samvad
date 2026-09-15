import asyncio
import time
import wave
from pathlib import Path

from app.services.transcription import transcribe_audio
from app.services.translation import translate_text

LANGUAGES = [
    "English",
    "Hindi",
    "French",
    "Arabic",
    "Spanish",
    "Russian",
    "Italian",
    "Japanese",
    "German",
    "Hebrew",
]

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
}

SAMPLE_RATE = 16000
MIN_AUDIO_SECONDS = 0.35

AUDIO_DIR = Path(__file__).resolve().parent.parent / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


def save_pcm_as_wav(
    pcm_bytes: bytes,
    sample_rate: int,
    filename: str,
) -> str:

    path = AUDIO_DIR / filename

    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(pcm_bytes)

    return str(path)


async def transcribe_pcm(
    pcm_bytes: bytes,
    sample_rate: int,
    with_metadata: bool = False,
    language: str = "auto",
):

    empty_result = {
        "text": "",
        "language": "auto",
        "language_probability": 0.0,
    }

    if not pcm_bytes:
        return empty_result if with_metadata else ""

    minimum_bytes = int(
        sample_rate * 2 * MIN_AUDIO_SECONDS
    )

    if len(pcm_bytes) < minimum_bytes:
        return empty_result if with_metadata else ""

    filename = f"live_{int(time.time() * 1000)}.wav"

    wav_path = await asyncio.to_thread(
        save_pcm_as_wav,
        pcm_bytes,
        sample_rate,
        filename,
    )

    try:

        result = await asyncio.to_thread(
            transcribe_audio,
            wav_path,
            with_metadata,
            language,
        )

        if with_metadata:
            return result

        return (result or "").strip()

    except Exception as error:

        print(
            "❌ Transcription error:",
            error,
        )

        return (
            empty_result
            if with_metadata
            else ""
        )

    finally:

        try:
            await asyncio.to_thread(
                Path(wav_path).unlink
            )

        except FileNotFoundError:
            pass

        except Exception as error:
            print(
                "⚠️ Temporary WAV cleanup error:",
                error,
            )


async def translate_languages(
    text: str,
    source_language: str = "auto",
) -> dict[str, str]:

    if not text:
        return {}

    async def translate_one(language: str):

        try:

            result = await asyncio.to_thread(
                translate_text,
                text,
                language,
                source_language,
            )

            return language, result or ""

        except Exception as error:

            print(
                f"❌ Translation error ({language}):",
                error,
            )

            return language, ""

    results = await asyncio.gather(
        *(
            translate_one(language)
            for language in LANGUAGES
        )
    )

    return {
        language: translation
        for language, translation in results
        if translation
    }
