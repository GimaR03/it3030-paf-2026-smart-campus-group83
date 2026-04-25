import React, { useState } from "react";
import { formatLabel } from "./A_helpers";
import ATicketComments from "./ATicketComments";
import NotificationPanel from "./NotificationPanel";

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
  notifications,
  unreadNotificationsCount,
  markNotificationsRead,
  clearNotifications,
  addSystemNotification,
}) {
  const [showNotifications, setShowNotifications] = useState(false);

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
          <div className="hero-actions">
            <button
              type="button"
              className="tiny-btn"
              onClick={() => {
                clearMessages();
                setCurrentDashboard("ticket");
              }}
            >
              Back to Request Form
            </button>
            <button
              type="button"
              className="tiny-btn"
              onClick={() => setShowNotifications((current) => !current)}
            >
              Notifications ({unreadNotificationsCount})
            </button>
            <button type="button" className="tiny-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <header className="hero-banner admin-hero-v3">
          <div className="hero-content">
            <span className="hero-tag">Smart Campus Tracking</span>
            <h1>Ticket History</h1>
            <p>
              Review and manage your maintenance requests. Stay updated with
              status changes, comments, and support progress from the same
              workspace.
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

        {showNotifications && (
          <NotificationPanel
            title="Ticket Notifications"
            kicker="Support Updates"
            notifications={notifications}
            emptyText="No ticket updates yet."
            onMarkAllRead={markNotificationsRead}
            onClearAll={clearNotifications}
          />
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
                  You have not submitted any support requests yet. When you do,
                  they will appear here with status changes and comment updates.
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
                  <article
                    key={`history-${ticket.id}`}
                    className={`ticket-card-modern status-${getTicketStatusTone(
                      ticket.status
                    )}`}
                  >
                    <div className="ticket-card-glow" />
                    <div className="ticket-card-content">
                      <div className="ticket-card-header-modern">
                        <span className={`status-badge ${getTicketStatusTone(ticket.status)}`}>
                          {formatLabel(ticket.status)}
                        </span>
                        <div className="ticket-priority-indicator">
                          <span
                            className={`priority-dot ${ticket.priority.toLowerCase()}`}
                            title={`Priority: ${ticket.priority}`}
                          />
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
                            {getTicketBuildingLabel(ticket.resourceId)}, Floor{" "}
                            {ticket.userId}
                          </span>
                        </div>
                        <div className="info-item full">
                          <span className="info-label">Room / Lab</span>
                          <span className="info-value">
                            {ticket.assignedTechnicianId || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="ticket-card-footer-modern">
                        <div className="footer-meta">
                          <span className="reported-date">
                            {ticket.createdDate.replace("T", " ")}
                          </span>
                          <span className="attachment-count">
                            Attachments {ticket.imageUrls?.length || 0}
                          </span>
                        </div>
                        <div className="footer-actions">
                          <button
                            type="button"
                            className="action-btn edit"
                            onClick={() => handleStartTicketEdit(ticket)}
                            title="Edit Ticket"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="action-btn delete"
                            onClick={() => handleDeleteTicket(ticket.id)}
                            title="Delete Ticket"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
<<<<<<< HEAD
                      <ATicketComments
                        ticketId={ticket.id}
                        authUser={authUser}
                        ticketTitle={ticket.title}
                        ticketCreatorId={ticket.creatorId}
                        addSystemNotification={addSystemNotification}
=======
                      <ATicketComments 
                        ticketId={ticket.id} 
                        authUser={authUser} 
                        ticketCreatorId={ticket.creatorId}
                        ticketTitle={ticket.title}
>>>>>>> 7739b8ef9e5669723df5b8f97710a05470f4cde0
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
