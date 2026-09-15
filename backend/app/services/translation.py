import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Language name -> Google Translate language code
LANGUAGE_CODES = {
    "English":  "en",
    "Hindi":    "hi",
    "French":   "fr",
    "Arabic":   "ar",
    "Spanish":  "es",
    "Russian":  "ru",
    "Italian":  "it",
    "Japanese": "ja",
    "German":   "de",
    "Hebrew":   "iw",   # Google Translate uses 'iw' for Hebrew
}

# Simple diplomatic glossary applied before sending to Google Translate
# (enhances accuracy for key diplomatic terms)
GLOSSARY = {
    "bilateral cooperation": {
        "Hindi":    "द्विपक्षीय सहयोग",
        "French":   "coopération bilatérale",
        "Arabic":   "التعاون الثنائي",
        "Spanish":  "cooperación bilateral",
        "Russian":  "двустороннее сотрудничество",
        "Italian":  "cooperazione bilaterale",
        "Japanese": "二国間協力",
        "German":   "bilaterale Zusammenarbeit",
        "Hebrew":   "שיתוף פעולה דו-צדדי",
    },
    "strategic partnership": {
        "Hindi":    "रणनीतिक साझेदारी",
        "French":   "partenariat stratégique",
        "Arabic":   "الشراكة الاستراتيجية",
        "Spanish":  "asociación estratégica",
        "Russian":  "стратегическое партнёрство",
        "Italian":  "partenariato strategico",
        "Japanese": "戦略的パートナーシップ",
        "German":   "strategische Partnerschaft",
        "Hebrew":   "שותפות אסטרטגית",
    },
    "territorial integrity": {
        "Hindi":    "क्षेत्रीय अखंडता",
        "French":   "intégrité territoriale",
        "Arabic":   "السلامة الإقليمية",
        "Spanish":  "integridad territorial",
        "Russian":  "территориальная целостность",
        "Italian":  "integrità territoriale",
        "Japanese": "領土保全",
        "German":   "territoriale Integrität",
        "Hebrew":   "שלמות טריטוריאלית",
    },
}


def translate_text(
    text: str,
    target_language: str,
    source_language: str = "auto",
) -> str:
    """
    Translate text to target_language using Google Translate via deep_translator.
    Retries up to 3 times on rate-limit errors with backoff.
    Falls back to original text on persistent failure.
    """
    if not text or not text.strip():
        return ""

    # Resolve target language name -> code
    target_name = target_language.strip()
    code_to_name = {v: k for k, v in LANGUAGE_CODES.items()}
    if target_name in code_to_name:
        target_name = code_to_name[target_name]

    if target_name not in LANGUAGE_CODES:
        print(f"❌ Unknown target language: {target_language!r}")
        return text

    target_code = LANGUAGE_CODES[target_name]

    # Same language — no translation needed
    src = source_language if source_language != "auto" else "auto"
    if src != "auto" and src == target_code:
        return text

    try:
        from deep_translator import GoogleTranslator
        import time

        for attempt in range(3):
            try:
                translator = GoogleTranslator(source=src, target=target_code)
                translated = translator.translate(text)
                if translated:
                    print(f"✅ Translated ({src} → {target_name}): {translated[:60]}...")
                    return translated.strip()
            except Exception as e:
                err = str(e)
                if "too many requests" in err.lower() or "429" in err:
                    wait = 2 ** attempt  # 1s, 2s, 4s
                    print(f"⏳ Rate limited, retrying in {wait}s ({target_name})...")
                    time.sleep(wait)
                else:
                    print(f"⚠️  Translate failed ({target_name}): {e}")
                    break  # Non-rate-limit error — don't retry

    except ImportError:
        print("⚠️  deep_translator not installed")

    # Fallback: return original text so the participant still sees something
    return text