import { useState } from "react";

const affiliationOptions = [
  "Student",
  "Academic Staff",
  "Administrative Staff",
  "Maintenance Team",
  "Visitor",
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
  const today = new Date().toISOString().split("T")[0];

  const profileChecks = [
    {
      label: "Full profile details added",
      valid:
        registerForm.fullName.trim() &&
        registerForm.email.trim() &&
        registerForm.phoneNumber.trim() &&
        registerForm.idNumber.trim() &&
        registerForm.dateOfBirth &&
        registerForm.affiliation &&
        registerForm.department.trim(),
    },
    {
      label: "Phone number has 10 digits",
      valid: /^\d{10}$/.test(registerForm.phoneNumber),
    },
    {
      label: "ID number format looks valid",
      valid: /^[A-Z0-9]{6,15}$/.test(registerForm.idNumber),
    },
    {
      label: "Date of birth is in the past",
      valid:
        Boolean(registerForm.dateOfBirth) &&
        !Number.isNaN(new Date(registerForm.dateOfBirth).getTime()) &&
        registerForm.dateOfBirth < today,
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
      <div className="dashboard-wrap">
        <header className="hero-banner portal-hero register-hero">
          <div className="hero-head-row">
            <span className="hero-tag">Smart Campus Access</span>
            <button
              type="button"
              className="tiny-btn hero-back"
              onClick={() => {
                clearMessages();
                setCurrentDashboard("login");
              }}
            >
              Back To Login
            </button>
          </div>
          <div className="register-hero-grid">
            <div>
              <h1>Register</h1>
              <p>
                Create a complete campus profile with clear personal details, identity
                information, and login credentials in one guided flow.
              </p>
            </div>
            <div className="register-hero-highlights">
              {registerHighlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </header>

        <section className="workspace">
          <div className="register-experience">
            <form className="register-form-surface" onSubmit={handleRegisterSubmit}>
              <div className="register-form-top">
                <span className="auth-eyebrow register-eyebrow">New Account Setup</span>
                <h2>Build your Smart Campus account</h2>
                <p>
                  The registration page is designed as a guided onboarding form so each section
                  feels easier to understand and complete.
                </p>
              </div>

              <div className="register-section-grid">
                <section className="register-card register-card-primary">
                  <div className="register-card-head">
                    <div>
                      <span>01</span>
                      <h3>Personal Identity</h3>
                    </div>
                    <p>These details help clearly identify the user account.</p>
                  </div>

                  <div className="auth-form-split">
                    <label className="auth-field">
                      <span>Full Name</span>
                      <input
                        required
                        value={registerForm.fullName}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            fullName: event.target.value,
                          }))
                        }
                        placeholder="John Silva"
                      />
                    </label>

                    <label className="auth-field">
                      <span>Email Address</span>
                      <input
                        required
                        type="email"
                        value={registerForm.email}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="user@gmail.com"
                      />
                    </label>
                  </div>

                  <div className="auth-form-split">
                    <label className="auth-field">
                      <span>Phone Number</span>
                      <input
                        required
                        inputMode="numeric"
                        maxLength={10}
                        value={registerForm.phoneNumber}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            phoneNumber: event.target.value.replace(/\D/g, "").slice(0, 10),
                          }))
                        }
                        placeholder="0712345678"
                      />
                      <small className="auth-field-note">Must contain exactly 10 digits.</small>
                    </label>

                    <label className="auth-field">
                      <span>ID Number</span>
                      <input
                        required
                        value={registerForm.idNumber}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            idNumber: event.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "")
                              .slice(0, 15),
                          }))
                        }
                        placeholder="199912345678"
                      />
                      <small className="auth-field-note">
                        Use 6 to 15 letters or numbers only.
                      </small>
                    </label>
                  </div>
                </section>

                <section className="register-card">
                  <div className="register-card-head">
                    <div>
                      <span>02</span>
                      <h3>Campus Profile</h3>
                    </div>
                    <p>These details help place the user in the right campus context.</p>
                  </div>

                  <div className="auth-form-split">
                    <label className="auth-field">
                      <span>Date of Birth</span>
                      <input
                        required
                        type="date"
                        max={today}
                        value={registerForm.dateOfBirth}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            dateOfBirth: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="auth-field">
                      <span>Affiliation</span>
                      <select
                        required
                        value={registerForm.affiliation}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            affiliation: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select affiliation</option>
                        {affiliationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="auth-field">
                    <span>Faculty / Department</span>
                    <input
                      required
                      value={registerForm.department}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          department: event.target.value,
                        }))
                      }
                      placeholder="Computing, Engineering, Administration..."
                    />
                  </label>

                  <div className="register-inline-note">
                    <strong>Profile tip</strong>
                    <p>
                      Accurate department and affiliation details make approvals, bookings, and
                      support flows easier later.
                    </p>
                  </div>
                </section>

                <section className="register-card register-card-security">
                  <div className="register-card-head">
                    <div>
                      <span>03</span>
                      <h3>Security Access</h3>
                    </div>
                    <p>Create login credentials for your new account.</p>
                  </div>

                  <label className="auth-field">
                    <span>Password</span>
                    <div className="auth-password-row">
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        value={registerForm.password}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        placeholder="At least 6 characters"
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

                  <label className="auth-field">
                    <span>Confirm Password</span>
                    <div className="auth-password-row">
                      <input
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerForm.confirmPassword}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            confirmPassword: event.target.value,
                          }))
                        }
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        className="auth-ghost-btn"
                        onClick={() => setShowConfirmPassword((current) => !current)}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </label>
                </section>
              </div>

              <div className="register-actions-bar">
                <div className="auth-actions">
                  <button type="submit" className="auth-primary-btn register-submit-btn">
                    Create Account
                  </button>
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      clearMessages();
                      setCurrentDashboard("login");
                    }}
                  >
                    Already have an account?
                  </button>
                </div>

                <div className="auth-mini-note register-mini-note">
                  <strong>Next step</strong>
                  <p>
                    After successful registration, you will be redirected to the login page to
                    sign in with your new details.
                  </p>
                </div>
              </div>
            </form>

            <aside className="register-sidebar">
              <div className="register-summary-card glass-panel">
                <span className="register-side-kicker">Registration Status</span>
                <h3>{readyCount} of 6 checks ready</h3>
                <p>
                  The sidebar gives users a cleaner sense of progress while they complete the
                  form.
                </p>
                <div className="register-progress-track">
                  <div
                    className="register-progress-bar"
                    style={{ width: `${(readyCount / profileChecks.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="register-check-card glass-panel">
                <h3>Readiness Checklist</h3>
                <div className="register-check-stack">
                  {profileChecks.map((check) => (
                    <article
                      key={check.label}
                      className={`register-check-item ${check.valid ? "valid" : ""}`}
                    >
                      <span>{check.valid ? "Ready" : "Pending"}</span>
                      <strong>{check.label}</strong>
                    </article>
                  ))}
                </div>
              </div>

              <div className="register-benefit-card glass-panel">
                <h3>Why this page feels different</h3>
                <p>
                  Login should be quick. Registration should feel guided. This version separates
                  setup into clearer stages so new users are less likely to feel lost.
                </p>
                <ul className="register-benefit-list">
                  <li>Grouped details instead of one long plain form</li>
                  <li>Sidebar progress feedback while typing</li>
                  <li>Distinct visual identity from the login page</li>
                </ul>
              </div>
            </aside>
          </div>

          {errorMessage && <p className="message error">{errorMessage}</p>}
          {successMessage && <p className="message success">{successMessage}</p>}
        </section>
      </div>
    </main>
  );
}
