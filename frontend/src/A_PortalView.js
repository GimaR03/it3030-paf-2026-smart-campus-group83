export default function APortalView({
  portalActions,
  handlePortalAction,
  successMessage,
  buildingsCount = 0,
  roomsCount = 0,
  ticketsCount = 0,
}) {
  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap portal-container">
        <header className="hero-banner portal-hero-v2">
          <div className="hero-content">
            <span className="hero-tag">✦ Smart Campus Ecosystem</span>
            <h1>Intelligence & Facilities Hub</h1>
            <p>
              Experience the future of campus management. Streamline your day by 
              managing resources, reporting issues, and accessing administrative 
              power—all from one unified interface.
            </p>
          </div>
          <div className="hero-visual">
            {/* Visual element or decorative illustration placeholder */}
            <div className="pulsing-orb" />
          </div>
        </header>

        <section className="stats-bar-premium">
          <div className="stat-item">
            <span className="stat-value">{buildingsCount}</span>
            <span className="stat-label">Total Buildings</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{roomsCount}</span>
            <span className="stat-label">Managed Rooms</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{ticketsCount}</span>
            <span className="stat-label">Active Tickets</span>
          </div>
        </section>

        <section className="portal-action-section">
          <div className="section-header">
            <h2>Quick Access Portal</h2>
            <p>Select a service to proceed</p>
          </div>
          <div className="action-grid portal-grid-v2">
            {portalActions.map((action, index) => (
              <button
                key={action.id}
                type="button"
                className={`portal-card-premium ${action.accent}`}
                style={{ "--delay": `${index * 0.1}s` }}
                onClick={() => handlePortalAction(action.id)}
              >
                <div className="card-icon-wrap">
                  <span className="card-icon">{action.icon}</span>
                </div>
                <div className="card-info">
                  <span className="card-title">{action.title}</span>
                  <span className="card-subtitle">{action.subtitle}</span>
                </div>
                <div className="card-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </section>

        <footer className="portal-footer-info">
          <div className="footer-glass">
            <div className="info-block">
              <span className="info-icon">💡</span>
              <p><strong>Pro Tip:</strong> Use the Admin Panel to update building layouts in real-time.</p>
            </div>
            <div className="info-block">
              <span className="info-icon">🛡️</span>
              <p>Secure access enabled for authorized staff only.</p>
            </div>
          </div>
        </footer>

        {successMessage && (
          <div className="toast-message success">
            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </main>
  );
}

