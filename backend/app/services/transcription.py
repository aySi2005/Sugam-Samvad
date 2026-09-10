import os
import time

from groq import Groq


# ---------------------------------------------------------
# Groq configuration
# ---------------------------------------------------------

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

MODEL_NAME = "whisper-large-v3"

if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY is not set")
    client = None
else:
    client = Groq(api_key=GROQ_API_KEY)


# ---------------------------------------------------------
# Transcription
# ---------------------------------------------------------

def transcribe_audio(
    audio_path: str,
    with_metadata: bool = False,
    language: str = "auto",
):
    """
    Transcribe an audio file using Groq Whisper Large V3.

    Parameters:
        audio_path: Path to the audio file.
        with_metadata: Return transcript + language information.
        language: Language code such as en, hi, fr, es, ar,
                  or auto for automatic detection.
    """

    empty_result = {
        "text": "",
        "language": language,
        "language_probability": 0.0,
    }

    # -----------------------------------------------------
    # Check audio file
    # -----------------------------------------------------

    if not os.path.exists(audio_path):
        print("Audio file not found:", audio_path)

        return (
            empty_result
            if with_metadata
            else ""
        )

    if os.path.getsize(audio_path) == 0:
        print("Audio file is empty")

        return (
            empty_result
            if with_metadata
            else ""
        )

    # -----------------------------------------------------
    # Check API client
    # -----------------------------------------------------

    if client is None:
        print("GROQ_API_KEY is not configured")

        return (
            empty_result
            if with_metadata
            else ""
        )

    start_time = time.time()

    try:

        print("=" * 60)
        print("Sending audio to Groq Whisper...")
        print("Model:", MODEL_NAME)
        print("Input language:", language)
        print("=" * 60)

        # -------------------------------------------------
        # Open audio file
        # -------------------------------------------------

        with open(audio_path, "rb") as audio_file:

            request = {
                "file": audio_file,
                "model": MODEL_NAME,
                "response_format": "verbose_json",
                "temperature": 0.0,
            }

            # -------------------------------------------------
            # If language is known, provide it to Whisper.
            #
            # If language == "auto", Whisper detects it.
            # -------------------------------------------------

            if language != "auto":
                request["language"] = language

            transcription = (
                client.audio.transcriptions.create(
                    **request
                )
            )

        # -------------------------------------------------
        # Extract transcript
        # -------------------------------------------------

        transcript = (
            getattr(
                transcription,
                "text",
                ""
            )
            or ""
        ).strip()

        # -------------------------------------------------
        # Extract detected language
        # -------------------------------------------------

        detected_language = (
            getattr(
                transcription,
                "language",
                None
            )
            or language
            or "auto"
        )

        # -------------------------------------------------
        # Logging
        # -------------------------------------------------

        processing_time = (
            time.time() - start_time
        )

        print("TRANSCRIPT:")
        print(transcript or "No speech")

        print(
            "Detected language:",
            detected_language,
        )

        print(
            "Processing time:",
            f"{processing_time:.2f}s",
        )

        # -------------------------------------------------
        # Result
        # -------------------------------------------------

        result = {
            "text": transcript,
            "language": detected_language,
            "language_probability": 1.0,
        }

        return (
            result
            if with_metadata
            else transcript
        )

    # -----------------------------------------------------
    # Error handling
    # -----------------------------------------------------

    except Exception as error:

        print(
            "TRANSCRIPTION ERROR:",
            error,
        )

        return (
            empty_result
            if with_metadata
            else ""
        )