import { useState } from "react";
import { API_BASE } from "../config";

export default function SessionCreator({ onSessionCreated, onCancel, loggedUser }) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleCreateSession = async () => {
    if (!title.trim()) {
      setError("Session title is required");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/interpretation-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          creator_user_id: loggedUser?.id || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      onSessionCreated(data.session);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="session-creator">
      <div className="creator-card">
        <h2>Create New Interpretation Session</h2>

        <div className="form-group">
          <label htmlFor="title">Session Title *</label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Trade Negotiation 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isCreating}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            placeholder="Enter session description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isCreating}
            rows="3"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
          <button
            onClick={handleCreateSession}
            disabled={isCreating}
            className="btn-primary"
            style={{ flex: 1 }}
          >
            {isCreating ? "Creating Session..." : "Create Session"}
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
      </div>

      <style>{`
        .session-creator {
          padding: 20px;
        }

        .creator-card {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        }

        .creator-card h2 {
          margin-top: 0;
          color: #333;
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

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0066cc;
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }

        .form-group input:disabled,
        .form-group textarea:disabled {
          background-color: #f5f5f5;
          color: #999;
        }

        .error-message {
          color: #dc3545;
          font-size: 14px;
          margin-bottom: 15px;
          padding: 10px;
          background-color: #ffe5e5;
          border-radius: 4px;
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
      `}</style>
    </div>
  );
}
