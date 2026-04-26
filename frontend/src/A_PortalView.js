export default function APortalView({
  portalActions,
  handlePortalAction,
  successMessage,
  buildingsCount = 0,
  roomsCount = 0,
  ticketsCount = 0,
  authUser,
  handleLogout,
}) {
  return (
    <main className="dashboard-shell v6-portal-theme">
      <div className="v6-bg-blur" />
      <div className="dashboard-wrap portal-container">
        {/* Top Navigation */}
        <nav className="v6-nav-mini">
          <div className="v6-nav-user">
            <div className="v6-nav-avatar">
              {authUser?.fullName?.charAt(0) || "U"}
            </div>
            <div className="v6-nav-details">
              <span className="v6-nav-name">{authUser?.fullName || "Guest User"}</span>
              <span className="v6-nav-role">{authUser?.role || "Visitor"}</span>
            </div>
          </div>
          {authUser && (
            <button 
              type="button" 
              className="v6-nav-logout" 
              onClick={handleLogout}
            >
              Sign Out
            </button>
          )}
        </nav>

        {/* Hero Section */}
        <header className="v6-portal-hero">
          <div className="v6-hero-core">
            <div className="v6-hero-text">
                <span className="v6-hero-badge">✦ Smart Campus Platform</span>
                <h1>Intelligence & <br/> Facilities Hub</h1>
                <p>
                    A unified digital ecosystem for managing campus resources and operational requests. 
                    Monitor performance and engage with facilities in real-time.
                </p>
            </div>
            <div className="v6-hero-metrics">
                <div className="v6-metric-item">
                    <strong>{buildingsCount}</strong>
                    <span>Buildings</span>
                </div>
                <div className="v6-metric-item">
                    <strong>{roomsCount}</strong>
                    <span>Total Rooms</span>
                </div>
                <div className="v6-metric-item">
                    <strong>{ticketsCount}</strong>
                    <span>Live Tasks</span>
                </div>
            </div>
          </div>
        </header>

        {/* Action Grid */}
        <section className="v6-action-workspace">
          <div className="v6-section-header">
            <h2>Service Access Portal</h2>
            <div className="v6-header-line" />
          </div>
          
          <div className="v6-portal-grid">
            {portalActions.map((action, index) => (
              <button
                key={action.id}
                type="button"
                className={`v6-portal-card ${action.accent}`}
                style={{ "--idx": index }}
                onClick={() => handlePortalAction(action.id)}
              >
                <div className="v6-card-icon-group">
                  <span className="v6-card-icon">{action.icon}</span>
                  <div className="v6-card-glow" />
                </div>
                <div className="v6-card-content">
                  <h3>{action.title}</h3>
                  <p>{action.subtitle}</p>
                </div>
                <div className="v6-card-footer">
                  <span>Enter Service</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Footer Info */}
        <footer className="v6-portal-footer">
          <div className="v6-footer-banner">
             <div className="v6-footer-msg">
                <span className="v6-footer-icon">💡</span>
                <p><strong>Optimize Operations:</strong> Real-time tracking is now enabled for all maintenance staff across the campus.</p>
             </div>
             <div className="v6-footer-msg">
                <span className="v6-footer-icon">🛡️</span>
                <p>All data is encrypted and handled according to campus privacy standards.</p>
             </div>
          </div>
        </footer>

        {successMessage && (
          <div className="v6-toast-success">
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      <style>{`
        .v6-portal-theme {
            background-color: #f0f9ff;
            min-height: 100vh;
            color: #0f172a;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            overflow-x: hidden;
            position: relative;
        }

        .v6-bg-blur {
            position: absolute;
            top: -100px;
            right: -100px;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
            filter: blur(80px);
            pointer-events: none;
            z-index: 0;
        }

        .v6-nav-mini {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 0;
            position: relative;
            z-index: 10;
        }

        .v6-nav-user {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .v6-nav-avatar {
            width: 44px;
            height: 44px;
            background: #ffffff;
            color: #020617;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.25rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .v6-nav-details {
            display: flex;
            flex-direction: column;
        }

        .v6-nav-name { font-weight: 700; font-size: 0.95rem; color: #0f172a; }
        .v6-nav-role { font-size: 0.75rem; color: #64748b; font-weight: 500; }

        .v6-nav-logout {
            background: rgba(0,0,0,0.05);
            border: 1px solid rgba(0,0,0,0.1);
            color: #0f172a;
            padding: 0.6rem 1.2rem;
            border-radius: 100px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .v6-nav-logout:hover {
            background: #0f172a;
            color: #ffffff;
        }

        .v6-portal-hero {
            padding: 3rem 0;
            position: relative;
            z-index: 1;
        }

        .v6-hero-core {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            gap: 4rem;
        }

        .v6-hero-badge {
            display: inline-block;
            background: rgba(30, 64, 175, 0.2);
            color: #60a5fa;
            padding: 0.4rem 1rem;
            border-radius: 100px;
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.05em;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(30, 64, 175, 0.3);
        }

        .v6-hero-text h1 {
            font-size: 4rem;
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            letter-spacing: -0.02em;
            background: linear-gradient(to bottom right, #0f172a 50%, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .v6-hero-text p {
            font-size: 1.15rem;
            color: #475569;
            max-width: 500px;
            line-height: 1.6;
        }

        .v6-hero-metrics {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            background: rgba(255, 255, 255, 0.7);
            padding: 2.5rem;
            border-radius: 32px;
            border: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        .v6-metric-item {
            display: flex;
            flex-direction: column;
        }

        .v6-metric-item strong {
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
        }

        .v6-metric-item span {
            font-size: 0.8rem;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 600;
        }

        .v6-action-workspace {
            padding: 4rem 0;
        }

        .v6-section-header {
            margin-bottom: 3rem;
        }

        .v6-section-header h2 {
            font-size: 1.75rem;
            font-weight: 800;
            margin-bottom: 0.75rem;
            color: #0f172a;
        }

        .v6-header-line {
            width: 50px;
            height: 3px;
            background: #0ea5e9;
            border-radius: 2px;
        }

        .v6-portal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 2rem;
        }

        .v6-portal-card {
            background: #ffffff;
            border: none;
            border-radius: 32px;
            padding: 2.5rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            text-align: left;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            animation: v6CardIn 0.6s ease forwards;
            animation-delay: calc(var(--idx) * 0.1s);
            opacity: 0;
        }

        @keyframes v6CardIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .v6-portal-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }

        .v6-card-icon-group {
            width: 64px;
            height: 64px;
            background: #f1f5f9;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
            position: relative;
        }

        .v6-card-glow {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: currentColor;
            opacity: 0.1;
            filter: blur(10px);
        }

        .v6-card-content h3 {
            font-size: 1.5rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.5rem;
        }

        .v6-card-content p {
            font-size: 0.95rem;
            color: #64748b;
            line-height: 1.5;
        }

        .v6-card-footer {
            margin-top: auto;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 800;
            font-size: 0.85rem;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Accent Colors (Keeping original user colors) */
        .v6-portal-card.blue .v6-card-icon-group { color: #2563eb; }
        .v6-portal-card.emerald .v6-card-icon-group { color: #059669; }
        .v6-portal-card.sky .v6-card-icon-group { color: #0ea5e9; }
        .v6-portal-card.indigo .v6-card-icon-group { color: #4f46e5; }
        .v6-portal-card.rose .v6-card-icon-group { color: #e11d48; }

        .v6-portal-footer {
            padding: 4rem 0;
            border-top: 1px solid rgba(0,0,0,0.05);
        }

        .v6-footer-banner {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            background: rgba(255,255,255,0.6);
            padding: 2rem;
            border-radius: 24px;
            border: 1px solid rgba(0,0,0,0.03);
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }

        .v6-footer-msg {
            display: flex;
            gap: 1.25rem;
            align-items: flex-start;
        }

        .v6-footer-icon { font-size: 1.5rem; }
        .v6-footer-msg p { font-size: 0.9rem; color: #475569; line-height: 1.6; }
        .v6-footer-msg strong { color: #0f172a; }

        .v6-toast-success {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #ffffff;
            color: #020617;
            padding: 1rem 2rem;
            border-radius: 16px;
            font-weight: 800;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            animation: v6ToastIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
        }

        @keyframes v6ToastIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @media (max-width: 968px) {
            .v6-hero-core { grid-template-columns: 1fr; gap: 2rem; }
            .v6-hero-text h1 { font-size: 2.75rem; }
            .v6-hero-metrics { flex-direction: row; justify-content: space-between; }
            .v6-footer-banner { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
