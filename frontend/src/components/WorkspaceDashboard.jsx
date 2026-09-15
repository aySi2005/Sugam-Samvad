function WorkspaceDashboard({
  t,
  listening,
  selectedInputLanguage,
  changeInputLanguage,
  inputLanguageNames,
  startListening,
  stopListening,
  languages,
  selectedLanguages,
  toggleLanguage,
  listeningLanguage,
  setListeningLanguage,
  languageCodes,
  speaking,
  stopSpeaking,
  liveTranscript,
  transcriptHistory,
  sourceLanguage,
  connected,
  visibleTranslations,
  languageFlags,
  languageCodesMap,
  speakTranslation,
  riskAnalysis,
  riskClass,
  riskLabel,
  sessionHistory,
}) {
  return (
    <main id="section-home" className="portal-width portal-main">
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
            onChange={event => changeInputLanguage(event.target.value)}
            className="gov-select"
          >
            {Object.entries(inputLanguageNames).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>

          <p className="helper-text">Select the language spoken by the speaker</p>
        </div>

        <div className="mic-zone">
          <button
            className={`big-mic ${listening ? "recording" : ""}`}
            onClick={listening ? stopListening : startListening}
            aria-label={listening ? "Stop listening" : "Start listening"}
          >
            {listening ? "■" : "🎙"}
          </button>

          <strong>{listening ? t.stop : t.start}</strong>

          <span>
            {listening ? "Microphone is active" : "Ready for live interpretation"}
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
            {languages.map(language => (
              <button
                key={language}
                className={`language-chip ${
                  selectedLanguages.includes(language) ? "selected" : ""
                }`}
                onClick={() => toggleLanguage(language)}
              >
                {language}

                {selectedLanguages.includes(language) && <b>×</b>}
              </button>
            ))}
          </div>

          <p className="helper-text">Choose one or more languages for translation</p>
        </div>
      </section>

      <section className="listen-panel">
        <div className="listen-heading">
          🔊

          <div>
            <h3>{t.listening}</h3>

            <p>
              Choose the language you want to hear through the interpreter.
            </p>
          </div>
        </div>

        <select
          value={listeningLanguage}
          onChange={event => setListeningLanguage(event.target.value)}
          className="gov-select listening-select"
        >
          {languages.map(language => (
            <option key={language} value={languageCodes[language]}>
              {language}
            </option>
          ))}
        </select>

        <div className="speech-status">
          <span className={speaking ? "speaking-dot active" : "speaking-dot"} />

          {speaking ? "Speaking" : "Not speaking"}

          {speaking && (
            <button className="stop-speech" onClick={stopSpeaking}>
              Stop Speech
            </button>
          )}
        </div>
      </section>

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
              !liveTranscript && transcriptHistory.length === 0 ? "empty" : ""
            }`}
          >
            {transcriptHistory.map((sentence, index) => (
              <p key={`${sentence}-${index}`}>{sentence}</p>
            ))}

            {liveTranscript && <p className="live-transcript">{liveTranscript}</p>}

            {!liveTranscript && transcriptHistory.length === 0 && <p>Listening...</p>}
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
            <strong>{sourceLanguage.name}</strong>
            <span>{sourceLanguage.code.toUpperCase()}</span>
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
            <span className={connected ? "connected-dot" : "disconnected-dot"} />

            <strong>{connected ? t.connected : t.disconnected}</strong>
          </div>

          <p className="secure-text">Secure WebSocket Connection</p>
        </div>
      </section>

      <section id="section-diplomatic" className="government-card translations-panel">
        <div className="section-title">
          <span className="card-icon">文</span>

          <div>
            <h3>{t.translations}</h3>
            <p>Simultaneous multilingual interpretation output</p>
          </div>
        </div>

        {visibleTranslations.length === 0 ? (
          <div className="empty-selection">Select at least one target language.</div>
        ) : (
          <div className="translation-grid">
            {visibleTranslations.map(item => {
              const code = languageCodesMap[item.language];

              return (
                <article className="translation-card" key={item.language}>
                  <div className="translation-heading">
                    <strong>
                      {languageFlags[item.language]} {item.language}
                    </strong>

                    <button
                      className="speaker-button"
                      disabled={!item.text}
                      onClick={() => speakTranslation(item.text, code)}
                      aria-label={`Speak ${item.language} translation`}
                    >
                      🔊
                    </button>
                  </div>

                  <div className="translation-content">
                    {item.text || "Translation will appear here..."}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="government-card session-history-panel">
        <div className="section-title">
          <span className="card-icon">◫</span>

          <div>
            <h3>Session History</h3>
            <p>Recent saved interpretation sessions for your account</p>
          </div>
        </div>

        {sessionHistory.length === 0 ? (
          <div className="empty-selection">
            No saved sessions yet. Start a live interpretation session to create one.
          </div>
        ) : (
          <div className="session-history-list">
            {sessionHistory.map(session => (
              <article key={session.id} className="session-history-item">
                <div className="session-history-top">
                  <strong>Session #{session.id}</strong>
                  <span>{new Date(session.createdAt).toLocaleString()}</span>
                </div>

                <div className="session-history-meta">
                  <span>{session.sourceLanguage.toUpperCase()}</span>
                  <span>{session.targetLanguages.join(", ") || "No targets selected"}</span>
                  <span>{session.segments?.length || 0} saved segments</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="section-risk" className="risk-panel">
        <div className="risk-header">
          <div className="risk-title">
            <span className="warning-icon">!</span>

            <div>
              <h3>{t.riskTitle}</h3>
              <p>AI-assisted analysis of the latest finalized statement</p>
            </div>
          </div>

          <span className={`risk-main-badge ${riskClass}`}>
            <i />
            {riskLabel}
          </span>
        </div>

        <div className="risk-overview">
          <div>
            <span>Risk Score</span>
            <strong>{riskAnalysis.risk_score || 0}</strong>
          </div>

          <div>
            <span>Ambiguity</span>
            <strong>{riskAnalysis.ambiguity ? "Detected" : "None detected"}</strong>
          </div>

          <div>
            <span>Uncertainty</span>
            <strong>{riskAnalysis.uncertainty ? "Detected" : "None detected"}</strong>
          </div>

          <div>
            <span>Attribution Risk</span>
            <strong>{riskAnalysis.attribution_risk ? "Detected" : "None detected"}</strong>
          </div>

          <div>
            <span>Escalatory Language</span>
            <strong>{riskAnalysis.escalatory_language ? "Detected" : "None detected"}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default WorkspaceDashboard;
