import asyncio

from app.services.audio_pipeline import LANGUAGES, translate_languages


def test_language_count_is_10():
    assert len(LANGUAGES) == 10
    assert LANGUAGES == [
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


def test_translate_languages_returns_structured_map():
    translations = asyncio.run(
        translate_languages(
            "We want peace and cooperation.",
            "en",
        )
    )

    assert isinstance(translations, dict)
    assert set(translations) <= set(LANGUAGES)
    assert len(translations) >= 1
