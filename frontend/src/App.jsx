import { useEffect, useRef, useState } from "react";
import ConnectionLoader from "./components/ConnectionLoader";
import LoginPage from "./components/LoginPage";
import PortalHeader from "./components/PortalHeader";
import PortalNavigation from "./components/PortalNavigation";
import SettingsModal from "./components/SettingsModal";
import WorkspaceDashboard from "./components/WorkspaceDashboard";
import SessionHome from "./components/SessionHome";
import MultiDeviceRoom from "./components/MultiDeviceRoom";
import { createWebSocket } from "./services/websocket";
import "./App.css";
import { API_BASE } from "./config";



function App() {
  const [loggedUser, setLoggedUser] = useState(() => {
    const savedUser = localStorage.getItem("sugamSamvadUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [listening, setListening] = useState(false);
  const [connected, setConnected] = useState(false);
  const [backendStatus, setBackendStatus] = useState("connecting");

  const [activeSection, setActiveSection] = useState("home");
  const [activeSession, setActiveSession] = useState(null);
  const [guestSessionMode, setGuestSessionMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [portalLanguage, setPortalLanguage] = useState("en");
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [scrolled, setScrolled] = useState(false);

  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [sessionHistory, setSessionHistory] = useState([]);

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
    "Spanish",
    "Russian",
    "Italian",
    "Japanese",
    "German",
    "Hebrew",
  ]);

  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const workletRef = useRef(null);
  const speechActiveRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const listeningLanguageRef = useRef("en");
  const speechQueueRef = useRef([]);
  const speechPlayingRef = useRef(false);

  const speechLanguageCodes = {
    en: "en-US",
    hi: "hi-IN",
    fr: "fr-FR",
    ar: "ar-SA",
    es: "es-ES",
    ru: "ru-RU",
    it: "it-IT",
    ja: "ja-JP",
    de: "de-DE",
    he: "he-IL",
  };

const speakTranslation = (text, languageCode) => {
  if (!text || !window.speechSynthesis) {
    return;
  }

  // Add the new translation to the queue
  speechQueueRef.current.push({
    text,
    languageCode,
  });

  // If something is already speaking,
  // wait until it finishes.
  if (speechPlayingRef.current) {
    return;
  }

  playNextSpeech();
};


const playNextSpeech = () => {
  if (!window.speechSynthesis) {
    return;
  }

  // Nothing left in the queue
  if (speechQueueRef.current.length === 0) {
    speechPlayingRef.current = false;
    setSpeaking(false);
    return;
  }

  const nextSpeech =
    speechQueueRef.current.shift();

  const {
    text,
    languageCode,
  } = nextSpeech;

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
        v.lang.startsWith(languageCode)
    );

  if (!voice) {
    console.warn(
      `⚠️ No TTS voice available for ${languageCode}`
    );

    // Continue with the next item
    playNextSpeech();
    return;
  }

  const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    speechPlayingRef.current = true;
    setSpeaking(true);

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
      console.log("✅ Speech finished");

      // Small gap between sentences
      setTimeout(() => {
        playNextSpeech();
      }, 150);
    };

    utterance.onerror = () => {
      console.warn("⚠️ Speech error");

      setTimeout(() => {
        playNextSpeech();
      }, 150);
    };

    window.speechSynthesis.speak(
      utterance
    );
  };


const stopSpeaking = () => {
    speechQueueRef.current = [];
    speechPlayingRef.current = false;

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
    "Russian",
    "Italian",
    "Japanese",
    "German",
    "Hebrew",
  ];

  // Source language names
  const inputLanguageNames = {
    auto: "Auto Detect",
    en: "English",
    hi: "Hindi",
    fr: "French",
    ar: "Arabic",
    es: "Spanish",
    ru: "Russian",
    it: "Italian",
    ja: "Japanese",
    de: "German",
    he: "Hebrew",
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
      multiDevice: "Multi-Device Sessions",
    },
    hi: {
      home: "होम",
      realtime: "रियल-टाइम व्याख्या",
      multiDevice: "मल्टी-डिवाइस सत्र",
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
    let isMounted = true;
    let reconnectTimer = null;
    let socket = null;

    const connectSocket = () => {
      if (!isMounted) {
        return;
      }

      setConnected(false);
      setBackendStatus("connecting");

      socket = createWebSocket({
        onOpen: () => {
          if (!isMounted) {
            return;
          }

          console.log("✅ Connected to backend");
          setConnected(true);
          setBackendStatus("connected");
        },

        onMessage: event => {
          try {
            const data = JSON.parse(event.data);

            console.log("📩 Backend:", data);

            if (data.type === "connection") {
              console.log(data.message);
            }

            if (data.type === "partial_transcript") {
              setLiveTranscript(data.text || "");
            }

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

            if (
              data.type === "translations" ||
              data.type === "partial_translations"
            ) {
              setTranslations(previous => ({
                ...previous,
                ...(data.translations || {}),
              }));

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
        },

        onError: error => {
          console.error(
            "❌ WebSocket error:",
            error
          );

          if (isMounted) {
            setConnected(false);
            setBackendStatus("connecting");
          }
        },

        onClose: () => {
          if (!isMounted) {
            return;
          }

          console.log(
            "🔴 WebSocket closed"
          );

          setConnected(false);
          setBackendStatus("connecting");

          reconnectTimer = window.setTimeout(() => {
            connectSocket();
          }, 2000);
        },
      });

      socketRef.current = socket;
    };

    connectSocket();

    return () => {
      isMounted = false;

      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }

      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (error) {
          void error;
        }
      }
    };
  // The socket is intentionally created once; mutable refs provide current runtime state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        return;
      }

      sendJSON({
        type: "SESSION_START",
        user_id: loggedUser?.id,
        source_language: selectedInputLanguage,
        target_languages: selectedLanguages,
      });

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
      } catch (error) {
        void error;
      }

      workletRef.current = null;
    }

    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (error) {
        void error;
      }

      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        await audioContextRef.current.close();
      } catch (error) {
        void error;
      }

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

    if (section === "multi-device") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

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

  const showBackendLoader = backendStatus !== "connected";

  useEffect(() => {
    if (loggedUser) {
      localStorage.setItem("sugamSamvadUser", JSON.stringify(loggedUser));
    } else {
      localStorage.removeItem("sugamSamvadUser");
    }
  }, [loggedUser]);

  useEffect(() => {
    const loadSessionHistory = async () => {
      if (!loggedUser?.id) {
        setSessionHistory([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/sessions?user_id=${loggedUser.id}`);

        if (!response.ok) {
          throw new Error("Failed to load session history");
        }

        const data = await response.json();
        setSessionHistory(data.sessions || []);
      } catch (error) {
        console.error("Session history load failed", error);
      }
    };

    loadSessionHistory();
  }, [loggedUser?.id]);

  if (guestSessionMode) {
    if (activeSession) {
      return (
        <MultiDeviceRoom
          session={activeSession.session}
          participant={activeSession.participant}
          onLeave={() => {
            setActiveSession(null);
            setGuestSessionMode(false);
          }}
        />
      );
    }
    return (
      <SessionHome
        onSessionStarted={(data) => setActiveSession(data)}
        loggedUser={null}
        onBack={() => setGuestSessionMode(false)}
      />
    );
  }

  if (!loggedUser) {
    return (
      <LoginPage
        onLoginSuccess={setLoggedUser}
        onJoinSessionGuest={() => setGuestSessionMode(true)}
      />
    );
  }

  if (activeSession) {
    return (
      <div className={`sugam-shell ${darkMode ? "theme-dark" : "theme-light"}`} style={{ fontSize: `${fontScale}em` }}>
        <div className="logged-user-bar">
          <div className="logged-user-meta">
            <span className="logged-user-label">Signed in as</span>
            <strong>{loggedUser?.name || loggedUser?.email}</strong>
          </div>
          <button
            type="button"
            className="logged-user-signout"
            onClick={() => setActiveSession(null)}
          >
            ← Exit Session to Dashboard
          </button>
        </div>
        <MultiDeviceRoom
          session={activeSession.session}
          participant={activeSession.participant}
          onLeave={() => setActiveSession(null)}
        />
      </div>
    );
  }

  if (showBackendLoader) {
    return <ConnectionLoader backendStatus={backendStatus} />;
  }

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
    Russian: "🇷🇺",
    Italian: "🇮🇹",
    Japanese: "🇯🇵",
    German: "🇩🇪",
    Hebrew: "🇮🇱",
  };

  const languageCodes = {
    English: "en",
    Hindi: "hi",
    French: "fr",
    Arabic: "ar",
    Spanish: "es",
    Russian: "ru",
    Italian: "it",
    Japanese: "ja",
    German: "de",
    Hebrew: "he",
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

      <div className="logged-user-bar">
        <div className="logged-user-meta">
          <span className="logged-user-label">Signed in as</span>
          <strong>{loggedUser?.name || loggedUser?.email}</strong>
        </div>

        <button
          type="button"
          className="logged-user-signout"
          onClick={() => setLoggedUser(null)}
        >
          Sign out
        </button>
      </div>

      <PortalHeader
        scrolled={scrolled}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        t={t}
        goToSection={goToSection}
        decreaseFont={decreaseFont}
        increaseFont={increaseFont}
        toggleTheme={toggleTheme}
        setShowSettings={setShowSettings}
        handlePortalLanguage={handlePortalLanguage}
        darkMode={darkMode}
        resetFont={resetFont}
        handlePortalSearch={handlePortalSearch}
      />

      <PortalNavigation activeSection={activeSection} goToSection={goToSection} t={t} />

      {activeSection === "multi-device" ? (
        <SessionHome
          onSessionStarted={(data) => setActiveSession(data)}
          loggedUser={loggedUser}
          onBack={() => setActiveSection("home")}
        />
      ) : (
        <>
          <div className="portal-width" style={{ margin: "20px auto 0" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #073b70 0%, #1765b5 100%)",
                borderRadius: 14,
                padding: "16px 24px",
                color: "white",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                boxShadow: "0 6px 18px rgba(7, 59, 112, 0.15)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  🌐 Multi-Device Diplomatic Room
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: 13, opacity: 0.9 }}>
                  Connect multiple devices to the same session with real-time bidirectional interpretation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToSection("multi-device")}
                style={{
                  background: "white",
                  color: "#073b70",
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "10px 18px",
                  borderRadius: 8,
                  border: 0,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                Launch Multi-Device Session →
              </button>
            </div>
          </div>

          <WorkspaceDashboard
            t={t}
            listening={listening}
            selectedInputLanguage={selectedInputLanguage}
            changeInputLanguage={changeInputLanguage}
            inputLanguageNames={inputLanguageNames}
            startListening={startListening}
            stopListening={stopListening}
            languages={languages}
            selectedLanguages={selectedLanguages}
            toggleLanguage={toggleLanguage}
            listeningLanguage={listeningLanguage}
            setListeningLanguage={setListeningLanguage}
            languageCodes={languageCodes}
            speaking={speaking}
            stopSpeaking={stopSpeaking}
            liveTranscript={liveTranscript}
            transcriptHistory={transcriptHistory}
            sourceLanguage={sourceLanguage}
            connected={connected}
            visibleTranslations={visibleTranslations}
            languageFlags={languageFlags}
            languageCodesMap={languageCodes}
            speakTranslation={speakTranslation}
            riskAnalysis={riskAnalysis}
            riskClass={riskClass}
            riskLabel={riskLabel}
            sessionHistory={sessionHistory}
          />
        </>
      )}

      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        t={t}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        portalLanguage={portalLanguage}
        handlePortalLanguage={handlePortalLanguage}
        languages={languages}
        selectedLanguages={selectedLanguages}
        toggleLanguage={toggleLanguage}
        decreaseFont={decreaseFont}
        resetFont={resetFont}
        increaseFont={increaseFont}
      />

      <footer className="portal-footer">
        <div className="portal-width footer-inner">
          <div className="nic">
            <span>Ayush Singh</span>
          </div>

          <div className="footer-text">
            <strong>Sugam Samvaad</strong>

            <span>
              This project is developed as a prototype for real-time multilingual interpretation.
            </span>

            <span>
              Inspired by Digital India and the vision of a more connected world.
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