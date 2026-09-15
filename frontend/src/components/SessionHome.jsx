import { useState } from "react";
import SessionCreator from "./SessionCreator";
import SessionJoin from "./SessionJoin";
import SessionDetails from "./SessionDetails";
import { API_BASE } from "../config";

export default function SessionHome({ onSessionStarted, loggedUser, onBack }) {
  const [view, setView] = useState("home"); // "home" | "create" | "join"
  const [createdSession, setCreatedSession] = useState(null);

  const handleSessionCreated = (session) => {
    setCreatedSession(session);
    setView("details");
  };

  const handleStartSession = async () => {
    if (!createdSession) return;
    try {
      const hostName = loggedUser?.name || "Host (Ambassador A)";
      const response = await fetch(
        `${API_BASE}/api/interpretation-sessions/${createdSession.sessionCode}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participant_name: hostName,
            participant_language: "en",
            user_id: loggedUser?.id || null,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        onSessionStarted({
          type: "creator",
          session: createdSession,
          participant: data.participant,
        });
        return;
      }
    } catch (err) {
      console.warn("Auto-joining host failed, continuing with fallback participant:", err);
    }

    // Fallback if network issue
    onSessionStarted({
      type: "creator",
      session: createdSession,
      participant: {
        id: 1,
        participantName: loggedUser?.name || "Host (Ambassador A)",
        participantLanguage: "en",
      },
    });
  };

  const handleSessionJoined = (session, participant) => {
    onSessionStarted({
      type: "participant",
      session: session,
      participant: participant,
    });
  };

  if (view === "create") {
    return (
      <SessionCreator
        onSessionCreated={handleSessionCreated}
        onCancel={() => setView("home")}
        loggedUser={loggedUser}
      />
    );
  }

  if (view === "join") {
    return (
      <SessionJoin
        onSessionJoined={handleSessionJoined}
        onCancel={() => setView("home")}
        loggedUser={loggedUser}
      />
    );
  }

  if (view === "details" && createdSession) {
    return (
      <SessionDetails
        session={createdSession}
        onSessionCreated={handleSessionCreated}
        onStartSession={handleStartSession}
        onClose={() => {
          setCreatedSession(null);
          setView("home");
        }}
      />
    );
  }

  return (
    <div className="session-home">
      <div className="home-container">
        {onBack && (
          <div style={{ marginBottom: "16px" }}>
            <button
              onClick={onBack}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Back to Single-User Interpreter
            </button>
          </div>
        )}
        <div className="header">
          <h1>  Sugam Samvad</h1>
          <p className="subtitle">Multi-Device Real-Time Diplomatic Interpretation Platform</p>
        </div>

        <div className="options-grid">
          <div className="option-card" onClick={() => setView("create")}>
            <div className="option-icon">＋</div>
            <h3>Create Session</h3>
            <p>Start a new interpretation session</p>
            <button className="option-btn">Create New</button>
          </div>

          <div className="option-card" onClick={() => setView("join")}>
            <div className="option-icon">↗</div>
            <h3>Join Session</h3>
            <p>Join an existing session with code or QR</p>
            <button className="option-btn">Join Now</button>
          </div>
        </div>

        <div className="info-section">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Create or Join</h4>
                <p>Session creator generates a unique session code & QR</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Add Participants</h4>
                <p>Participants scan QR or enter code with their preferred language</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Real-Time Interpretation</h4>
                <p>Each participant speaks in their language, receives translations in theirs</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Complete Record</h4>
                <p>Session is saved with transcripts, translations, and risk analysis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="features">
          <h2>Features</h2>
          <ul>
            <li>  Multi-device simultaneous interpretation</li>
            <li>  Language-specific message routing</li>
            <li>  Real-time transcription & translation</li>
            <li>  Diplomatic risk analysis</li>
            <li>  Complete session transcript export</li>
            <li>  QR code sharing for easy access</li>
          </ul>
        </div>
      </div>

      <style>{`
        .session-home {
  min-height: 100vh;
  padding: 40px 20px;
  position: relative;
  background-image:
    linear-gradient(
      rgba(10, 25, 45, 0.18),
      rgba(10, 25, 45, 0.18)
    ),
    url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmR2yqf8Rt7gWOQnJ5eF_ZEmoGjfBkziFNdyz2baAmfvyZbU7DWytDz0I&s=10");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

        .home-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          color: white;
          margin-bottom: 60px;
        }

        .header h1 {
          font-size: 48px;
          margin: 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .subtitle {
          font-size: 18px;
          margin: 10px 0 0 0;
          opacity: 0.9;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 60px;
        }

        .option-card {
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 12px;
          padding: 40px 30px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .option-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
        }

        .option-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .option-card h3 {
          font-size: 24px;
          color: #333;
          margin: 0 0 10px 0;
        }

        .option-card p {
          color: #666;
          font-size: 15px;
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        .option-btn {
          padding: 12px 30px;
          background-color: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .option-btn:hover {
          background-color: #5568d3;
        }

        .info-section {
            background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 12px;
          padding: 40px;
          margin-bottom: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .info-section h2 {
          color: #333;
          margin-top: 0;
          font-size: 28px;
          margin-bottom: 30px;
          text-align: center;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .step {
          display: flex;
          gap: 20px;
        }

        .step-number {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 24px;
        }

        .step-content h4 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .step-content p {
          margin: 0;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }

        .features {
            background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .features h2 {
          color: #333;
          margin-top: 0;
          font-size: 28px;
          margin-bottom: 20px;
          text-align: center;
        }

        .features ul {
          list-style: none;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
        }

        .features li {
          padding: 12px 0;
          color: #333;
          font-size: 16px;
          border-bottom: 1px solid #eee;
        }

        .features li:last-child {
          border-bottom: none;
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 36px;
          }

          .subtitle {
            font-size: 16px;
          }

          .options-grid {
            grid-template-columns: 1fr;
          }

          .steps {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
