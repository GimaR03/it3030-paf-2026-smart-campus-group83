import { useState } from "react";

const loginHighlights = [
  {
    eyebrow: "Faster reservations",
    title: "Book rooms without the clutter",
    description:
      "Jump back into your campus workspace and continue reservations, requests, and updates in one place.",
  },
  {
    eyebrow: "Clear status tracking",
    title: "See what matters right away",
    description:
      "Keep an eye on bookings, approvals, and maintenance progress with a calmer, easier flow.",
  },
];

const demoUsers = [
  {
    role: "Campus Super Admin",
    email: "cadmin@gmail.com",
  },
  {
    role: "Campus Admin",
    email: "admin@gmail.com",
  },
  {
    role: "Maintenance Staff",
    email: "maintance@gmail.com",
  },
];

export default function ALoginView({
  clearMessages,
  setCurrentDashboard,
  loginForm,
  setLoginForm,
  handleLoginSubmit,
  errorMessage,
  successMessage,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap">
        <header className="hero-banner portal-hero">
          <div className="hero-head-row">
            <span className="hero-tag">Smart Campus Access</span>
            <button
              type="button"
              className="tiny-btn hero-back"
              onClick={() => {
                clearMessages();
                setCurrentDashboard("portal");
              }}
            >
              Back To Portal
            </button>
          </div>
          <h1>Login</h1>
          <p>Login with your email and password to continue.</p>
        </header>

        <section className="workspace">
          <div className="workspace-grid auth-layout">
            <aside className="auth-showcase glass-panel">
              <div className="auth-showcase-copy">
                <span className="auth-kicker">Welcome back</span>
                <h2>Step into a calmer campus booking experience.</h2>
                <p>
                  Sign in to manage hall reservations, view requests, and keep your day moving
                  with less friction.
                </p>
              </div>

              <div className="auth-highlight-list">
                {loginHighlights.map((item) => (
                  <article key={item.title} className="auth-highlight-card">
                    <span>{item.eyebrow}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>

              <div className="auth-status-row">
                <div>
                  <strong>One login</strong>
                  <span>Access bookings, tickets, and room updates in one flow.</span>
                </div>
                <div>
                  <strong>Live-ready</strong>
                  <span>Built for quick actions on desktop and mobile.</span>
                </div>
              </div>
            </aside>

            <div className="auth-panel-shell">
              <form className="glass-panel auth-panel auth-login-panel" onSubmit={handleLoginSubmit}>
                <div className="auth-form-head">
                  <span className="auth-eyebrow">User Login</span>
                  <h2>Continue to Smart Campus</h2>
                  <p>
                    Use your account details below and pick up right where you left off.
                  </p>
                </div>

                <label className="auth-field">
                  <span>Email Address</span>
                  <input
                    required
                    type="email"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="name@gmail.com"
                  />
                </label>

                <label className="auth-field">
                  <span>Password</span>
                  <div className="auth-password-row">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="auth-ghost-btn"
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                <div className="auth-actions">
                  <button type="submit" className="auth-primary-btn">
                    Login
                  </button>
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      clearMessages();
                      setCurrentDashboard("register");
                    }}
                  >
                    Create new account
                  </button>
                </div>

                <div className="auth-demo-block">
                  <div className="auth-demo-head">
                    <h3>Demo Accounts</h3>
                    <p>Use any of these sample users to explore the system.</p>
                  </div>
                  <div className="auth-demo-grid">
                    {demoUsers.map((user) => (
                      <article key={user.email} className="auth-demo-card">
                        <span>{user.role}</span>
                        <strong>{user.email}</strong>
                      </article>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
          {errorMessage && <p className="message error">{errorMessage}</p>}
          {successMessage && <p className="message success">{successMessage}</p>}
        </section>
      </div>
    </main>
  );
}
