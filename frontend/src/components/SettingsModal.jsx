function SettingsModal({
  showSettings,
  setShowSettings,
  t,
  darkMode,
  setDarkMode,
  portalLanguage,
  handlePortalLanguage,
  languages,
  selectedLanguages,
  toggleLanguage,
  decreaseFont,
  resetFont,
  increaseFont,
}) {
  if (!showSettings) {
    return null;
  }

  return (
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
  );
}

export default SettingsModal;
