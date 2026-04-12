export default function ARegisterView({
  clearMessages,
  setCurrentDashboard,
  registerForm,
  setRegisterForm,
  handleRegisterSubmit,
  errorMessage,
  successMessage,
}) {
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
                setCurrentDashboard("login");
              }}
            >
              Back To Login
            </button>
          </div>
          <h1>Register</h1>
          <p>Create a new account to use this system.</p>
        </header>

        <section className="workspace">
          <div className="workspace-grid auth-center">
            <form className="glass-panel auth-panel" onSubmit={handleRegisterSubmit}>
              <h2>Create Account</h2>

              <label>
                Full Name
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
              <label>
                Email
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
              <label>
                Password
                <input
                  required
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="At least 6 characters"
                />
              </label>
              <label>
                Confirm Password
                <input
                  required
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder="Re-enter password"
                />
              </label>

              <button type="submit">Register</button>
            </form>
          </div>
          {errorMessage && <p className="message error">{errorMessage}</p>}
          {successMessage && <p className="message success">{successMessage}</p>}
        </section>
      </div>
    </main>
  );
}
