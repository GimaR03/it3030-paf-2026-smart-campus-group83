import { useState } from "react";

const affiliationOptions = [
  "Academic Staff",
  "Administrative Staff",
];

const registerHighlights = [
  "Room booking access",
  "Maintenance request tracking",
  "Campus-ready user profile",
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

  const profileChecks = [
    {
      label: "Phone number has 10 digits",
      valid: /^\d{10}$/.test(registerForm.phoneNumber),
    },
    {
      label: "ID number format looks valid",
      valid: /^[A-Z0-9]{6,15}$/.test(registerForm.idNumber),
    },
    {
      label: "Password is at least 6 characters",
      valid: registerForm.password.length >= 6,
    },
    {
      label: "Password matches confirmation",
      valid:
        registerForm.confirmPassword.length > 0 &&
        registerForm.password === registerForm.confirmPassword,
    },
  ];

  const readyCount = profileChecks.filter((item) => item.valid).length;

  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap portal-container">
        <header className="hero-banner portal-hero-v2 register-hero-v2">
          <div className="hero-content">
            <span className="hero-tag">✦ New Account Onboarding</span>
            <h1>Join the Ecosystem</h1>
            <p>
              Create your official campus identity to access advanced tools, 
              request resources, and collaborate across departments.
            </p>
          </div>
          <div className="hero-visual">
            <div className="pulsing-orb" style={{ background: "radial-gradient(circle, var(--leaf) 0%, transparent 70%)" }} />
          </div>
        </header>

        <section className="portal-action-section">
          <div className="auth-split-layout registration-layout">
            <div className="auth-form-pane wide-pane">
              <form className="portal-card-premium register-form-card" onSubmit={handleRegisterSubmit} style={{ animationDelay: "0.1s", display: "block", cursor: "default" }}>
                <div className="form-header">
                  <h3>Account Creation</h3>
                  <p>Follow the sections to complete your profile</p>
                </div>

                <div className="registration-grid">
                  {/* Section 1: Identity */}
                  <div className="reg-section">
                    <div className="reg-section-head">
                      <span className="reg-step">01</span>
                      <h4>Identity Details</h4>
                    </div>
                    <div className="input-grid-2">
                      <div className="input-group">
                        <label className="portal-label">Full Name</label>
                        <input
                          required
                          className="portal-input"
                          value={registerForm.fullName}
                          onChange={(event) =>
                            setRegisterForm((current) => ({
                              ...current,
                              fullName: event.target.value,
                            }))
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="input-group">
                        <label className="portal-label">Email Address</label>
                        <input
                          required
                          type="email"
                          className="portal-input"
                          value={registerForm.email}
                          onChange={(event) =>
                            setRegisterForm((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                          placeholder="john@campus.com"
                        />
                        <small className="auth-field-note">
                          Use your SLIIT email in this format: username@my.sliit.lk
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Contact & ID */}
                  <div className="reg-section">
                    <div className="reg-section-head">
                      <span className="reg-step">02</span>
                      <h4>Verification</h4>
                    </div>
                    <div className="input-grid-2">
                      <div className="input-group">
                        <label className="portal-label">Phone Number</label>
                        <input
                          required
                          className="portal-input"
                          maxLength={10}
                          value={registerForm.phoneNumber}
                          onChange={(event) =>
                            setRegisterForm((current) => ({
                              ...current,
                              phoneNumber: event.target.value.replace(/\D/g, ""),
                            }))
                          }
                          placeholder="07XXXXXXXX"
                        />
                      </div>
                      <div className="input-group">
                        <label className="portal-label">Campus ID Number</label>
                        <input
                          required
                          className="portal-input"
                          value={registerForm.idNumber}
                          onChange={(event) =>
                            setRegisterForm((current) => ({
                              ...current,
                              idNumber: event.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="CID-XXXXXX"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Affiliation */}
                  <div className="reg-section">
                    <div className="reg-section-head">
                      <span className="reg-step">03</span>
                      <h4>Campus Context</h4>
                    </div>
                    <div className="input-grid-2">
                      <div className="input-group">
                        <label className="portal-label">Affiliation</label>
                        <select
                          required
                          className="portal-input"
                          value={registerForm.affiliation}
                          onChange={(event) =>
                            setRegisterForm((current) => ({
                              ...current,
                              affiliation: event.target.value,
                            }))
                          }
                        >
                          <option value="">Select Role</option>
                          {affiliationOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div className="input-group">
                        <label className="portal-label">Department</label>
                        <input
                          required
                          className="portal-input"
                          value={registerForm.department}
                          onChange={(event) =>
                            setRegisterForm((current) => ({
                              ...current,
                              department: event.target.value,
                            }))
                          }
                          placeholder="e.g. Computer Science"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Security */}
                  <div className="reg-section">
                    <div className="reg-section-head">
                      <span className="reg-step">04</span>
                      <h4>Security Access</h4>
                    </div>
                    <div className="input-grid-2">
                      <div className="input-group">
                        <label className="portal-label">Password</label>
                        <div className="password-wrapper">
                          <input
                            required
                            type={showPassword ? "text" : "password"}
                            className="portal-input"
                            value={registerForm.password}
                            onChange={(event) =>
                              setRegisterForm((current) => ({
                                ...current,
                                password: event.target.value,
                              }))
                            }
                            placeholder="At least 6 chars"
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword((current) => !current)}
                          >
                            {showPassword ? "🙈" : "👁️"}
                          </button>
                        </div>
                      </div>
                      <div className="input-group">
                        <label className="portal-label">Confirm Password</label>
                        <div className="password-wrapper">
                          <input
                            required
                            type={showConfirmPassword ? "text" : "password"}
                            className="portal-input"
                            value={registerForm.confirmPassword}
                            onChange={(event) =>
                              setRegisterForm((current) => ({
                                ...current,
                                confirmPassword: event.target.value,
                              }))
                            }
                            placeholder="Match password"
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword((current) => !current)}
                          >
                            {showConfirmPassword ? "🙈" : "👁️"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-footer-actions registration-footer">
                  <button type="submit" className="primary-btn portal-btn wide-btn">
                    Complete Registration
                  </button>
                  <button
                    type="button"
                    className="secondary-btn portal-btn-link"
                    onClick={() => {
                      clearMessages();
                      setCurrentDashboard("login");
                    }}
                  >
                    Already have an account? <strong>Login</strong>
                  </button>
                </div>
              </form>
            </div>

            <aside className="auth-info-pane registration-side">
              <div className="stats-bar-premium register-status-card" style={{ flexDirection: "column", padding: "1.5rem" }}>
                <span className="stat-label">Progress Readiness</span>
                <div className="progress-radial-wrap">
                  <span className="progress-number">{readyCount}/{profileChecks.length}</span>
                  <p>Checklist Completion</p>
                </div>
                <div className="reg-checklist">
                  {profileChecks.map((check, idx) => (
                    <div key={idx} className={`reg-check-item-v2 ${check.valid ? "active" : ""}`}>
                      <span className="check-mark">{check.valid ? "✓" : "○"}</span>
                      <span className="check-text">{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="info-block-v2 stats-bar-premium" style={{ marginTop: "1.5rem", padding: "1.5rem", background: "var(--glass)" }}>
                <span className="info-icon">💡</span>
                <p>Ensuring your details match your campus records will speed up the administrative approval process.</p>
              </div>
            </aside>
          </div>
        </section>

        <div className="portal-footer-actions">
          <button
            type="button"
            className="tiny-btn"
            onClick={() => {
              clearMessages();
              setCurrentDashboard("portal");
            }}
          >
            ← Back to Public Portal
          </button>
        </div>

        {errorMessage && (
          <div className="toast-message error">
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="toast-message success">
            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </main>
  );
}

