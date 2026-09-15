import { useState, useEffect, useRef } from "react";
import { createSessionWebSocket } from "../services/websocket";

const LANGUAGE_META = {
  en: { name: "English", flag: "🇬🇧", voiceCode: "en-US" },
  hi: { name: "Hindi", flag: "🇮🇳", voiceCode: "hi-IN" },
  fr: { name: "French", flag: "🇫🇷", voiceCode: "fr-FR" },
  ar: { name: "Arabic", flag: "🇸🇦", voiceCode: "ar-SA" },
  es: { name: "Spanish", flag: "🇪🇸", voiceCode: "es-ES" },
  ru: { name: "Russian", flag: "🇷🇺", voiceCode: "ru-RU" },
  it: { name: "Italian", flag: "🇮🇹", voiceCode: "it-IT" },
  ja: { name: "Japanese", flag: "🇯🇵", voiceCode: "ja-JP" },
  de: { name: "German", flag: "🇩🇪", voiceCode: "de-DE" },
  he: { name: "Hebrew", flag: "🇮🇱", voiceCode: "he-IL" },
};

const SAMPLE_PHRASES = [
  {
    en: "We propose a bilateral trade agreement with a 15% tariff reduction.",
    hi: "हम 15% टैरिफ में कमी के साथ एक द्विपक्षीय व्यापार समझौते का प्रस्ताव करते हैं।",
    fr: "Nous proposons un accord commercial bilatéral avec une réduction tarifaire de 15%.",
    ar: "نقترح اتفاقية تجارية ثنائية مع خفض الرسوم الجمركية بنسبة 15٪.",
    es: "Proponemos un acuerdo comercial bilateral con una reducción arancelaria del 15%.",
    ru: "Мы предлагаем двустороннее торговое соглашение со снижением тарифов на 15%.",
    it: "Proponiamo un accordo commerciale bilaterale con una riduzione tariffaria del 15%.",
    ja: "15%の関税引き下げを伴う二国間貿易協定を提案します。",
    de: "Wir schlagen ein bilaterales Handelsabkommen mit einer Zollsenkung um 15 % vor.",
    he: "אנו מציעים הסכם סחר דו-צדדי עם הפחתת מכסים של 15%.",
  },
  {
    en: "We fully agree with this diplomatic proposal and support cooperation.",
    hi: "हम इस राजनयिक प्रस्ताव से पूरी तरह सहमत हैं और सहयोग का समर्थन करते हैं।",
    fr: "Nous sommes pleinement d'accord avec cette proposition diplomatique et soutenons la coopération.",
    ar: "نحن نتفق تمامًا مع هذا الاقتراح الدبلوماسي وندعم التعاون.",
    es: "Estamos totalmente de acuerdo con esta propuesta diplomática y apoyamos la cooperación.",
    ru: "Мы полностью согласны с этим дипломатическим предложением и поддерживаем сотрудничество.",
    it: "Siamo pienamente d'accordo con questa proposta diplomatica e sosteniamo la cooperazione.",
    ja: "私たちはこの外交提案に全面的に同意し、協力を支持します。",
    de: "Wir stimmen diesem diplomatischen Vorschlag voll und ganz zu und unterstützen die Zusammenarbeit.",
    he: "אנו מסכימים לחלוטין עם הצעה דיפלומטית זו ותומכים בשיתוף פעולה.",
  },
  {
    en: "This matter requires further bilateral review by our working delegation.",
    hi: "इस मामले में हमारे कार्य प्रतिनिधिमंडल द्वारा और द्विपक्षीय समीक्षा की आवश्यकता है।",
    fr: "Cette question nécessite un examen bilatéral approfondi par notre délégation de travail.",
    ar: "يتطلب هذا الأمر مزيدًا من المراجعة الثنائية من قبل وفد العمل لدينا.",
    es: "Este asunto requiere una mayor revisión bilateral por parte de nuestra delegación de trabajo.",
    ru: "Этот вопрос требует дальнейшего двустороннего рассмотрения нашей рабочей делегацией.",
    it: "Questa questione richiede un ulteriore riesame bilaterale da parte della nostra delegazione di lavoro.",
    ja: "この問題は、作業代表団によるさらなる二国間検討が必要です。",
    de: "Diese Angelegenheit bedarf einer weiteren bilateralen Prüfung durch unsere Arbeitsdelegation.",
    he: "עניין זה דורש בחינה דו-צדדית נוספת על ידי משלחת העבודה שלנו.",
  },
];

