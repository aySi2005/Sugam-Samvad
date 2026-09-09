import time

from deep_translator import GoogleTranslator


LANGUAGE_CODES = {
    "English": "en",
    "Hindi": "hi",
    "French": "fr",
    "Arabic": "ar",
    "Spanish": "es",
}


def translate_text(
    text: str,
    target_language: str,
    source_language: str = "auto",
):
    if not text or not text.strip():
        return ""

    target_code = LANGUAGE_CODES.get(
        target_language
    )

    if not target_code:
        print(
            f"❌ Unknown target language: "
            f"{target_language}"
        )
        return ""

    source_code = (
        (source_language or "auto")
        .strip()
        .lower()
    )

    text = text.strip()

    # -------------------------------------------------
    # SAME LANGUAGE
    # -------------------------------------------------
    # No translation is necessary when the source
    # and target languages are the same.
    #
    # Example:
    # Hindi → Hindi
    # English → English
    # French → French
    # -------------------------------------------------

    if source_code == target_code:
        print(
            f"↩️ Same language: "
            f"{source_code} → {target_code}"
        )

        return text

    # -------------------------------------------------
    # TRANSLATION
    # -------------------------------------------------

    for attempt in range(1, 4):

        try:
            print(
                f"🌍 Translating "
                f"{source_code} → {target_code} "
                f"(attempt {attempt})"
            )

            translator = GoogleTranslator(
                source=source_code,
                target=target_code,
            )

            result = translator.translate(
                text
            )

            if result:
                return result.strip()

        except Exception as error:

            print(
                f"❌ {target_language} "
                f"translation failed: "
                f"{error}"
            )

            if attempt < 3:
                time.sleep(1)

    return ""