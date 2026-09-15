const LANGUAGE_CODES = {
  English: "en-US",
  Hindi: "hi-IN",
  French: "fr-FR",
  Arabic: "ar-SA",
  Spanish: "es-ES",
};


export function speakText(text, language) {
  if (!text || !text.trim()) {
    return;
  }

  if (!("speechSynthesis" in window)) {
    console.error(
      "❌ Browser does not support Speech Synthesis"
    );
    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  utterance.lang =
    LANGUAGE_CODES[language] || "en-US";

  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(
    utterance
  );
}


export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}


export function getAvailableVoices() {
  if (!("speechSynthesis" in window)) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}