export default function ALoginView({
  clearMessages,
  setCurrentDashboard,
  loginForm,
  setLoginForm,
  handleLoginSubmit,
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
          <div className="workspace-grid auth-center">
            <form className="glass-panel auth-panel" onSubmit={handleLoginSubmit}>
              <h2>User Login</h2>
              <label>
                Email
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
              <label>
                Password
                <input
                  required
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Enter password"
                />
              </label>

              <div className="table-actions">
                <button type="submit">Login</button>
                <button
                  type="button"
                  className="tiny-btn"
                  onClick={() => {
                    clearMessages();
                    setCurrentDashboard("register");
                  }}
                >
                  Register
                </button>
              </div>

              <p className="summary-note auth-note">
                Demo users: cadmin@gmail.com, admin@gmail.com, maintance@gmail.com
              </p>
            </form>
          </div>
          {errorMessage && <p className="message error">{errorMessage}</p>}
          {successMessage && <p className="message success">{successMessage}</p>}
        </section>
      </div>
    </main>
  );
}