export default function MultiDeviceRoom({ session, participant, onLeave }) {
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [autoTts, setAutoTts] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);

  const socketRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const myLanguageCode = (participant?.participantLanguage || "en").toLowerCase();
  const myMeta = LANGUAGE_META[myLanguageCode] || LANGUAGE_META.en;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speech synthesis for received translations
  const speakText = (text, langCode, msgId = null) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const voiceCode = LANGUAGE_META[langCode]?.voiceCode || "en-US";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceCode;
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.lang === voiceCode) ||
      voices.find((v) => v.lang && v.lang.startsWith(langCode));

    if (voice) {
      utterance.voice = voice;
    }

    if (msgId) setSpeakingId(msgId);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Setup WebSocket connection
  useEffect(() => {
    if (!session?.sessionCode || !participant?.id) return;

    let isSubscribed = true;

    const socket = createSessionWebSocket(session.sessionCode, participant.id, {
      onOpen: () => {
        if (!isSubscribed) return;
        setSocketStatus("connected");
      },
      onMessage: (event) => {
        if (!isSubscribed) return;
        try {
          const data = JSON.parse(event.data);

          if (data.type === "session_connected") {
            if (data.activeParticipants) {
              setParticipants(data.activeParticipants);
            }
            if (Array.isArray(data.history) && data.history.length > 0) {
              const formattedHistory = data.history.map((item) => {
                const targetText =
                  item.translations?.[myLanguageCode] ||
                  item.translations?.[myMeta.name] ||
                  item.transcript;
                return {
                  id: item.id || Math.random().toString(),
                  sender: item.participantName || "Participant",
                  sourceLang: item.sourceLanguage || "en",
                  text: targetText,
                  originalText: item.transcript,
                  timestamp: item.createdAt || new Date().toISOString(),
                  isSelf: item.participantId === participant.id,
                  risk: item.riskAnalysis,
                };
              });
              setMessages(formattedHistory);
            }
          } else if (data.type === "participant_joined") {
            if (data.activeParticipants) {
              setParticipants(data.activeParticipants);
            }
          } else if (data.type === "participant_left") {
            if (data.activeParticipants) {
              setParticipants(data.activeParticipants);
            }
          } else if (data.type === "interpretation_received") {
            const isFromMe = data.from?.participantId === participant.id;
            const newMsg = {
              id: data.interpretationId || Math.random().toString(),
              sender: data.from?.participantName || "Participant",
              sourceLang: data.from?.sourceLanguage || "auto",
              text: data.translation || data.originalTranscript,
              originalText: data.originalTranscript,
              timestamp: data.timestamp || new Date().toISOString(),
              isSelf: isFromMe,
              risk: data.riskAnalysis,
            };

            setMessages((prev) => [...prev, newMsg]);

            if (autoTts && !isFromMe) {
              speakText(newMsg.text, myLanguageCode, newMsg.id);
            }
          } else if (data.type === "interpretation_sent") {
            // Already handled or reflected
          }
        } catch (err) {
          console.error("Session socket message error:", err);
        }
      },
      onError: () => {
        if (!isSubscribed) return;
        setSocketStatus("error");
      },
      onClose: () => {
        if (!isSubscribed) return;
        setSocketStatus("disconnected");
      },
    });

    socketRef.current = socket;

    // Keepalive ping every 25 seconds
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "keep_alive" }));
      }
    }, 25000);

    return () => {
      isSubscribed = false;
      clearInterval(pingInterval);
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [session?.sessionCode, participant?.id, myLanguageCode, autoTts]);

  // Setup Web Speech Recognition for live microphone input
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type or choose a quick diplomatic phrase below.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = myMeta.voiceCode || "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTrans = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          finalTrans += event.results[i][0].transcript;
        }
        setInputText(finalTrans);
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  // Helper to build translations for all known languages
  const buildTranslations = (text, sourceLang) => {
    // Check if matching sample phrase
    const match = SAMPLE_PHRASES.find(
      (p) =>
        p[sourceLang]?.toLowerCase().trim() === text.toLowerCase().trim() ||
        p.en?.toLowerCase().trim() === text.toLowerCase().trim()
    );

    if (match) {
      return { ...match };
    }

    // Default translations dict: ensure all known languages have an entry
    const trans = {};
    Object.keys(LANGUAGE_META).forEach((langKey) => {
      trans[langKey] = text;
      trans[LANGUAGE_META[langKey].name] = text;
    });
    return trans;
  };

  const handleSendMessage = (customText = null) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      alert("Connecting to session server, please wait a moment...");
      return;
    }

    const translations = buildTranslations(textToSend, myLanguageCode);

    // Compute basic risk indicator for sensitive terms
    const lowered = textToSend.toLowerCase();
    const isHighRisk = ["nuclear", "sanction", "war", "tariff", "threat"].some((w) =>
      lowered.includes(w)
    );
    const riskAnalysis = isHighRisk
      ? { risk_level: "medium-high", score: 0.7, notes: ["Sensitive terminology detected"] }
      : { risk_level: "low", score: 0.1, notes: [] };

    const payload = {
      type: "interpretation",
      transcript: textToSend,
      sourceLanguage: myLanguageCode,
      translations: translations,
      risk_analysis: riskAnalysis,
    };

    socketRef.current.send(JSON.stringify(payload));
    setInputText("");
  };

  const copySessionCode = () => {
    if (session?.sessionCode) {
      navigator.clipboard.writeText(session.sessionCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="multi-device-room">
      <style>{`
        .multi-device-room {
          max-width: 1300px;
          margin: 20px auto 40px;
          padding: 0 20px;
          font-family: inherit;
        }
        .room-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          background: linear-gradient(135deg, #072f59 0%, #0d4680 100%);
          color: white;
          padding: 20px 24px;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(7, 47, 89, 0.18);
        }
        .room-title-area h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .room-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 6px;
          font-size: 14px;
          opacity: 0.9;
        }
        .session-code-pill {
          background: rgba(255, 255, 255, 0.18);
          padding: 4px 10px;
          border-radius: 6px;
          font-family: monospace;
          font-weight: bold;
          letter-spacing: 0.05em;
        }
        .room-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-header {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.15);
          color: white;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-header:hover {
          background: rgba(255, 255, 255, 0.28);
        }
        .btn-leave {
          background: #e53e3e;
          border-color: #e53e3e;
        }
        .btn-leave:hover {
          background: #c53030;
        }
        .room-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 20px;
          margin-top: 20px;
        }
        @media (max-width: 900px) {
          .room-grid {
            grid-template-columns: 1fr;
          }
        }
        .participants-sidebar {
          background: white;
          border: 1px solid #d9e6f3;
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          height: fit-content;
        }
        .sidebar-title {
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 14px 0;
          color: #0d3660;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .participant-badge-count {
          background: #eef6ff;
          color: #1765b5;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 12px;
        }
        .participant-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .participant-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #edf2f7;
        }
        .participant-item.is-me {
          background: #eef6ff;
          border-color: #bfdbfe;
        }
        .participant-flag {
          font-size: 20px;
        }
        .participant-info {
          flex: 1;
          min-width: 0;
        }
        .participant-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a202c;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .participant-lang {
          font-size: 12px;
          color: #718096;
        }
        .room-main-panel {
          display: flex;
          flex-direction: column;
          background: white;
          border: 1px solid #d9e6f3;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          min-height: 520px;
        }
        .feed-header {
          padding: 14px 20px;
          border-bottom: 1px solid #edf2f7;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fcfdfe;
          border-top-left-radius: 14px;
          border-top-right-radius: 14px;
        }
        .feed-info {
          font-size: 13px;
          color: #4a5568;
        }
        .feed-info strong {
          color: #072f59;
        }
        .feed-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          max-height: 480px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #fbfcfe;
        }
        .message-bubble {
          max-width: 85%;
          padding: 14px 18px;
          border-radius: 14px;
          position: relative;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }
        .message-bubble.incoming {
          align-self: flex-start;
          background: white;
          border: 1px solid #e2e8f0;
        }
        .message-bubble.outgoing {
          align-self: flex-end;
          background: #eef6ff;
          border: 1px solid #bfdbfe;
        }
        .msg-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          gap: 12px;
        }
        .msg-sender {
          font-weight: 700;
          font-size: 13px;
          color: #0f3d6b;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .msg-time {
          font-size: 11px;
          color: #a0aec0;
        }
        .msg-text {
          font-size: 16px;
          line-height: 1.5;
          color: #1a202c;
          font-weight: 500;
        }
        .msg-original {
          margin-top: 6px;
          font-size: 12px;
          color: #718096;
          font-style: italic;
          border-top: 1px dashed #e2e8f0;
          padding-top: 4px;
        }
        .msg-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }
        .btn-speak {
          border: 0;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          padding: 2px 6px;
          border-radius: 4px;
          color: #2b6cb0;
        }
        .btn-speak:hover {
          background: #edf2f7;
        }
        .risk-badge {
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .risk-badge.high {
          background: #fed7d7;
          color: #c53030;
        }
        .risk-badge.low {
          background: #c6f6d5;
          color: #276749;
        }
        .room-controls {
          padding: 16px 20px;
          border-top: 1px solid #edf2f7;
          background: white;
          border-bottom-left-radius: 14px;
          border-bottom-right-radius: 14px;
        }
        .quick-chips {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          margin-bottom: 12px;
          padding-bottom: 4px;
        }
        .quick-chip {
          padding: 6px 12px;
          background: #edf2f7;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          font-size: 12px;
          color: #4a5568;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quick-chip:hover {
          background: #e2e8f0;
          color: #1a202c;
        }
        .input-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .room-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #cbd5e0;
          border-radius: 10px;
          font-size: 15px;
          outline: none;
        }
        .room-input:focus {
          border-color: #3182ce;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
        }
        .btn-mic {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 0;
          background: #edf2f7;
          color: #2d3748;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-mic.recording {
          background: #e53e3e;
          color: white;
          animation: pulse 1.5s infinite;
        }
        .btn-send {
          padding: 12px 22px;
          background: #1765b5;
          color: white;
          border: 0;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-send:hover {
          background: #0f4f91;
        }
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        .share-modal {
          background: white;
          border-radius: 16px;
          padding: 28px;
          width: min(440px, 92%);
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
        }
        .share-modal img {
          max-width: 220px;
          margin: 16px auto;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
      `}</style>

      {/* Header */}
      <div className="room-header">
        <div className="room-title-area">
          <h2>
            <span>🌐</span> {session?.title || "Multi-Device Diplomatic Room"}
          </h2>
          <div className="room-meta">
            <span>Session Code:</span>
            <span className="session-code-pill">{session?.sessionCode}</span>
            <span>•</span>
            <span>
              Status:{" "}
              {socketStatus === "connected" ? (
                <span style={{ color: "#48bb78" }}>● Active</span>
              ) : socketStatus === "connecting" ? (
                <span style={{ color: "#ecc94b" }}>● Connecting...</span>
              ) : (
                <span style={{ color: "#f56565" }}>● Offline</span>
              )}
            </span>
          </div>
        </div>

        <div className="room-actions">
          <button className="btn-header" onClick={() => setShowShareModal(true)}>
            📱 Share / QR
          </button>
          <button className="btn-header btn-leave" onClick={onLeave}>
            Exit Session
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="room-grid">
        {/* Participants Sidebar */}
        <div className="participants-sidebar">
          <div className="sidebar-title">
            <span>Connected Devices</span>
            <span className="participant-badge-count">{participants.length || 1}</span>
          </div>

          <ul className="participant-list">
            {participants.length > 0 ? (
              participants.map((p) => {
                const pLang = (p.language || "en").toLowerCase();
                const pMeta = LANGUAGE_META[pLang] || LANGUAGE_META.en;
                const isMe = p.id === participant.id;
                return (
                  <li key={p.id || Math.random()} className={`participant-item ${isMe ? "is-me" : ""}`}>
                    <span className="participant-flag">{pMeta.flag}</span>
                    <div className="participant-info">
                      <div className="participant-name">
                        {p.name} {isMe && "(You)"}
                      </div>
                      <div className="participant-lang">
                        {pMeta.name} ({pLang.toUpperCase()})
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="participant-item is-me">
                <span className="participant-flag">{myMeta.flag}</span>
                <div className="participant-info">
                  <div className="participant-name">{participant.participantName} (You)</div>
                  <div className="participant-lang">{myMeta.name}</div>
                </div>
              </li>
            )}
          </ul>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #edf2f7" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={autoTts}
                onChange={(e) => setAutoTts(e.target.checked)}
              />
              <span>🔊 Auto-Speak Incoming</span>
            </label>
          </div>
        </div>

        {/* Live Interpretation Panel */}
        <div className="room-main-panel">
          <div className="feed-header">
            <div className="feed-info">
              Listening in <strong>{myMeta.flag} {myMeta.name}</strong> • Spoken text is automatically translated & broadcasted to other devices.
            </div>
          </div>

          <div className="feed-container">
            {messages.length === 0 ? (
              <div style={{ margin: "auto", textAlign: "center", color: "#a0aec0" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎙️</div>
                <div style={{ fontWeight: 600, fontSize: 16, color: "#4a5568" }}>Room is ready for interpretation</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  Speak or choose a diplomatic phrase below to broadcast to all participants in real-time.
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const sMeta = LANGUAGE_META[msg.sourceLang] || LANGUAGE_META.en;
                const isSpeaking = speakingId === msg.id;
                return (
                  <div key={msg.id} className={`message-bubble ${msg.isSelf ? "outgoing" : "incoming"}`}>
                    <div className="msg-top">
                      <div className="msg-sender">
                        <span>{sMeta.flag}</span>
                        <span>{msg.sender}</span>
                        <span style={{ fontSize: 11, fontWeight: "normal", color: "#718096" }}>
                          ({sMeta.name})
                        </span>
                      </div>
                      <div className="msg-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    <div className="msg-text">{msg.text}</div>

                    {msg.originalText && msg.originalText !== msg.text && (
                      <div className="msg-original">
                        Original: "{msg.originalText}"
                      </div>
                    )}

                    <div className="msg-footer">
                      <button
                        className="btn-speak"
                        onClick={() => speakText(msg.text, myLanguageCode, msg.id)}
                        title="Play translation"
                      >
                        {isSpeaking ? "🔊 Playing..." : "▶ Speak"}
                      </button>

                      {msg.risk?.risk_level && msg.risk.risk_level !== "low" && (
                        <span className="risk-badge high">⚠️ Flagged</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick diplomatic phrases */}
          <div className="room-controls">
            <div className="quick-chips">
              <span style={{ fontSize: 12, fontWeight: 700, color: "#718096", alignSelf: "center" }}>
                Quick Broadcast:
              </span>
              {SAMPLE_PHRASES.map((phrase, idx) => {
                const textForMe = phrase[myLanguageCode] || phrase.en;
                return (
                  <button
                    key={idx}
                    className="quick-chip"
                    onClick={() => handleSendMessage(textForMe)}
                  >
                    "{textForMe.slice(0, 36)}..."
                  </button>
                );
              })}
            </div>

            {/* Input & Mic row */}
            <div className="input-row">
              <button
                className={`btn-mic ${isListening ? "recording" : ""}`}
                onClick={toggleSpeechRecognition}
                title={isListening ? "Stop listening" : `Speak in ${myMeta.name}`}
              >
                {isListening ? "⏹" : "🎙"}
              </button>

              <input
                type="text"
                className="room-input"
                placeholder={`Speak or type in ${myMeta.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />

              <button className="btn-send" onClick={() => handleSendMessage()}>
                Broadcast ✈
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share / QR Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, color: "#072f59" }}>Join This Session</h3>
            <p style={{ color: "#718096", fontSize: 14 }}>
              Other participants can scan this QR code or enter the code to join.
            </p>

            {session?.qrCode && (
              <img src={session.qrCode} alt="QR Code" />
            )}

            <div style={{ margin: "14px 0", fontSize: 20, fontFamily: "monospace", fontWeight: "bold" }}>
              {session?.sessionCode}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                className="btn-send"
                style={{ padding: "8px 18px" }}
                onClick={copySessionCode}
              >
                {copiedCode ? "✓ Copied Code" : "📋 Copy Code"}
              </button>
              <button
                className="btn-header"
                style={{ background: "#edf2f7", color: "#4a5568" }}
                onClick={() => setShowShareModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

