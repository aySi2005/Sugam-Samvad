import { useEffect, useRef, useState } from "react";
import "./App.css";



function App() {
  const [listening, setListening] = useState(false);
  const [connected, setConnected] = useState(false);

  const [activeSection, setActiveSection] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [portalLanguage, setPortalLanguage] = useState("en");
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [scrolled, setScrolled] = useState(false);

  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState("");

  const [sourceLanguage, setSourceLanguage] = useState({
    code: "en",
    name: "English",
  });

  const [selectedInputLanguage, setSelectedInputLanguage] =
    useState("en");

  const [listeningLanguage, setListeningLanguage] =
  useState("en");

  const [speaking, setSpeaking] = useState(false);

  const [translations, setTranslations] = useState({});

  const [riskAnalysis, setRiskAnalysis] = useState({
    risk_level: "low",
    risk_score: 0,
    risk_terms: [],
    risk_categories: [],
    ambiguity: false,
    ambiguity_score: 0,
    ambiguous_terms: [],
    ambiguity_categories: [],
    uncertainty: false,
    uncertainty_terms: [],
    attribution_risk: false,
    attribution_terms: [],
    escalatory_language: false,
    escalatory_terms: [],
  });

  const [selectedLanguages, setSelectedLanguages] = useState([
    "English",
    "Hindi",
    "French",
    "Arabic",
  ]);

  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const workletRef = useRef(null);
  const speechActiveRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const listeningLanguageRef = useRef("en");

  const speechLanguageCodes = {
    en: "en-US",
    hi: "hi-IN",
    fr: "fr-FR",
    ar: "ar-SA",
    es: "es-ES",
  };

  const speakTranslation = (text, languageCode) => {
    if (!text || !window.speechSynthesis) {
      return;
    }

    const targetLanguage =
      speechLanguageCodes[languageCode];

    const voices =
      window.speechSynthesis.getVoices();

    const voice =
      voices.find(
        v => v.lang === targetLanguage
      ) ||
      voices.find(
        v =>
          v.lang &&
          v.lang.startsWith(
            languageCode
          )
      );

    if (!voice) {
      console.warn(
        `⚠️ No TTS voice available for ${languageCode}`
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    console.log(
      "🔊 Speaking:",
      languageCode,
      voice.name,
      text
    );

    utterance.onstart = () => {
      setSpeaking(true);
    };

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(
      utterance
    );
  };


  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(false);
  };

  const SPEECH_THRESHOLD = 0.008;
  const SILENCE_TIMEOUT = 900;

  // Available target languages
  const languages = [
    "English",
    "Hindi",
    "French",
    "Arabic",
    "Spanish",
  ];

  // Source language names
  const inputLanguageNames = {
    en: "English",
    hi: "Hindi",
    fr: "French",
    ar: "Arabic",
    es: "Spanish",
  };
  const portalText = {
    en: {
      home: "Home",
      realtime: "Real-Time Interpretation",
      diplomatic: "Diplomatic Assistance",
      risk: "Risk Analysis",
      settings: "Settings",
      speaker: "Speaker Language",
      target: "Target Languages",
      listening: "Listening Language",
      transcript: "Live Transcript",
      source: "Source Language Detected",
      connection: "Connection Status",
      riskTitle: "Diplomatic Risk & Ambiguity Analysis",
      light: "Light Mode",
      dark: "Dark Mode",
      language: "Portal Language",
      accessibility: "Accessibility",
      start: "Start Listening",
      stop: "Stop Listening",
      connected: "Connected",
      disconnected: "Disconnected",
      translations: "Translations",
      search: "Search",
      searchHere: "Search Here",
      allCategories: "All Categories",
      close: "Close",
    },
    hi: {
      home: "होम",
      realtime: "रियल-टाइम व्याख्या",
      diplomatic: "राजनयिक सहायता",
      risk: "जोखिम विश्लेषण",
      settings: "सेटिंग्स",
      speaker: "वक्ता की भाषा",
      target: "लक्ष्य भाषाएँ",
      listening: "सुनने की भाषा",
      transcript: "लाइव ट्रांसक्रिप्ट",
      source: "स्रोत भाषा",
      connection: "कनेक्शन स्थिति",
      riskTitle: "राजनयिक जोखिम एवं अस्पष्टता विश्लेषण",
      light: "लाइट मोड",
      dark: "डार्क मोड",
      language: "पोर्टल भाषा",
      accessibility: "सुगम्यता",
      start: "सुनना शुरू करें",
      stop: "सुनना बंद करें",
      connected: "कनेक्टेड",
      disconnected: "डिस्कनेक्टेड",
      translations: "अनुवाद",
      search: "खोजें",
      searchHere: "यहाँ खोजें",
      allCategories: "सभी श्रेणियाँ",
      close: "बंद करें",
    },
    fr: {
      home: "Accueil",
      realtime: "Interprétation en temps réel",
      diplomatic: "Assistance diplomatique",
      risk: "Analyse des risques",
      settings: "Paramètres",
      speaker: "Langue du locuteur",
      target: "Langues cibles",
      listening: "Langue d'écoute",
      transcript: "Transcription en direct",
      source: "Langue source détectée",
      connection: "État de la connexion",
      riskTitle: "Analyse des risques diplomatiques et de l'ambiguïté",
      light: "Mode clair",
      dark: "Mode sombre",
      language: "Langue du portail",
      accessibility: "Accessibilité",
      start: "Démarrer l'écoute",
      stop: "Arrêter l'écoute",
      connected: "Connecté",
      disconnected: "Déconnecté",
      translations: "Traductions",
      search: "Rechercher",
      searchHere: "Rechercher ici",
      allCategories: "Toutes les catégories",
      close: "Fermer",
    },
    es: {
      home: "Inicio",
      realtime: "Interpretación en tiempo real",
      diplomatic: "Asistencia diplomática",
      risk: "Análisis de riesgos",
      settings: "Configuración",
      speaker: "Idioma del hablante",
      target: "Idiomas de destino",
      listening: "Idioma de escucha",
      transcript: "Transcripción en vivo",
      source: "Idioma de origen detectado",
      connection: "Estado de conexión",
      riskTitle: "Análisis de riesgo diplomático y ambigüedad",
      light: "Modo claro",
      dark: "Modo oscuro",
      language: "Idioma del portal",
      accessibility: "Accesibilidad",
      start: "Iniciar escucha",
      stop: "Detener escucha",
      connected: "Conectado",
      disconnected: "Desconectado",
      translations: "Traducciones",
      search: "Buscar",
      searchHere: "Buscar aquí",
      allCategories: "Todas las categorías",
      close: "Cerrar",
    },
    ar: {
      home: "الرئيسية",
      realtime: "الترجمة الفورية",
      diplomatic: "المساعدة الدبلوماسية",
      risk: "تحليل المخاطر",
      settings: "الإعدادات",
      speaker: "لغة المتحدث",
      target: "اللغات المستهدفة",
      listening: "لغة الاستماع",
      transcript: "النص المباشر",
      source: "اللغة المصدر المكتشفة",
      connection: "حالة الاتصال",
      riskTitle: "تحليل المخاطر الدبلوماسية والغموض",
      light: "الوضع الفاتح",
      dark: "الوضع الداكن",
      language: "لغة البوابة",
      accessibility: "إمكانية الوصول",
      start: "بدء الاستماع",
      stop: "إيقاف الاستماع",
      connected: "متصل",
      disconnected: "غير متصل",
      translations: "الترجمات",
      search: "بحث",
      searchHere: "ابحث هنا",
      allCategories: "جميع الفئات",
      close: "إغلاق",
    },
  };

  const t = portalText[portalLanguage];


  useEffect(() => {
    listeningLanguageRef.current =
      listeningLanguage;
  }, [listeningLanguage]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 180);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  useEffect(() => {
    const socket = new WebSocket(
      "ws://127.0.0.1:8000/ws?token=diplomai-test-123"
    );

    socket.binaryType = "arraybuffer";
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Connected to backend");
      setConnected(true);
    };

    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);

        console.log("📩 Backend:", data);

        if (data.type === "connection") {
          console.log(data.message);
        }

        // Live/partial transcript
        if (data.type === "partial_transcript") {
          setLiveTranscript(data.text || "");
        }

        // Final transcript
        if (
          data.type === "final_transcript" &&
          data.text
        ) {
          setTranscriptHistory(previous => {
            const lastSentence =
              previous[previous.length - 1];

            if (lastSentence === data.text) {
              return previous;
            }

            return [
              ...previous,
              data.text,
            ];
          });

          setLiveTranscript("");
        }

        // Translation results
        if (
          data.type === "translations" ||
          data.type === "partial_translations"
        ) {
          setTranslations(previous => ({
            ...previous,
            ...(data.translations || {}),
          }));

          // Speak ONLY finalized translations.
          // Partial translations are displayed but never spoken.
          if (data.type === "translations") {
            const languageMap = {
              en: "English",
              hi: "Hindi",
              fr: "French",
              ar: "Arabic",
              es: "Spanish",
            };

            const targetLanguage =
              languageMap[
                listeningLanguageRef.current
              ];

            const spokenText =
              data.translations?.[targetLanguage];

            if (spokenText) {
              speakTranslation(
                spokenText,
                listeningLanguageRef.current
              );
            }
          }
        }

        // Risk & ambiguity analysis
        if (data.type === "risk_analysis") {
          setRiskAnalysis(
            data.data || {}
          );
        }

        if (data.type === "error") {
          console.error(
            "❌ Backend:",
            data.message
          );
        }

      } catch (error) {
        console.error(
          "❌ Message error:",
          error
        );
      }
    };

    socket.onerror = error => {
      console.error(
        "❌ WebSocket error:",
        error
      );

      setConnected(false);
    };

    socket.onclose = () => {
      console.log(
        "🔴 WebSocket closed"
      );

      setConnected(false);
    };

    return () => {
      try {
        socket.close();
      } catch {}
    };
  }, []);


  const sendJSON = data => {
    const socket = socketRef.current;

    if (
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      socket.send(
        JSON.stringify(data)
      );
    }
  };


  const handleAudio = event => {
    const data = event.data;

    if (
      !data ||
      data.type !== "audio"
    ) {
      return;
    }

    const socket = socketRef.current;

    if (
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      socket.send(data.pcm);
    }

    const rms = data.rms;

    if (rms > SPEECH_THRESHOLD) {
      if (!speechActiveRef.current) {
        speechActiveRef.current = true;

        sendJSON({
          type: "SPEECH_START",
        });
      }

      if (silenceTimerRef.current) {
        clearTimeout(
          silenceTimerRef.current
        );

        silenceTimerRef.current = null;
      }

      return;
    }

    if (
      speechActiveRef.current &&
      !silenceTimerRef.current
    ) {
      silenceTimerRef.current =
        setTimeout(() => {
          speechActiveRef.current = false;

          sendJSON({
            type: "SPEECH_END",
          });

          silenceTimerRef.current = null;
        }, SILENCE_TIMEOUT);
    }
  };


  const startListening = async () => {
    try {
      stopSpeaking();

      if (
        !socketRef.current ||
        socketRef.current.readyState !==
          WebSocket.OPEN
      ) {
        alert(
          "Backend is not connected."
        );

        return;
      }

      setTranscriptHistory([]);
      setLiveTranscript("");
      setTranslations({});

      setRiskAnalysis({
        risk_level: "low",
        risk_score: 0,
        risk_terms: [],
        risk_categories: [],
        ambiguity: false,
        ambiguity_score: 0,
        ambiguous_terms: [],
        ambiguity_categories: [],
        uncertainty: false,
        uncertainty_terms: [],
        attribution_risk: false,
        attribution_terms: [],
        escalatory_language: false,
        escalatory_terms: [],
      });

      setSourceLanguage({
        code: selectedInputLanguage,
        name:
          inputLanguageNames[
            selectedInputLanguage
          ],
      });

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

      streamRef.current = stream;

      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      const audioContext =
        new AudioContext({
          sampleRate: 16000,
        });

      audioContextRef.current =
        audioContext;

      if (
        audioContext.state ===
        "suspended"
      ) {
        await audioContext.resume();
      }

      console.log(
        "🔊 Sample rate:",
        audioContext.sampleRate
      );

      sendJSON({
        type: "AUDIO_CONFIG",
        sample_rate:
          audioContext.sampleRate,
      });

      sendJSON({
        type: "SOURCE_LANGUAGE",
        language:
          selectedInputLanguage,
      });

      await audioContext.audioWorklet.addModule(
        "/pcm-processor.js"
      );

      const source =
        audioContext.createMediaStreamSource(
          stream
        );

      sourceRef.current = source;

      const worklet =
        new AudioWorkletNode(
          audioContext,
          "pcm-processor"
        );

      workletRef.current = worklet;

      worklet.port.onmessage =
        handleAudio;

      const silentGain =
        audioContext.createGain();

      silentGain.gain.value = 0;

      source.connect(worklet);

      worklet.connect(
        silentGain
      );

      silentGain.connect(
        audioContext.destination
      );

      setListening(true);

      console.log(
        "🟢 MICROPHONE LISTENING"
      );

    } catch (error) {
      console.error(
        "❌ Microphone error:",
        error
      );

      alert(
        "Could not access microphone. Please allow microphone permission."
      );

      stopListening();
    }
  };


  const stopListening = async () => {
    stopSpeaking();

    if (
      silenceTimerRef.current
    ) {
      clearTimeout(
        silenceTimerRef.current
      );

      silenceTimerRef.current = null;
    }

    speechActiveRef.current =
      false;

    sendJSON({
      type: "STOP_RECORDING",
    });

    if (workletRef.current) {
      try {
        workletRef.current.port.onmessage =
          null;

        workletRef.current.disconnect();
      } catch {}

      workletRef.current = null;
    }

    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch {}

      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        await audioContextRef.current.close();
      } catch {}

      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach(track =>
          track.stop()
        );

      streamRef.current = null;
    }

    setListening(false);
  };


  const changeInputLanguage =
    languageCode => {
      setSelectedInputLanguage(
        languageCode
      );

      setSourceLanguage({
        code: languageCode,
        name:
          inputLanguageNames[
            languageCode
          ],
      });

      sendJSON({
        type: "SOURCE_LANGUAGE",
        language: languageCode,
      });
    };


  const toggleLanguage =
    language => {
      setSelectedLanguages(
        current => {
          if (
            current.includes(language)
          ) {
            return current.filter(
              item =>
                item !== language
            );
          }

          return [
            ...current,
            language,
          ];
        }
      );
    };


  const goToSection = section => {
    setActiveSection(section);

    if (section === "settings") {
      setShowSettings(true);
      return;
    }

    if (section === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(`section-${section}`);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const increaseFont = () => {
    setFontScale(current => Math.min(current + 0.1, 1.5));
  };

  const decreaseFont = () => {
    setFontScale(current => Math.max(current - 0.1, 0.8));
  };

  const resetFont = () => {
    setFontScale(1);
  };

  const toggleTheme = () => {
    setDarkMode(current => !current);
  };

  const handlePortalLanguage = language => {
    setPortalLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  };

  const handlePortalSearch = event => {
    event.preventDefault();

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return;
    }

    const sectionMap = [
      ["risk", ["risk", "analysis", "जोखिम", "مخاطر"]],
      ["diplomatic", ["diplomatic", "assistance", "राजनयिक", "دبلوماسية"]],
      ["realtime", ["real-time", "interpretation", "translation", "व्याख्या", "الترجمة"]],
      ["settings", ["setting", "configuration", "सेटिंग", "إعدادات"]],
      ["home", ["home", "होम", "الرئيسية"]],
    ];

    const match = sectionMap.find(([, words]) =>
      words.some(word => query.includes(word))
    );

    if (match) {
      goToSection(match[0]);
    } else {
      const content = document.querySelector(".portal-main");
      const textContent = content?.innerText.toLowerCase() || "";

      if (textContent.includes(query)) {
        const firstMatch = Array.from(
          content.querySelectorAll("section, article, h1, h2, h3, p")
        ).find(node =>
          node.textContent.toLowerCase().includes(query)
        );

        firstMatch?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        alert(`No portal section found for "${searchQuery}".`);
      }
    }
  };

  const visibleTranslations =
    languages
      .filter(language =>
        selectedLanguages.includes(
          language
        )
      )
      .map(language => ({
        language,
        text:
          translations[language] ||
          "",
        risk:
          language === "Arabic"
            ? "MEDIUM"
            : "LOW",
      }));

  const riskClass =
    riskAnalysis.risk_level === "high"
      ? "risk-high"
      : riskAnalysis.risk_level === "medium-high"
        ? "risk-medium-high"
        : riskAnalysis.risk_level === "medium"
          ? "risk-medium"
          : "risk-low";

  const riskLabel =
    (riskAnalysis.risk_level || "low")
      .replace("-", " ")
      .toUpperCase();

  const languageFlags = {
    English: "🇬🇧",
    Hindi: "🇮🇳",
    French: "🇫🇷",
    Arabic: "🇸🇦",
    Spanish: "🇪🇸",
  };

  const languageCodes = {
    English: "en",
    Hindi: "hi",
    French: "fr",
    Arabic: "ar",
    Spanish: "es",
  };

  return (
    <div
      className={`sugam-shell ${darkMode ? "theme-dark" : "theme-light"}`}
      style={{
        fontSize: `${fontScale}em`,
        "--portal-font-scale": fontScale,
      }}
    >
      <style>{`
        .theme-dark {
          background: #071827 !important;
          color: #e8f0f8 !important;
        }
        .theme-dark .hero-header,
        .theme-dark .portal-nav,
        .theme-dark .government-card,
        .theme-dark .control-panel,
        .theme-dark .listen-panel,
        .theme-dark .risk-panel,
        .theme-dark .portal-footer {
          background: #0d2235 !important;
          color: #e8f0f8 !important;
        }
        .theme-dark .portal-nav {
          border-color: #27445d !important;
        }
        .theme-dark h1,
        .theme-dark h2,
        .theme-dark h3,
        .theme-dark p,
        .theme-dark span,
        .theme-dark label {
          color: inherit;
        }
        .theme-dark .gov-select,
        .theme-dark .language-select-box,
        .theme-dark .transcript-box,
        .theme-dark .detected-box,
        .theme-dark .translation-content {
          background: #102b42 !important;
          color: #edf5fb !important;
          border-color: #38556d !important;
        }
        .theme-dark .scroll-header {
          background: #0b1e31 !important;
          color: #eef5fa !important;
          border-color: #2b4962 !important;
        }
        .theme-dark .scroll-search {
          background: #102b42 !important;
          border-color: #45627a !important;
        }
        .theme-dark .scroll-search select,
        .theme-dark .scroll-search input {
          background: #102b42 !important;
          color: #fff !important;
        }
        .theme-dark .settings-panel {
          background: #102b42 !important;
          color: #fff !important;
        }
        .settings-overlay {
          position: fixed;
          inset: 0;
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0,0,0,.52);
        }
        .settings-panel {
          width: min(560px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: #fff;
          color: #102f56;
          border-radius: 16px;
          padding: 26px;
          box-shadow: 0 20px 60px rgba(0,0,0,.28);
        }
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #d9e6f3;
          padding-bottom: 14px;
          margin-bottom: 20px;
        }
        .settings-header h2 { margin: 0; }
        .settings-close {
          border: 0;
          background: transparent;
          font-size: 28px;
          cursor: pointer;
        }
        .settings-group {
          margin: 20px 0;
        }
        .settings-group h3 {
          margin: 0 0 10px;
        }
        .settings-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .settings-row button,
        .settings-select {
          border: 1px solid #b8cbe0;
          background: #f4f8fc;
          color: #123b67;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
        }
        .settings-row button.selected {
          background: #1765b5;
          color: white;
          border-color: #1765b5;
        }
        .settings-select {
          width: 100%;
        }
        .portal-nav .nav-item {
          cursor: pointer;
        }
        .gov-tools button,
        .scroll-tools button {
          cursor: pointer;
          border: 0;
          background: transparent;
        }
        .india-gov-logo {
          width: 190px;
          height: 58px;
          max-width: 190px;
          max-height: 58px;
          object-fit: contain;
          object-position: left center;
          display: block;
        }
        .scroll-logo {
          width: 210px;
          min-width: 210px;
          height: 64px;
          display: flex;
          align-items: center;
          text-decoration: none;
          overflow: hidden;
        }
        .scroll-logo img {
          width: 190px !important;
          height: 58px !important;
          max-width: 190px !important;
          max-height: 58px !important;
          object-fit: contain !important;
        }
        .scroll-search {
          flex: 1;
        }
        .scroll-search-form {
          display: flex;
          width: 100%;
          align-items: center;
        }
        .scroll-search-input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          padding: 12px;
          color: inherit;
          font: inherit;
        }
        .scroll-search-form select {
          border: 0;
          border-left: 1px solid #d5dce5;
          background: transparent;
          padding: 12px;
          color: inherit;
        }
        .scroll-search-form button {
          height: 100%;
        }
        @media (max-width: 1000px) {
          .scroll-tools {
            display: none !important;
          }
          .scroll-logo {
            min-width: 180px;
            width: 180px;
          }
          .india-gov-logo {
            width: 165px;
          }
        }
        @media (max-width: 700px) {
          .scroll-header {
            height: auto !important;
          }
          .scroll-header-inner {
            padding: 8px 0;
            gap: 10px !important;
          }
          .scroll-logo {
            min-width: 145px;
            width: 145px;
          }
          .scroll-logo img {
            width: 140px !important;
          }
          .scroll-search-form select {
            display: none;
          }
        }
      `}</style>
            {/* Compact header shown while scrolling */}
      {scrolled && (
        <div className="scroll-header">
          <div className="scroll-header-inner">

            <a
              href="https://www.india.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="scroll-logo"
              aria-label="Open National Portal of India"
            >
              <img
                src="https://www.india.gov.in/image/npi_logo.svg"
                alt="National Portal of India"
                className="india-gov-logo"
              />
            </a>

            <div className="scroll-search">
              <form className="scroll-search-form" onSubmit={handlePortalSearch}>
                <span>⌕</span>

                <input
                  className="scroll-search-input"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder={t.searchHere}
                  aria-label={t.searchHere}
                />

                <select defaultValue="All Categories" aria-label={t.allCategories}>
                  <option>{t.allCategories}</option>
                  <option>Government</option>
                  <option>Services</option>
                  <option>Information</option>
                </select>

                <button type="submit">{t.search}</button>
              </form>
            </div>

            <div className="scroll-tools">
              <button type="button" onClick={() => goToSection("home")}>
                Skip to main content
              </button>
              <span>|</span>
              <button type="button" onClick={decreaseFont} title="Decrease text size">A-</button>
              <span>|</span>
              <button type="button" onClick={increaseFont} title="Increase text size">A+</button>
              <span>|</span>
              <button type="button" onClick={toggleTheme} title="Toggle light and dark mode">
                {darkMode ? "☀" : "◐"}
              </button>
              <span>|</span>
              <button type="button" onClick={() => setShowSettings(true)}>⚙</button>
              <span>|</span>

              <div className="scroll-tricolor" aria-label="Indian tricolour">
                <i />
                <i />
                <i />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Government top bar */}
      <div className="gov-strip">
        <div className="portal-width gov-strip-inner">
          <span>भारत सरकार | Government of India</span>

          <div className="gov-tools">
            <button type="button" onClick={decreaseFont} title="Decrease text size">A-</button>
            <button type="button" onClick={resetFont} title="Reset text size">A</button>
            <button type="button" onClick={increaseFont} title="Increase text size">A+</button>
            <span>|</span>
            <button type="button" onClick={() => handlePortalLanguage("hi")}>Hindi</button>
            <span>|</span>
            <button type="button" onClick={() => handlePortalLanguage("en")}>English</button>
            <span>|</span>
            <button
              type="button"
              className="profile-icon"
              onClick={() => setShowSettings(true)}
              aria-label="Open settings"
            >
              ◉
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <header className="hero-header">
        <div className="portal-width hero-inner">

          <div className="pm-section">
            <div className="pm-image">
              <img
                src="https://pmopg.gov.in/CitizenReforms/Content/NewLogin/images/pm-modi.png"
                alt="Prime Minister of India"
                style={{
                  maxWidth: "190px",
                  maxHeight: "220px",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  objectPosition: "bottom center",
                }}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="pm-text">
              <h2>NARENDRA MODI</h2>
              <p>Prime Minister of India</p>

              <div className="quote">
                “Sabka Saath<br />
                Sabka Vikas<br />
                Sabka Vishwas<br />
                Sabka Prayas”
              </div>
            </div>
          </div>

          <div className="brand-section">
       

           <img
              src="https://pmopg.gov.in/CitizenReforms/Content/NewLogin/images/pmo-logo.png"
              alt="Government of India emblem"
              className="ashoka-image"
            />

            <div className="government-title">
              Government of India
            </div>

            <h1>Sugam Samvaad</h1>

            <div className="brand-tricolor">
              <span />
              <span />
              <span />
            </div>

            <h3>
              National Real-Time Multilingual Interpretation Portal
            </h3>

            <p>
              Seamless Communication for a Stronger, More Connected World
            </p>
          </div>

          <div className="hero-right">
            <div className="vasudhaiva">
              Vasudhaiva<br />
              Kutumbakam
            </div>

            <div className="world-family">
              The World is One Family
            </div>

            <div className="india-flag">🇮🇳</div>
          </div>

        </div>
      </header>

      {/* Navigation */}
      <nav className="portal-nav">
        <div className="portal-width nav-inner">

          <button
            className={`nav-item ${activeSection === "home" ? "active" : ""}`}
            onClick={() => goToSection("home")}
          >
            <span className="nav-icon">⌂</span>
            {t.home}
          </button>

          <button
            className={`nav-item ${activeSection === "realtime" ? "active" : ""}`}
            onClick={() => goToSection("realtime")}
          >
            <span className="nav-icon">◎</span>
            {t.realtime}
          </button>

          <button
            className={`nav-item ${activeSection === "diplomatic" ? "active" : ""}`}
            onClick={() => goToSection("diplomatic")}
          >
            <span className="nav-icon">♢</span>
            {t.diplomatic}
          </button>

          <button
            className={`nav-item ${activeSection === "risk" ? "active" : ""}`}
            onClick={() => goToSection("risk")}
          >
            <span className="nav-icon">▥</span>
            {t.risk}
          </button>

          <button
            className={`nav-item ${activeSection === "settings" ? "active" : ""}`}
            onClick={() => goToSection("settings")}
          >
            <span className="nav-icon">⚙</span>
            {t.settings}
          </button>

        </div>
      </nav>

      <main id="section-home" className="portal-width portal-main">

        {/* Main controls */}
        <section id="section-realtime" className="control-panel">

          <div className="control-column">

            <div className="control-heading">
              <span className="control-icon">♩</span>

              <div>
                <h3>{t.speaker}</h3>
              </div>
            </div>

            <select
              value={selectedInputLanguage}
              onChange={(event) =>
                changeInputLanguage(event.target.value)
              }
              className="gov-select"
            >
              {Object.entries(inputLanguageNames).map(
                ([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                )
              )}
            </select>

            <p className="helper-text">
              Select the language spoken by the speaker
            </p>

          </div>

          <div className="mic-zone">

            <button
              className={`big-mic ${
                listening ? "recording" : ""
              }`}
              onClick={
                listening
                  ? stopListening
                  : startListening
              }
              aria-label={
                listening
                  ? "Stop listening"
                  : "Start listening"
              }
            >
              {listening ? "■" : "🎙"}
            </button>

            <strong>
              {listening
                ? t.stop
                : t.start}
            </strong>

            <span>
              {listening
                ? "Microphone is active"
                : "Ready for live interpretation"}
            </span>

          </div>

          <div className="control-column">

            <div className="control-heading">
              <span className="control-icon">◎</span>

              <div>
                <h3>
                  {t.target}
                  <small> (Select multiple)</small>
                </h3>
              </div>
            </div>

            <div className="language-select-box">

              {languages.map((language) => (
                <button
                  key={language}
                  className={`language-chip ${
                    selectedLanguages.includes(language)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    toggleLanguage(language)
                  }
                >
                  {language}

                  {selectedLanguages.includes(language) && (
                    <b>×</b>
                  )}
                </button>
              ))}

            </div>

            <p className="helper-text">
              Choose one or more languages for translation
            </p>

          </div>

        </section>

        {/* Listening language */}
        <section className="listen-panel">

          <div className="listen-heading">
            🔊

            <div>
              <h3>{t.listening}</h3>

              <p>
                Choose the language you want to hear
                through the interpreter.
              </p>
            </div>
          </div>

          <select
            value={listeningLanguage}
            onChange={(event) =>
              setListeningLanguage(event.target.value)
            }
            className="gov-select listening-select"
          >
            {languages.map((language) => (
              <option
                key={language}
                value={languageCodes[language]}
              >
                {language}
              </option>
            ))}
          </select>

          <div className="speech-status">

            <span
              className={
                speaking
                  ? "speaking-dot active"
                  : "speaking-dot"
              }
            />

            {speaking
              ? "Speaking"
              : "Not speaking"}

            {speaking && (
              <button
                className="stop-speech"
                onClick={stopSpeaking}
              >
                Stop Speech
              </button>
            )}

          </div>

        </section>

        {/* Live information */}
        <section className="dashboard-grid">

          <div className="government-card transcript-card">

            <div className="card-title-row">

              <div>
                <span className="card-icon">▤</span>
                <h3>{t.transcript}</h3>
              </div>

              {listening && (
                <span className="live-label">
                  <i />
                  LIVE
                </span>
              )}

            </div>

            <div
              className={`transcript-box ${
                !liveTranscript &&
                transcriptHistory.length === 0
                  ? "empty"
                  : ""
              }`}
            >

              {transcriptHistory.map(
                (sentence, index) => (
                  <p key={`${sentence}-${index}`}>
                    {sentence}
                  </p>
                )
              )}

              {liveTranscript && (
                <p className="live-transcript">
                  {liveTranscript}
                </p>
              )}

              {!liveTranscript &&
                transcriptHistory.length === 0 && (
                  <p>Listening...</p>
                )}

            </div>

          </div>

          <div className="government-card">

            <div className="card-title-row">
              <div>
                <span className="card-icon">▥</span>
                <h3>{t.source}</h3>
              </div>
            </div>

            <div className="detected-box">

              <strong>
                {sourceLanguage.name}
              </strong>

              <span>
                {sourceLanguage.code.toUpperCase()}
              </span>

            </div>

          </div>

          <div className="government-card">

            <div className="card-title-row">
              <div>
                <span className="card-icon">◉</span>
                <h3>{t.connection}</h3>
              </div>
            </div>

            <div className="connection-large">

              <span
                className={
                  connected
                    ? "connected-dot"
                    : "disconnected-dot"
                }
              />

              <strong>
                {connected
                  ? t.connected
                  : t.disconnected}
              </strong>

            </div>

            <p className="secure-text">
              Secure WebSocket Connection
            </p>

          </div>

        </section>

        {/* Translations */}
        <section id="section-diplomatic" className="government-card translations-panel">

          <div className="section-title">

            <span className="card-icon">文</span>

            <div>
              <h3>{t.translations}</h3>

              <p>
                Simultaneous multilingual
                interpretation output
              </p>
            </div>

          </div>

          {visibleTranslations.length === 0 ? (

            <div className="empty-selection">
              Select at least one target language.
            </div>

          ) : (

            <div className="translation-grid">

              {visibleTranslations.map((item) => {

                const code =
                  languageCodes[item.language];

                return (
                  <article
                    className="translation-card"
                    key={item.language}
                  >

                    <div className="translation-heading">

                      <strong>
                        {languageFlags[item.language]}{" "}
                        {item.language}
                      </strong>

                      <button
                        className="speaker-button"
                        disabled={!item.text}
                        onClick={() =>
                          speakTranslation(
                            item.text,
                            code
                          )
                        }
                        aria-label={`Speak ${item.language} translation`}
                      >
                        🔊
                      </button>

                    </div>

                    <div className="translation-content">
                      {item.text ||
                        "Translation will appear here..."}
                    </div>

                  </article>
                );

              })}

            </div>

          )}

        </section>

        {/* Risk */}
        <section id="section-risk" className="risk-panel">

          <div className="risk-header">

            <div className="risk-title">

              <span className="warning-icon">
                !
              </span>

              <div>
                <h3>{t.riskTitle}</h3>

                <p>
                  AI-assisted analysis of the latest
                  finalized statement
                </p>
              </div>

            </div>

            <span
              className={`risk-main-badge ${riskClass}`}
            >
              <i />
              {riskLabel}
            </span>

          </div>

          <div className="risk-overview">

            <div>
              <span>Risk Score</span>
              <strong>
                {riskAnalysis.risk_score || 0}
              </strong>
            </div>

            <div>
              <span>Ambiguity</span>
              <strong>
                {riskAnalysis.ambiguity
                  ? "Detected"
                  : "None detected"}
              </strong>
            </div>

            <div>
              <span>Uncertainty</span>
              <strong>
                {riskAnalysis.uncertainty
                  ? "Detected"
                  : "None detected"}
              </strong>
            </div>

            <div>
              <span>Attribution Risk</span>
              <strong>
                {riskAnalysis.attribution_risk
                  ? "Detected"
                  : "None detected"}
              </strong>
            </div>

            <div>
              <span>Escalatory Language</span>
              <strong>
                {riskAnalysis.escalatory_language
                  ? "Detected"
                  : "None detected"}
              </strong>
            </div>

          </div>

        </section>

      </main>

      {showSettings && (
        <div
          className="settings-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t.settings}
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setShowSettings(false);
            }
          }}
        >
          <div className="settings-panel">
            <div className="settings-header">
              <h2>{t.settings}</h2>
              <button
                type="button"
                className="settings-close"
                onClick={() => setShowSettings(false)}
                aria-label={t.close}
              >
                ×
              </button>
            </div>

            <div className="settings-group">
              <h3>{t.accessibility}</h3>

              <div className="settings-row">
                <button type="button" onClick={decreaseFont}>A-</button>
                <button type="button" onClick={resetFont}>A</button>
                <button type="button" onClick={increaseFont}>A+</button>
              </div>
            </div>

            <div className="settings-group">
              <h3>{t.language}</h3>

              <select
                className="settings-select"
                value={portalLanguage}
                onChange={event => handlePortalLanguage(event.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            <div className="settings-group">
              <h3>Appearance</h3>

              <div className="settings-row">
                <button
                  type="button"
                  className={!darkMode ? "selected" : ""}
                  onClick={() => setDarkMode(false)}
                >
                  ☀ {t.light}
                </button>

                <button
                  type="button"
                  className={darkMode ? "selected" : ""}
                  onClick={() => setDarkMode(true)}
                >
                  ◐ {t.dark}
                </button>
              </div>
            </div>

            <div className="settings-group">
              <h3>Translation languages</h3>

              <div className="settings-row">
                {languages.map(language => (
                  <button
                    key={language}
                    type="button"
                    className={selectedLanguages.includes(language) ? "selected" : ""}
                    onClick={() => toggleLanguage(language)}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="portal-footer">

        <div className="portal-width footer-inner">

          <div className="nic">
            <span>Ayush Singh</span>

            
          </div>

          <div className="footer-text">

            <strong>Sugam Samvaad</strong>

            <span>
              This project is developed as a prototype
              for real-time multilingual interpretation.
            </span>

            <span>
              Inspired by Digital India and the vision
              of a more connected world.
            </span>

          </div>

          <div className="digital-india">
            <strong>Digital India</strong>
            <span>Power To Empower</span>
          </div>

          <div className="footer-government">
            ☸

            <span>
              भारत सरकार<br />
              Government of India
            </span>
          </div>

        </div>

      </footer>

    </div>
  );


}
export default App;