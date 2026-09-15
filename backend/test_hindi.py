import os
from pathlib import Path

import pytest


@pytest.mark.skipif(
    not Path(__file__).parent.joinpath("audio", "test_hindi.wav").exists(),
    reason="Optional Hindi audio fixture is not present",
)
def test_hindi_transcription():
    from faster_whisper import WhisperModel

    if os.getenv("DIPLOMAI_DEVICE") == "cpu":
        device = "cpu"
        compute_type = "int8"
    else:
        try:
            import ctranslate2

            device = "cuda" if ctranslate2.get_cuda_device_count() > 0 else "cpu"
            compute_type = "float16" if device == "cuda" else "int8"
        except Exception:
            device = "cpu"
            compute_type = "int8"

    model = WhisperModel(
        "Systran/faster-whisper-medium",
        device=device,
        compute_type=compute_type,
    )
    segments, info = model.transcribe(
        str(Path(__file__).parent / "audio" / "test_hindi.wav"),
        language="hi",
        task="transcribe",
        beam_size=5,
        temperature=0.0,
        condition_on_previous_text=False,
        vad_filter=False,
    )

    transcript = " ".join(segment.text.strip() for segment in segments).strip()
    assert info.language == "hi"
    assert transcript