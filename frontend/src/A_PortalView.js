export default function A_PortalView({
  portalActions,
  handlePortalAction,
  successMessage,
}) {
  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap">
        <header className="hero-banner portal-hero">
          <span className="hero-tag">Smart Campus Access</span>
          <h1>Smart Campus Portal</h1>
          <p>
            Choose an action to continue. Use Admin to open your created admin page,
            or jump directly to booking and ticket sections.
          </p>
        </header>

        <section className="action-grid portal-grid">
          {portalActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`action-button ${action.accent}`}
              onClick={() => handlePortalAction(action.id)}
            >
              <span>{action.title}</span>
              <small>{action.subtitle}</small>
            </button>
          ))}
        </section>

        {successMessage && <p className="message success">{successMessage}</p>}
      </div>
    </main>
  );
}
