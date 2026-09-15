import { useMemo, useState } from "react";
import { API_BASE } from "../config";

function LoginPage({ onLoginSuccess, onJoinSessionGuest }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  const submitLabel = useMemo(
    () => (isSignup ? "Create Account" : "Sign In →"),
    [isSignup]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (isSignup && !name.trim()) {
      setError("Full name is required to create an account.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}${isSignup ? "/api/signup" : "/api/login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isSignup
              ? {
                  name,
                  email: normalizedEmail,
                  password,
                }
              : {
                  email: normalizedEmail,
                  password,
                }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            (isSignup
              ? "Unable to create account."
              : "Unable to sign in.")
        );
      }

      onLoginSuccess(data.user);
    } catch (caughtError) {
      const msg = caughtError?.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError(
          "Failed to fetch: Cannot connect to backend server. If using Render's free tier, the server may take ~60 seconds to spin up, or ensure CORS allows this domain."
        );
      } else {
        setError(
          msg || (isSignup ? "Unable to create account." : "Unable to sign in.")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Background overlay */}
      <div className="login-overlay"></div>

      <div className="login-layout">

        {/* =====================================================
            LEFT SIDE
        ====================================================== */}
        <section className="login-left">

          {/* Branding */}
          <div className="brand-area">
            <div className="brand-icon">
              ◉
            </div>

            <div>
              <h1>Sugam Samvaad</h1>
              <p>Bridging Nations Through Understanding</p>
            </div>
          </div>

          <div className="brand-line"></div>

          {/* Main message */}
          <div className="hero-text">
            <h2>
              Real Conversations
              <br />
              <span>A Stronger Tomorrow</span>
            </h2>

            <p>
              Real-time multilingual interpretation
              <br />
              for global dialogue, diplomacy and
              <br />
              collaboration.
            </p>
          </div>

          {/* Features */}
          <div className="login-features">

            <div className="feature-item">
              <div className="feature-icon">
                <span>•••</span>
              </div>

              <div>
                <strong>Real-Time</strong>
                <br />
                Interpretation
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <span>♟</span>
              </div>

              <div>
                <strong>Global</strong>
                <br />
                Collaboration
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <span>✓</span>
              </div>

              <div>
                <strong>Secure &</strong>
                <br />
                Inclusive Communication
              </div>
            </div>

          </div>

          {/* Modi image */}
          <div className="modi-container">
{/* <img
  // src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEouMzzrpU3iHAyGWzn_Ly8D7PwTLSF973sei9nCqgsQ&s=10"
  alt="Prime Minister of India"
  className="modi-image"
/> */}
          </div>

          {/* Quote */}
          <div className="quote">
            <div className="quote-mark">“</div>

            <p>
              Technology must be a bridge,
              <br />
              not a barrier, for a stronger,
              <br />
              more inclusive world.
            </p>

            <span>— Narendra Modi</span>
            <small>Prime Minister of India</small>
          </div>

        </section>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}
        <section className="login-right">

          {/* Digital India logo */}
          <div className="digital-india">
{/* <img
  // src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVax_ph_K3WyPcCRcowVhBAk2cyNWXs4SqZINugyqGqA&s=10"
  alt="Digital India"
/> */}
          </div>

          {/* Top slogan */}
          <div className="top-slogan">
            <span>ONE WORLD</span>
            <span>MANY VOICES</span>
            <span>A BRIGHTER TOMORROW</span>
          </div>

          {/* Login card */}
          <div className="login-card">

            {/* Card heading */}
            <div className="login-heading">

              <h2>
                {isSignup ? "Create account" : "Welcome back"}
              </h2>

              <p>
                {isSignup
                  ? "Create your Sugam Samvaad account"
                  : "Sign in to your Sugam Samvaad account"}
              </p>

            </div>

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              {/* Name */}
              {isSignup && (
                <label className="login-field">

                  <span className="login-label">
                    Full name
                  </span>

                  <div className="input-shell">

                    <span className="input-icon">
                      👤
                    </span>

                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Your name"
                      required
                    />

                  </div>

                </label>
              )}

              {/* Email */}
              <label className="login-field">

                <span className="login-label">
                  Email
                </span>

                <div className="input-shell">

                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    required
                  />

                </div>

              </label>

              {/* Password */}
              <div className="login-field password-field">

                <div className="password-header">

                  <span className="login-label">
                    Password
                  </span>

                  {!isSignup && (
                    <button
                      type="button"
                      className="forgot-link"
                    >
                      Forgot?
                    </button>
                  )}

                </div>

                <div className="input-shell">

                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="••••••••"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "◉" : "◉"}
                  </button>

                </div>

              </div>

              {/* Error */}
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading
                  ? isSignup
                    ? "Creating account..."
                    : "Signing in..."
                  : submitLabel}
              </button>

            </form>

            {/* Signup */}
            <p className="signup-row">

              {isSignup
                ? "Already have an account?"
                : "Don't have an account?"}

              {" "}

              <button
                type="button"
                className="signup-link"
                onClick={() => {
                  setMode((current) =>
                    current === "login"
                      ? "signup"
                      : "login"
                  );

                  setError("");
                }}
              >
                {isSignup ? "Sign in" : "Sign up"}
              </button>

            </p>

            {/* Divider */}
            {onJoinSessionGuest && (
              <>
                <div className="divider">
                  <span></span>
                  <strong>OR</strong>
                  <span></span>
                </div>

                {/* Guest */}
                <button
                  type="button"
                  className="guest-button"
                  onClick={onJoinSessionGuest}
                >
                  <span className="guest-icon">
                    👥
                  </span>

                  <span>
                    Join Multi-Device Session as Guest
                  </span>

                  <span className="guest-arrow">
                    →
                  </span>
                </button>
              </>
            )}

          </div>

          {/* Bottom text */}
          <div className="bottom-slogan">
            <span></span>
            DIPLOMACY&nbsp;&nbsp; | &nbsp;&nbsp;DIALOGUE
            &nbsp;&nbsp; | &nbsp;&nbsp;DEVELOPMENT
            <span></span>
          </div>

        </section>

      </div>

      {/* =====================================================
          STYLES
      ====================================================== */}
      <style>{`

        * {
          box-sizing: border-box;
        }

.login-page {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;

  background-image:
    linear-gradient(
      rgba(7, 28, 50, 0.38),
      rgba(7, 28, 50, 0.38)
    ),
    url("https://images.unsplash.com/photo-1761301643520-49c1ee626e72?auto=format&fit=crop&fm=jpg&q=85&w=2400");

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

        .login-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(5, 25, 45, 0.68) 0%,
              rgba(5, 25, 45, 0.38) 42%,
              rgba(255, 255, 255, 0.02) 100%
            );

          pointer-events: none;
        }

        .login-layout {
          position: relative;
          z-index: 2;

          min-height: 100vh;

          display: grid;
          grid-template-columns: 55% 45%;

          padding: 34px 4vw 28px;
        }

        /* =========================
           LEFT
        ========================== */

        .login-left {
          position: relative;
          color: white;

          min-height: calc(100vh - 90px);

          display: flex;
          flex-direction: column;
        }

        .brand-area {
          display: flex;
          align-items: center;
          gap: 14px;

          margin-top: 5px;
        }

        .brand-icon {
          width: 48px;
          height: 48px;

          border: 2px solid white;
          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 25px;
          color: white;
        }

        .brand-area h1 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 35px;
          letter-spacing: -0.5px;
        }

        .brand-area p {
          margin: 3px 0 0;

          font-size: 15px;
          opacity: 0.9;
          letter-spacing: 0.2px;
        }

        .brand-line {
          width: 55px;
          height: 2px;

          background: rgba(255,255,255,0.9);

          margin-top: 30px;
        }

        .hero-text {
          margin-top: 35px;
        }

        .hero-text h2 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: clamp(34px, 3.2vw, 52px);
          line-height: 1.08;

          font-weight: 700;
        }

        .hero-text h2 span {
          color: #9ed1ff;
        }

        .hero-text p {
          margin-top: 22px;

          font-size: 18px;
          line-height: 1.55;

          color: rgba(255,255,255,0.92);
        }

        /* Features */

        .login-features {
          margin-top: 25px;

          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-item {
          display: flex;
          align-items: center;

          gap: 14px;

          font-size: 15px;
          line-height: 1.35;
        }

        .feature-item strong {
          font-weight: 700;
        }

        .feature-icon {
          width: 45px;
          height: 45px;

          flex-shrink: 0;

          border-radius: 50%;

          background: rgba(39, 116, 190, 0.55);

          border: 1px solid
            rgba(255,255,255,0.25);

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 20px;
        }

        /* Modi */
.modi-container {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 125px;
  height: 190px;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  overflow: hidden;
  pointer-events: none;
}

.modi-image {
  width: 125px;
  height: auto;
  display: block;
  mix-blend-mode: darken;
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.22));
}

        /* Quote */

        .quote {
          position: absolute;
          left: 135px;
          bottom: 10px;
          width: 250px;
          z-index: 3;
          padding-left: 5px;
        }

        .quote-mark {
          position: absolute;

          left: 0;
          top: -17px;

          font-family: Georgia, serif;
          font-size: 55px;

          opacity: 0.7;
        }

        .quote p {
          margin: 0 0 12px 24px;

          font-family: Georgia, serif;

          font-size: 16px;
          font-style: italic;

          line-height: 1.4;
        }

        .quote span,
        .quote small {
          display: block;

          margin-left: 24px;
        }

        .quote span {
          font-weight: 700;
          font-size: 13px;
        }

        .quote small {
          margin-top: 2px;
          font-size: 11px;
          opacity: 0.8;
        }

        /* =========================
           RIGHT
        ========================== */

        .login-right {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;

          min-height: calc(100vh - 90px);
        }

        /* Digital India */

.digital-india {
  position: absolute;
  top: 4px;
  right: 24px;
  width: 118px;
  z-index: 5;
  pointer-events: none;
}

.digital-india img {
  width: 100%;
  height: auto;
  display: block;
  mix-blend-mode: darken;
}

        /* Slogan */

        .top-slogan {
          position: absolute;

          right: 0;
          top: 0;

          transform: translateY(-2px);

          display: none;
        }

        /* Login card */

        .login-card {
          width: min(500px, 100%);

          margin-top: 25px;

          padding: 38px 42px 32px;

          background:
            rgba(255,255,255,0.94);

          border:
            1px solid
            rgba(255,255,255,0.85);

          border-radius: 14px;

          box-shadow:
            0 25px 70px
            rgba(0,0,0,0.28);

          backdrop-filter: blur(3px);

          position: relative;
          z-index: 4;
        }

        .login-heading {
          margin-bottom: 32px;
        }

        .login-heading h2 {
          margin: 0;

          color: #0b294b;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 39px;
          line-height: 1.1;

          font-weight: 700;

          text-align: left;
        }

        .login-heading p {
          margin: 9px 0 0;

          color: #52657c;

          font-size: 16px;
        }

        /* Form */

        .login-form {
          display: flex;
          flex-direction: column;

          gap: 20px;
        }

        .login-field {
          display: block;
        }

        .login-label {
          display: block;

          margin-bottom: 9px;

          color: #102b49;

          font-size: 15px;
          font-weight: 700;
        }

        .password-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .password-header .login-label {
          margin-bottom: 9px;
        }

        .forgot-link {
          border: none;
          background: transparent;

          color: #0668df;

          font-size: 14px;
          font-weight: 700;

          cursor: pointer;

          padding: 0;
        }

        /* Inputs */

        .input-shell {
          display: flex;
          align-items: center;

          width: 100%;

          min-height: 52px;

          border:
            1px solid
            #d7dee7;

          border-radius: 9px;

          background: rgba(255,255,255,0.85);

          transition:
            border-color 0.2s,
            box-shadow 0.2s;
        }

        .input-shell:focus-within {
          border-color: #1976df;

          box-shadow:
            0 0 0 3px
            rgba(25,118,223,0.12);
        }

        .input-icon {
          width: 52px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 18px;

          opacity: 0.65;
        }

        .input-shell input {
          flex: 1;

          min-width: 0;

          height: 50px;

          border: none;
          outline: none;

          background: transparent;

          color: #122b46;

          font-size: 16px;
        }

        .input-shell input::placeholder {
          color: #8b98a7;
        }

        .password-toggle {
          width: 50px;

          border: none;
          background: transparent;

          color: #657587;

          cursor: pointer;

          font-size: 16px;
        }

        /* Error */

        .login-error {
          padding: 11px 13px;

          border-radius: 8px;

          background: #fff1f1;

          border: 1px solid #ffd0d0;

          color: #c62828;

          font-size: 13px;
        }

        /* Button */

        .login-button {
          width: 100%;

          min-height: 55px;

          border: none;
          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #0877e8,
              #155ac8
            );

          color: white;

          font-size: 20px;
          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 10px 22px
            rgba(18,91,190,0.28);

          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);

          box-shadow:
            0 13px 28px
            rgba(18,91,190,0.35);
        }

        .login-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Signup */

        .signup-row {
          margin: 22px 0 0;

          text-align: center;

          color: #506276;

          font-size: 14px;
        }

        .signup-link {
          border: none;
          background: transparent;

          color: #0668df;

          font-size: inherit;
          font-weight: 700;

          cursor: pointer;

          padding: 0;
        }

        /* Divider */

        .divider {
          display: flex;
          align-items: center;

          gap: 12px;

          margin: 24px 0 18px;

          color: #7b8998;

          font-size: 12px;
        }

        .divider span {
          flex: 1;

          height: 1px;

          background: #dce2e8;
        }

        .divider strong {
          font-weight: 600;
        }

        /* Guest */

        .guest-button {
          width: 100%;

          min-height: 49px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 10px;

          border:
            1px dashed
            #3888df;

          border-radius: 8px;

          background: rgba(255,255,255,0.55);

          color: #0866cf;

          font-size: 14px;
          font-weight: 700;

          cursor: pointer;

          transition:
            background 0.2s,
            border-color 0.2s;
        }

        .guest-button:hover {
          background: #f1f7ff;

          border-color: #126bd1;
        }

        .guest-icon {
          font-size: 17px;
        }

        .guest-arrow {
          font-size: 18px;
        }

        /* Bottom slogan */

        .bottom-slogan {
          position: absolute;

          bottom: 3px;
          right: 0;

          display: flex;
          align-items: center;

          gap: 12px;

          color: rgba(255,255,255,0.9);

          font-size: 11px;
          letter-spacing: 2px;

          z-index: 3;
        }

        .bottom-slogan span {
          width: 38px;
          height: 1px;

          background: rgba(255,255,255,0.8);
        }

        /* =========================
           RESPONSIVE
        ========================== */

        @media (max-width: 1100px) {

          .login-layout {
            grid-template-columns: 48% 52%;
            padding: 30px 4vw;
          }

          .login-card {
            padding: 35px 32px;
          }

          .modi-container {
            left: 10%;
            width: 240px;
          }

          .quote {
            width: 235px;
          }

          .hero-text h2 {
            font-size: 38px;
          }
        }

        @media (max-width: 850px) {

          .login-page {
            overflow-y: auto;

            background-position: center;
          }

          .login-layout {
            display: block;

            min-height: 100vh;

            padding: 30px 20px;
          }

          .login-left {
            min-height: auto;

            padding-bottom: 25px;
          }

          .login-right {
            min-height: auto;

            padding-bottom: 50px;
          }

          .hero-text {
            margin-top: 25px;
          }

          .login-features {
            display: none;
          }

          .modi-container {
            position: relative;

            left: auto;
            bottom: auto;

            width: 180px;

            margin:
              20px auto 0;
          }

          .quote {
            display: none;
          }

          .login-card {
            margin-top: 30px;

            max-width: 520px;
          }

          .digital-india {
            position: relative;

            top: auto;
            right: auto;

            width: 150px;

            margin:
              0 auto 15px;
          }

          .bottom-slogan {
            display: none;
          }
        }

        @media (max-width: 520px) {

          .login-layout {
            padding:
              22px 15px;
          }

          .brand-area h1 {
            font-size: 27px;
          }

          .brand-area p {
            font-size: 12px;
          }

          .brand-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .hero-text h2 {
            font-size: 32px;
          }

          .hero-text p {
            font-size: 15px;
          }

          .login-card {
            padding:
              30px 22px;
          }

          .login-heading h2 {
            font-size: 31px;
          }

          .login-heading p {
            font-size: 14px;
          }

          .login-button {
            font-size: 18px;
          }
        }

      `}</style>
    </div>
  );
}




export default LoginPage;