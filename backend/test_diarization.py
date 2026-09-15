import os

import pytest


@pytest.mark.skipif(
    os.getenv("RUN_DIARIZATION_TESTS") != "1",
    reason="Diarization requires an explicit opt-in and Hugging Face credentials",
)
def test_diarization_pipeline_loads():
    pytest.importorskip("pyannote.audio")
    from pyannote.audio import Pipeline

    pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1")
    assert pipeline is not None