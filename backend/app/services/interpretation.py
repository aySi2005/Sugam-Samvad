from __future__ import annotations

from dataclasses import dataclass
import re


@dataclass(frozen=True)
class Translation:
    language: str
    text: str
    risk: str
    confidence: int
    notes: list[str]


GLOSSARY = {
    "bilateral cooperation": {
        "Hindi": "द्विपक्षीय सहयोग",
        "French": "coopération bilatérale",
        "Arabic": "التعاون الثنائي",
        "Spanish": "cooperación bilateral",
    },
    "strategic partnership": {
        "Hindi": "रणनीतिक साझेदारी",
        "French": "partenariat stratégique",
        "Arabic": "الشراكة الاستراتيجية",
        "Spanish": "asociación estratégica",
    },
    "territorial integrity": {
        "Hindi": "क्षेत्रीय अखंडता",
        "French": "intégrité territoriale",
        "Arabic": "السلامة الإقليمية",
        "Spanish": "integridad territorial",
    },
}

DEMO_TRANSLATIONS = {
    "Hindi": "हम द्विपक्षीय सहयोग को मजबूत करने के लिए प्रतिबद्ध हैं।",
    "French": "Nous sommes déterminés à renforcer la coopération bilatérale.",
    "Arabic": "نحن ملتزمون بتعزيز التعاون الثنائي.",
    "Spanish": "Estamos comprometidos à fortalecer la cooperación bilateral.",
}


def _risk_for(text: str) -> tuple[str, int, list[str]]:
    notes: list[str] = []
    lowered = text.lower()
    if any(term in lowered for term in ("sanction", "ceasefire", "nuclear", "territorial")):
        notes.append("Sensitive diplomatic terminology detected")
        return "MEDIUM", 82, notes
    if len(text.split()) < 4:
        notes.append("Short segment has limited context")
        return "MEDIUM", 78, notes
    return "LOW", 96, notes


def translate_text(text: str, languages: list[str], context: list[str] | None = None) -> list[Translation]:
    source = text.strip() or "We are committed to strengthening bilateral cooperation."
    risk, confidence, notes = _risk_for(source)
    context_note = ""
    if context:
        context_note = f"Context window: {len(context)} earlier segment(s)"

    results: list[Translation] = []
    for language in languages:
        translated = DEMO_TRANSLATIONS.get(language, source)
        for term, translations in GLOSSARY.items():
            if term in source.lower() and language in translations:
                translated = re.sub(term, translations[language], translated, flags=re.IGNORECASE)
        result_notes = [*notes]
        if context_note:
            result_notes.append(context_note)
        results.append(Translation(language, translated, risk, confidence, result_notes))
    return results
