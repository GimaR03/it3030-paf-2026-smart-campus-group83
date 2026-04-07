export default function ABlankView({
  blankPageTitle,
  clearMessages,
  setCurrentDashboard,
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
          <h1>{blankPageTitle} Page</h1>
          <p>This page is intentionally blank.</p>
        </header>
      </div>
    </main>
  );
}
