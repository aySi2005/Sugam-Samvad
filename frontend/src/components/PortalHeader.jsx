function PortalHeader({
  scrolled,
  searchQuery,
  setSearchQuery,
  t,
  goToSection,
  decreaseFont,
  increaseFont,
  toggleTheme,
  setShowSettings,
  handlePortalLanguage,
  darkMode,
  resetFont,
  handlePortalSearch,
}) {
  return (
    <>
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
                onError={event => {
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

            <div className="government-title">Government of India</div>

            <h1>Sugam Samvaad</h1>

            <div className="brand-tricolor">
              <span />
              <span />
              <span />
            </div>

            <h3>National Real-Time Multilingual Interpretation Portal</h3>

            <p>Seamless Communication for a Stronger, More Connected World</p>
          </div>

          <div className="hero-right">
            <div className="vasudhaiva">
              Vasudhaiva<br />
              Kutumbakam
            </div>

            <div className="world-family">The World is One Family</div>

            <div className="india-flag">🇮🇳</div>
          </div>
        </div>
      </header>
    </>
  );
}

export default PortalHeader;
