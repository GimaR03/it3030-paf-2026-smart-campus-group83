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
    role: "Demo Admin",
    email: "admin@my.sliit.lk",
    password: "Admin@123",
  },
  {
    role: "Maintenance Staff",
    email: "maintenance@my.sliit.lk",
    password: "Maintenance@123",
  },
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

  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap portal-container">
        <header className="hero-banner admin-hero-v3">
          <div className="hero-content">
            <span className="hero-tag">✦ Staff & Admin Portal</span>
            <h1>Welcome Back</h1>
            <p>
              Access your personalized campus dashboard to manage reservations, 
              track requests, and oversee facility operations.
            </p>
          </div>
        </header>

        <section className="auth-layout-v3">
          <div className="auth-info-v3">
            <div className="section-header">
              <span className="panel-kicker">Professional Access</span>
              <h2>Why sign in?</h2>
              <p>Unlock localized management tools for your faculty</p>
            </div>
            
            <div className="auth-feature-v3">
              <div className="icon">🚀</div>
              <div>
                <strong>Faster Reservations</strong>
                <p>Book rooms without the clutter. Save favorites and auto-fill details.</p>
              </div>
            </div>

            <div className="auth-feature-v3">
              <div className="icon">📊</div>
              <div>
                <strong>Clear Status Tracking</strong>
                <p>Monitor approvals and maintenance progress in real-time.</p>
              </div>
            </div>

            <div className="stat-card-v3" style={{ background: 'var(--glass)', marginTop: 'auto' }}>
              <span>Developer Note</span>
              <strong>Demo Access Accounts</strong>
              <div className="demo-badge-grid" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {demoUsers.map((user) => (
                  <div key={user.email} className="demo-badge" style={{ padding: '0.75rem', background: 'white', borderRadius: '12px', border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--ink-soft)', display: 'block' }}>{user.role}</span>
                    <strong style={{ fontSize: '0.8rem', display: 'block' }}>{user.email}</strong>
                    <code style={{ fontSize: '0.75rem', color: 'var(--teal)' }}>{user.password}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="auth-card-v3 animate-fade-in">
            <div className="form-header" style={{ marginBottom: '2rem' }}>
              <h3>Secure Login</h3>
              <p>Enter your credentials to continue</p>
            </div>

            <form className="modern-form-wrap" onSubmit={handleLoginSubmit}>
              <label className="modern-label">
                Campus Email
                <input
                  required
                  type="email"
                  className="modern-input"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="e.g. admin@my.sliit.lk"
                />
              </label>

              <label className="modern-label">
                Password
                <div className="password-wrapper" style={{ position: 'relative' }}>
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    className="modern-input"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--teal)', fontWeight: '600', cursor: 'pointer' }}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  Remember me
                </label>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                  Forgot Password?
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="tiny-btn" style={{ width: '100%', padding: '1rem', background: 'var(--ink)', color: 'white' }}>
                  Sign In to Dashboard
                </button>
                <button
                  type="button"
                  className="tiny-btn"
                  style={{ width: '100%', padding: '1rem', background: 'white', border: '1px solid var(--line)' }}
                  onClick={() => {
                    clearMessages();
                    setCurrentDashboard("register");
                  }}
                >
                  Create New Account
                </button>
              </div>
            </form>
          </div>
        </section>

        {errorMessage && <div className="toast-message error animate-fade-in"><span>{errorMessage}</span></div>}
        {successMessage && <div className="toast-message success animate-fade-in"><span>{successMessage}</span></div>}
      </div>
    </main>
  );
}
