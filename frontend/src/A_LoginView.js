import { useState } from "react";

const heroSignals = [
  "📅 Room reservations",
  "🛠️ Maintenance tracking",
  "👩‍💼 Admin approvals",
];

const loginBenefits = [
  {
    emoji: "📅",
    title: "Manage reservations with clarity",
    description:
      "Check availability, submit bookings, and return to your latest requests without searching through scattered updates.",
  },
  {
    emoji: "🛠️",
    title: "Follow support and maintenance progress",
    description:
      "See issue reports, technician actions, and operational progress in one connected flow that feels easy to follow.",
  },
  {
    emoji: "🧭",
    title: "Open a workspace built for your role",
    description:
      "Students, staff, administrators, and maintenance teams each get a dashboard that keeps their most relevant tools close.",
  },
];

const trustNotes = [
  {
    emoji: "🔒",
    title: "Secure access",
    description: "Campus credentials keep your workspace protected and personalized.",
  },
  {
    emoji: "⚡",
    title: "Faster coordination",
    description: "Bookings, approvals, and support requests stay connected across teams.",
  },
  {
    emoji: "📍",
    title: "Clear visibility",
    description: "Important updates are easier to find the moment you sign in.",
  },
];

const heroChecklist = [
  "Professional sign-in for campus operations",
  "Organized tools for daily facility work",
  "A calmer first step into your dashboard",
];

export default function ALoginView({
  clearMessages,
  setCurrentDashboard,
  loginForm,
  setLoginForm,
  handleLoginSubmit,
  handleGoogleLogin,
  errorMessage,
  successMessage,
}) {
  const [showPassword, setShowPassword] = useState(false);

  void handleGoogleLogin;

  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap portal-container">
        <header className="hero-banner admin-hero-v3 login-hero-v5">
          <div className="hero-content login-hero-copy-v5">
            <span className="hero-tag">🏢 Smart Campus Operations</span>
            <h1>Sign in to a campus workspace that feels professional and organized</h1>
            <p>
              Access bookings, maintenance updates, and administrative tools from
              one clear system designed to help your team work with less clutter
              and more confidence.
            </p>

            <div className="login-hero-chip-row">
              {heroSignals.map((item) => (
                <span key={item} className="login-hero-chip">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <aside className="login-hero-panel">
            <span className="login-hero-panel-kicker">✨ First impressions matter</span>
            <strong>Your login should feel like the entrance to a real professional system.</strong>
            <p>
              This portal is built to help users move quickly, understand what is
              available, and trust the tools waiting behind their sign-in.
            </p>

            <div className="login-hero-checklist">
              {heroChecklist.map((item) => (
                <div key={item} className="login-hero-check-item">
                  <span>✔</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </header>

        <section className="auth-layout-v3 login-layout-v5">
          <div className="login-overview-pane">
            <article className="login-overview-card login-overview-intro">
              <span className="panel-kicker">Why This Login Page Works</span>
              <h2>Everything is arranged to feel clean, trustworthy, and easy to understand</h2>
              <p>
                Instead of showing many disconnected sections, this page guides
                users through a simple story: what the website is, what they can
                do after signing in, and why this portal is valuable for campus
                work every day.
              </p>
            </article>

            <article className="login-overview-card login-benefit-board">
              <div className="login-board-header">
                <span className="panel-kicker">What Awaits Inside</span>
                <h3>A clearer dashboard starts with a clearer login experience</h3>
                <p>
                  After sign-in, users can move directly into the work that matters
                  without confusion or unnecessary steps.
                </p>
              </div>

              <div className="login-benefit-list">
                {loginBenefits.map((item) => (
                  <article key={item.title} className="login-benefit-item">
                    <div className="login-benefit-icon">{item.emoji}</div>
                    <div className="login-benefit-copy">
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <div className="login-trust-grid">
              {trustNotes.map((item) => (
                <article key={item.title} className="login-trust-card">
                  <span className="login-trust-emoji">{item.emoji}</span>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="auth-card-v3 auth-card-shell login-form-card-v5 animate-fade-in">
            <div className="form-header auth-form-header login-form-header-v5">
              <span className="panel-kicker">🔐 Protected Access</span>
              <h3>Secure Login</h3>
              <p>
                Sign in with your campus email and password to continue to your
                personalized dashboard.
              </p>
            </div>

            <div className="login-form-note">
              <strong>Professional access, ready in seconds.</strong>
              <p>
                Your role determines the tools you see next, helping you enter a
                dashboard that already feels relevant and organized.
              </p>
            </div>

            <form className="modern-form-wrap" onSubmit={handleLoginSubmit}>
              <label className="modern-label">
                Campus Email
                <input
                  required
                  type="email"
                  className="modern-input"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="e.g. admin@my.sliit.lk"
                />
              </label>

              <label className="modern-label">
                Password
                <div className="password-wrapper">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    className="modern-input"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="password-inline-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <div className="login-utility-row">
                <label className="remember-check">
                  <input type="checkbox" />
                  Remember me
                </label>
                <button type="button" className="forgot-link">
                  Forgot Password?
                </button>
              </div>

              <div className="auth-button-stack">
                <button type="submit" className="tiny-btn auth-submit-btn">
                  Sign In to Dashboard
                </button>
                <button
                  type="button"
                  className="tiny-btn auth-secondary-btn"
                  onClick={() => {
                    clearMessages();
                    setCurrentDashboard("register");
                  }}
                >
                  Create New Account
                </button>
              </div>

              <div className="login-form-assurance">
                <div className="login-form-assurance-item">
                  <span>🪪</span>
                  <p>Use your campus email for direct access to your workspace.</p>
                </div>
                <div className="login-form-assurance-item">
                  <span>🚀</span>
                  <p>Designed to help users reach the right tools faster.</p>
                </div>
              </div>
            </form>
          </div>
        </section>

        {errorMessage && (
          <div className="toast-message error animate-fade-in">
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="toast-message success animate-fade-in">
            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </main>
  );
}
