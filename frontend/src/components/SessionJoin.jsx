import { useState } from "react";
import { API_BASE } from "../config";

const LANGUAGES = [
  { code: "auto", name: "Auto Detect / Not Required" },
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "fr", name: "French" },
  { code: "ar", name: "Arabic" },
  { code: "es", name: "Spanish" },
  { code: "ru", name: "Russian" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "de", name: "German" },
  { code: "he", name: "Hebrew" },
];

export default function SessionJoin({ onSessionJoined, onCancel, loggedUser }) {
  const [sessionCode, setSessionCode] = useState("");
  const [participantName, setParticipantName] = useState(loggedUser?.name || "");
  const [participantLanguage, setParticipantLanguage] = useState("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      setError("Session code is required");
      return;
    }

    if (!participantName.trim()) {
      setError("Participant name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/interpretation-sessions/${sessionCode.trim()}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participant_name: participantName.trim(),
            participant_language: participantLanguage,
            user_id: loggedUser?.id || null,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to join session");
      }

      const data = await response.json();
      onSessionJoined(data.session, data.participant);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleJoinSession();
    }
  };

  return (
    <div className="session-join">
      <div className="join-card">
        <h2>Join Interpretation Session</h2>

        <div className="form-group">
          <label htmlFor="sessionCode">Session Code *</label>
          <input
            id="sessionCode"
            type="text"
            placeholder="e.g., SS-ABC123"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            maxLength="10"
          />
          <small>Scan the QR code or enter the session code</small>
        </div>

        <div className="form-group">
          <label htmlFor="name">Your Name *</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="language">Preferred Language *</label>
          <select
            id="language"
            value={participantLanguage}
            onChange={(e) => setParticipantLanguage(e.target.value)}
            disabled={isLoading}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <small>You will receive interpretations in this language</small>
        </div>

        {error && <div className="error-message">❌ {error}</div>}

        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
          <button
            onClick={handleJoinSession}
            disabled={isLoading}
            className="btn-primary"
            style={{ flex: 1 }}
          >
            {isLoading ? "Joining..." : "Join Session"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              style={{
                padding: "12px 20px",
                borderRadius: "6px",
                border: "1px solid #cbd5e0",
                background: "#edf2f7",
                color: "#4a5568",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Back
            </button>
          )}
        </div>

        <div className="info-box">
          <strong>ℹ️ How it works:</strong>
          <p>
            Join a multi-device interpretation session. Each participant speaks in their
            language, and you receive real-time translations in your preferred language.
          </p>
        </div>
      </div>

      <style>{`
        .session-join {
          padding: 20px;
        }

        .join-card {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        }

        .join-card h2 {
          margin-top: 0;
          color: #333;
          text-align: center;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #555;
        }

        .form-group small {
          display: block;
          margin-top: 4px;
          color: #999;
          font-size: 12px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #0066cc;
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }

        .form-group input:disabled,
        .form-group select:disabled {
          background-color: #f5f5f5;
          color: #999;
        }

        .form-group input::placeholder {
          color: #ccc;
        }

        .error-message {
          color: #dc3545;
          font-size: 14px;
          margin-bottom: 15px;
          padding: 12px;
          background-color: #ffe5e5;
          border-radius: 4px;
          border-left: 4px solid #dc3545;
        }

        .btn-primary {
          width: 100%;
          padding: 12px;
          background-color: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0052a3;
        }

        .btn-primary:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .info-box {
          margin-top: 25px;
          padding: 15px;
          background-color: #e7f3ff;
          border-left: 4px solid #0066cc;
          border-radius: 4px;
        }

        .info-box strong {
          color: #0066cc;
        }

        .info-box p {
          margin: 8px 0 0 0;
          font-size: 13px;
          color: #333;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
