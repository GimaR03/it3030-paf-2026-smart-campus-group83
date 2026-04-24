import { useState } from "react";

const checklist = [
  "Use a @my.sliit.lk email address",
  "Password must be at least 6 characters",
  "Admin and maintenance accounts are managed separately",
];

export default function ARegisterView({
  clearMessages,
  setCurrentDashboard,
  registerForm,
  setRegisterForm,
  handleRegisterSubmit,
  errorMessage,
  successMessage,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap portal-container">
        <header className="hero-banner admin-hero-v3">
          <div className="hero-content">
            <span className="hero-tag">✦ Create Account</span>
            <h1>Campus Registration</h1>
            <p>
              Join the Smart Campus network to access advanced facility booking and support tools.
            </p>
          </div>
        </header>

        <section className="auth-layout-v3">
          <div className="auth-info-v3">
            <div className="section-header">
              <span className="panel-kicker">New Member</span>
              <h2>Registration Guidelines</h2>
              <p>Follow these steps to set up your access</p>
            </div>
            
            <div className="auth-feature-v3">
              <div className="icon">📧</div>
              <div>
                <strong>Campus Email Required</strong>
                <p>You must use a valid @my.sliit.lk email address to register.</p>
              </div>
            </div>

            <div className="auth-feature-v3">
              <div className="icon">🛡️</div>
              <div>
                <strong>Secure Password</strong>
                <p>Your password must be at least 6 characters long for system security.</p>
              </div>
            </div>

            <div className="stat-card-v3" style={{ background: 'var(--glass)', marginTop: 'auto' }}>
              <span>Access Level</span>
              <strong>Standard User Access</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginTop: '0.5rem' }}>
                Note: Admin and Maintenance roles are assigned by system administrators after registration.
              </p>
            </div>
          </div>

          <div className="auth-card-v3 animate-fade-in">
            <div className="form-header" style={{ marginBottom: '2rem' }}>
              <h3>Account Details</h3>
              <p>Complete the form below to register</p>
            </div>

            <form className="modern-form-wrap" onSubmit={handleRegisterSubmit}>
              <label className="modern-label">
                Full Name
                <input
                  className="modern-input"
                  value={registerForm.fullName}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="e.g. Nethmi Perera"
                />
              </label>

              <label className="modern-label">
                Campus Email
                <input
                  required
                  type="email"
                  className="modern-input"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="e.g. user@my.sliit.lk"
                />
              </label>

              <div className="form-grid-2">
                <label className="modern-label">
                  Password
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    className="modern-input"
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="••••••"
                  />
                </label>
                <label className="modern-label">
                  Confirm
                  <input
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    className="modern-input"
                    value={registerForm.confirmPassword}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    placeholder="••••••"
                  />
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="tiny-btn" style={{ width: '100%', padding: '1rem', background: 'var(--ink)', color: 'white' }}>
                  Register Account
                </button>
                <button
                  type="button"
                  className="tiny-btn"
                  style={{ width: '100%', padding: '1rem', background: 'white', border: '1px solid var(--line)' }}
                  onClick={() => {
                    clearMessages();
                    setCurrentDashboard("login");
                  }}
                >
                  Return to Login
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
