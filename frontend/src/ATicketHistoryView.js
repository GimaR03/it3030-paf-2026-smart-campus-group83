import React from "react";
import { formatLabel } from "./A_helpers";

export default function ATicketHistoryView({
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
}) {
  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap">
        <header className="hero-banner portal-hero ticket-hero">
          <div className="hero-head-row">
            <span className="hero-tag">✦ Smart Campus History</span>
            <button
              type="button"
              className="secondary-btn compact-btn hero-back"
              onClick={() => {
                clearMessages();
                setCurrentDashboard("ticket");
              }}
            >
              ← Back To Request Form
            </button>
          </div>
          <h1>My Ticket History</h1>
          <p>Track the progress of your submitted issues and manage existing requests.</p>
        </header>

        <section className="metrics-row">
          <article className="metric-card premium history">
            <span>Total Submitted</span>
            <strong>{myTicketHistory.length}</strong>
          </article>
          <article className="metric-card premium history open">
            <span>Open</span>
            <strong>{myTicketStatusCount.OPEN || 0}</strong>
          </article>
          <article className="metric-card premium history progress">
            <span>In Progress</span>
            <strong>{myTicketStatusCount.IN_PROGRESS || 0}</strong>
          </article>
          <article className="metric-card premium history resolved">
            <span>Resolved</span>
            <strong>{myTicketStatusCount.RESOLVED || 0}</strong>
          </article>
        </section>

        {errorMessage && <p className="message error">{errorMessage}</p>}
        {successMessage && <p className="message success">{successMessage}</p>}

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
