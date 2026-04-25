import { useState } from "react";
import NotificationPanel from "./NotificationPanel";

export default function APortalView({
  portalActions,
  handlePortalAction,
  successMessage,
  buildingsCount = 0,
  roomsCount = 0,
  ticketsCount = 0,
  authUser,
  handleLogout,
  notifications,
  unreadNotificationsCount,
  markNotificationsRead,
  clearNotifications,
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap portal-container">
        <div className="portal-top-bar">
          <div className="user-profile-badge">
            <div className="user-avatar">
              {authUser?.fullName?.charAt(0) || "U"}
            </div>
            <div className="user-text">
              <span className="user-name">{authUser?.fullName || "Guest"}</span>
              <span className="user-role">{authUser?.role || "Visitor"}</span>
            </div>
          </div>
          {authUser && (
            <div className="hero-actions">
              <button
                type="button"
                className="tiny-btn"
                onClick={() => setShowNotifications((current) => !current)}
              >
                Notifications ({unreadNotificationsCount})
              </button>
              <button
                type="button"
                className="logout-nav-btn"
                onClick={handleLogout}
              >
                <span className="btn-icon">Logout</span>
                <span className="btn-text">Logout</span>
              </button>
            </div>
          )}
        </div>

        {showNotifications && (
          <NotificationPanel
            title="Your Notifications"
            kicker="Notification Center"
            notifications={notifications}
            emptyText="No notifications yet."
            onMarkAllRead={markNotificationsRead}
            onClearAll={clearNotifications}
          />
        )}

        <header className="hero-banner portal-hero-v2">
          <div className="hero-content">
            <span className="hero-tag">Smart Campus Ecosystem</span>
            <h1>Intelligence & Facilities Hub</h1>
            <p>
              Experience the future of campus management. Streamline your day by
              managing resources, reporting issues, and accessing administrative
              tools from one unified interface.
            </p>
          </div>
          <div className="hero-visual">
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
              <p>
                <strong>Pro Tip:</strong> Open the notification center anytime to
                review booking decisions, ticket updates, and comments.
              </p>
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
