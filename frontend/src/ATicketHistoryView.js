import React, { useState, useEffect } from "react";
import { formatLabel } from "./A_helpers";
import ATicketComments from "./ATicketComments";
import {
  getTicketNotifications,
  markTicketNotificationsRead,
  clearTicketNotifications,
} from "./ticketNotifications";

export default function ATicketHistoryView({
  authUser,
  myTicketHistory,
  myTicketStatusCount,
  getTicketStatusTone,
  getTicketBuildingLabel,
  handleStartTicketEdit,
  handleDeleteTicket,
  setCurrentDashboard,
  clearMessages,
  errorMessage,
  successMessage,
  handleLogout,
}) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (authUser?.userId) {
      const notifs = getTicketNotifications(authUser.userId);
      setNotifications(notifs.filter((n) => !n.read));
      markTicketNotificationsRead(authUser.userId);
    }
  }, [authUser]);

  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap portal-container">
        <div className="portal-top-bar">
          <div className="user-profile-badge">
            <div className="user-avatar">{authUser?.fullName?.charAt(0) || "U"}</div>
            <div className="user-text">
              <span className="user-name">{authUser?.fullName || "User"}</span>
              <span className="user-role">Campus Member</span>
            </div>
          </div>
          <div className="v6-nav-actions">
              <button
                type="button"
                className="v6-action-pill"
                onClick={() => {
                  clearMessages();
                  setCurrentDashboard("ticket");
                }}
              >
                <span className="pill-icon">⬅️</span>
                <span className="pill-text">Back to Request Form</span>
              </button>
              <button type="button" className="v6-action-pill danger" onClick={handleLogout}>
                <span className="pill-icon">🚪</span>
                <span className="pill-text">Logout</span>
              </button>
          </div>
        </div>

        <header className="hero-banner admin-hero-v3">
          <div className="hero-content">
            <span className="hero-tag">✦ Smart Campus Tracking</span>
            <h1>Ticket History</h1>
            <p>
              Review and manage your maintenance requests. Stay updated with real-time status changes from our support team.
            </p>
          </div>
        </header>

        <section className="stats-v3">
          <article className="stat-card-v3">
            <span>Total Submitted</span>
            <strong>{myTicketHistory.length}</strong>
            <small>Lifetime requests</small>
          </article>
          <article className="stat-card-v3">
            <span>Open</span>
            <strong>{myTicketStatusCount.OPEN || 0}</strong>
            <small>Awaiting response</small>
          </article>
          <article className="stat-card-v3">
            <span>In Progress</span>
            <strong>{myTicketStatusCount.IN_PROGRESS || 0}</strong>
            <small>Being handled</small>
          </article>
          <article className="stat-card-v3">
            <span>Resolved</span>
            <strong>{myTicketStatusCount.RESOLVED || 0}</strong>
            <small>Completed work</small>
          </article>
        </section>

        {errorMessage && <p className="message error">{errorMessage}</p>}
        {successMessage && <p className="message success">{successMessage}</p>}

        {notifications.length > 0 && (
          <article className="glass-panel" style={{ marginBottom: "1rem", border: "1px solid rgba(74,158,255,0.4)", background: "rgba(74,158,255,0.08)" }}>
            <div className="panel-header-actions">
              <h3 style={{ margin: 0, fontSize: "1rem" }}>🔔 New Updates on Your Tickets</h3>
              <button
                type="button"
                className="tiny-btn"
                onClick={() => {
                  clearTicketNotifications(authUser?.userId);
                  setNotifications([]);
                }}
              >
                Dismiss All
              </button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0 0" }}>
              {notifications.map((n) => (
                <li key={n.id} style={{ padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.07)", fontSize: "0.9rem" }}>
                  <span style={{ marginRight: "0.75rem" }}>
                    {n.type === "STATUS_CHANGE" ? "🔄" : "💬"}
                  </span>
                  {n.message}
                  <small style={{ marginLeft: "0.75rem", opacity: 0.6 }}>{n.timestamp}</small>
                </li>
              ))}
            </ul>
          </article>
        )}

        <section className="workspace">
          <article className="glass-panel ticket-history-panel premium">
            <div className="ticket-history-header">
              <div>
                <p className="panel-kicker">Tracking Requests</p>
                <h2>Recent Activity</h2>
              </div>
              <div className="status-legend-modern">
                <span className="status-dot open">Open</span>
                <span className="status-dot progress">In Progress</span>
                <span className="status-dot resolved">Resolved</span>
                <span className="status-dot closed">Closed</span>
              </div>
            </div>

            {myTicketHistory.length === 0 ? (
              <div className="ticket-history-empty-modern">
                <div className="empty-icon">📂</div>
                <p className="empty-title">No history found</p>
                <p className="empty-desc">
                  You haven't submitted any support requests yet. When you do, they will appear here with real-time status updates from our maintenance team.
                </p>
                <button 
                   className="primary-btn compact-btn"
                   onClick={() => setCurrentDashboard("ticket")}
                >
                  Create Your First Ticket
                </button>
              </div>
            ) : (
              <div className="ticket-grid-modern">
                {myTicketHistory.map((ticket) => (
                  <article key={`history-${ticket.id}`} className={`ticket-card-modern status-${getTicketStatusTone(ticket.status)}`}>
                    <div className="ticket-card-glow" />
                    <div className="ticket-card-content">
                      <div className="ticket-card-header-modern">
                        <span className={`status-badge ${getTicketStatusTone(ticket.status)}`}>
                          {formatLabel(ticket.status)}
                        </span>
                        <div className="ticket-priority-indicator">
                           <span className={`priority-dot ${ticket.priority.toLowerCase()}`} title={`Priority: ${ticket.priority}`} />
                        </div>
                      </div>
                      
                      <h3>{ticket.title}</h3>
                      <p className="ticket-desc-short">{ticket.description}</p>
                      
                      <div className="ticket-info-group">
                        <div className="info-item">
                          <span className="info-label">Category</span>
                          <span className="info-value">{formatLabel(ticket.category)}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Location</span>
                          <span className="info-value">
                            {getTicketBuildingLabel(ticket.resourceId)}, Floor {ticket.userId}
                          </span>
                        </div>
                        <div className="info-item full">
                          <span className="info-label">Room / Lab</span>
                          <span className="info-value">{ticket.assignedTechnicianId || "—"}</span>
                        </div>
                      </div>

                      <div className="ticket-card-footer-modern">
                        <div className="footer-meta">
                           <span className="reported-date">🕒 {ticket.createdDate.replace("T", " ")}</span>
                           <span className="attachment-count">📎 {ticket.imageUrls?.length || 0}</span>
                        </div>
                        <div className="footer-actions">
                          <button
                            type="button"
                            className="action-btn edit"
                            onClick={() => handleStartTicketEdit(ticket)}
                            title="Edit Ticket"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="action-btn delete"
                            onClick={() => handleDeleteTicket(ticket.id)}
                            title="Delete Ticket"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <ATicketComments 
                        ticketId={ticket.id} 
                        authUser={authUser} 
                        ticketCreatorId={ticket.creatorId}
                        ticketTitle={ticket.title}
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>
        </section>
      </div>
      <style>{`
        .v6-nav-actions {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(255, 255, 255, 0.4);
            padding: 8px;
            border-radius: 100px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .v6-action-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 100px;
            border: none;
            background: rgba(255, 255, 255, 0.6);
            color: #475569;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .v6-action-pill:hover {
            background: #ffffff;
            color: #0f172a;
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .v6-action-pill.primary {
            background: #0ea5e9;
            color: #ffffff;
        }

        .v6-action-pill.primary:hover {
            background: #0284c7;
        }

        .v6-action-pill.danger {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }

        .v6-action-pill.danger:hover {
            background: #ef4444;
            color: #ffffff;
        }

        .pill-icon {
            font-size: 14px;
        }
      `}</style>
    </main>
  );
}
