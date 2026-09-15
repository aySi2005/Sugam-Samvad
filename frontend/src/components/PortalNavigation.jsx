function PortalNavigation({ activeSection, goToSection, t }) {
  return (
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
          className={`nav-item ${activeSection === "multi-device" ? "active" : ""}`}
          onClick={() => goToSection("multi-device")}
        >
          <span className="nav-icon">🌐</span>
          {t.multiDevice || "Multi-Device Sessions"}
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
  );
}

export default PortalNavigation;
