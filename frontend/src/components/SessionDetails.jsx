import { useState } from "react";

export default function SessionDetails({ session, onStartSession, onClose }) {
  const [copiedCode, setCopiedCode] = useState(false);

  const copySessionCode = () => {
    navigator.clipboard.writeText(session.sessionCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.href = session.qrCode;
    link.download = `session-${session.sessionCode}.png`;
    link.click();
  };

  return (
    <div className="session-details-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <h2>Session Created Successfully!</h2>

        <div className="session-info">
          <div className="info-section">
            <h3>Session Code</h3>
            <div className="session-code-container">
              <code className="session-code">{session.sessionCode}</code>
              <button
                className="copy-btn"
                onClick={copySessionCode}
                title="Copy session code"
              >
                {copiedCode ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
          </div>

          <div className="info-section">
            <h3>QR Code for Participants</h3>
            <div className="qr-container">
              <img
                src={session.qrCode}
                alt="Session QR Code"
                className="qr-code"
              />
              <button
                className="download-btn"
                onClick={downloadQRCode}
              >
                ⬇️ Download QR Code
              </button>
            </div>
          </div>

          {session.title && (
            <div className="info-section">
              <h3>Session Title</h3>
              <p>{session.title}</p>
            </div>
          )}

          {session.description && (
            <div className="info-section">
              <h3>Description</h3>
              <p>{session.description}</p>
            </div>
          )}

          <div className="info-section">
            <h3>Join Instructions</h3>
            <ol>
              <li>Participants scan the QR code OR</li>
              <li>Enter session code: <strong>{session.sessionCode}</strong></li>
              <li>Select their preferred language</li>
              <li>Join the session</li>
            </ol>
          </div>
        </div>

        <button
          className="btn-primary start-btn"
          onClick={onStartSession}
        >
          ✓ Start Session
        </button>
      </div>

      <style>{`
        .session-details-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 40px;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .close-btn {
          position: absolute;
          top: 10px;
          right: 15px;
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #999;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #333;
        }

        .modal-content h2 {
          margin-top: 0;
          color: #333;
          text-align: center;
        }

        .session-info {
          margin: 30px 0;
        }

        .info-section {
          margin-bottom: 25px;
        }

        .info-section h3 {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }

        .info-section p {
          color: #333;
          margin: 0;
          line-height: 1.6;
        }

        .session-code-container {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .session-code {
          background-color: #f5f5f5;
          padding: 12px 16px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: bold;
          color: #0066cc;
          flex: 1;
          border: 1px solid #e0e0e0;
        }

        .copy-btn {
          padding: 10px 15px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .copy-btn:hover {
          background-color: #e0e0e0;
          border-color: #999;
        }

        .qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .qr-code {
          width: 200px;
          height: 200px;
          border: 2px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          background: white;
        }

        .download-btn {
          padding: 10px 20px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .download-btn:hover {
          background-color: #218838;
        }

        .info-section ol {
          color: #333;
          padding-left: 25px;
        }

        .info-section ol li {
          margin-bottom: 8px;
          line-height: 1.6;
        }

        .btn-primary {
          width: 100%;
          padding: 14px;
          background-color: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 10px;
        }

        .btn-primary:hover {
          background-color: #0052a3;
        }

        .start-btn {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
