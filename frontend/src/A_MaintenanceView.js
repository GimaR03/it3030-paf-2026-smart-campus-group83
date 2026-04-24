import React, { useState, useEffect } from "react";
import ATicketComments from "./ATicketComments";
import {
  getTicketNotifications,
  markTicketNotificationsRead,
  clearTicketNotifications,
} from "./ticketNotifications";

export default function AMaintenanceView({
  clearMessages,
  setCurrentDashboard,
  handleLogout,
  authUser,
  tickets,
  loadTickets,
  formatLabel,
  getTicketBuildingLabel,
  handleMaintenanceTicketAction,
}) {
  const [selectedActionTicket, setSelectedActionTicket] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingTicket, setPendingTicket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (authUser?.userId) {
      const notifs = getTicketNotifications(authUser.userId);
      setNotifications(notifs.filter((n) => !n.read));
      markTicketNotificationsRead(authUser.userId);
    }
  }, [authUser]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const openTickets = tickets.filter((ticket) => ticket.status === "OPEN");
  const inProgressTickets = tickets.filter((ticket) => ticket.status === "IN_PROGRESS");
  const resolvedTickets = tickets.filter((ticket) => ticket.status === "RESOLVED");
  const closedTickets = tickets.filter((ticket) => ticket.status === "CLOSED");

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "URGENT":
        return "priority-urgent";
      case "HIGH":
        return "priority-high";
      case "MEDIUM":
        return "priority-medium";
      default:
        return "priority-low";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "OPEN":
        return "status-open";
      case "IN_PROGRESS":
        return "status-progress";
      case "RESOLVED":
        return "status-resolved";
      default:
        return "status-closed";
    }
  };

  const handleActionClick = (ticket, action) => {
    setPendingTicket(ticket);
    setPendingAction(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (pendingTicket && pendingAction) {
      handleMaintenanceTicketAction(pendingTicket, pendingAction);
      setShowConfirmDialog(false);
      setPendingTicket(null);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirmDialog(false);
    setPendingTicket(null);
    setPendingAction(null);
  };

  const getActionButtonText = (action) => {
    switch (action) {
      case "ACCEPT":
        return "✓ Accept";
      case "REJECT":
        return "✗ Reject";
      case "IN_PROGRESS":
        return "🔄 In Process";
      case "RESOLVED":
        return "✅ Resolved";
      case "CANCEL":
        return "❌ Cancel";
      default:
        return action;
    }
  };

  const getActionConfirmMessage = (action, ticket) => {
    const building = getTicketBuildingLabel(ticket.resourceId);
    const floor = ticket.userId;
    const hallLab = ticket.assignedTechnicianId || "Not specified";
    
    switch (action) {
      case "ACCEPT":
        return `Are you sure you want to ACCEPT this ticket?\n\nBuilding: ${building}\nFloor: ${floor}\nHall/Lab: ${hallLab}\n\nThis will send a notification to the user.`;
      case "REJECT":
        return `Are you sure you want to REJECT this ticket?\n\nBuilding: ${building}\nFloor: ${floor}\nHall/Lab: ${hallLab}\n\nThis will send a notification to the user.`;
      case "IN_PROGRESS":
        return `Are you sure you want to mark this ticket as IN PROGRESS?\n\nBuilding: ${building}\nFloor: ${floor}\nHall/Lab: ${hallLab}\n\nThis will send a notification to the user.`;
      case "RESOLVED":
        return `Are you sure you want to mark this ticket as RESOLVED?\n\nBuilding: ${building}\nFloor: ${floor}\nHall/Lab: ${hallLab}\n\nThis will send a notification to the user.`;
      case "CANCEL":
        return `Are you sure you want to CANCEL this ticket?\n\nBuilding: ${building}\nFloor: ${floor}\nHall/Lab: ${hallLab}\n\nThis will send a notification to the user.`;
      default:
        return "Are you sure?";
    }
  };

  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap">
        <header className="hero-banner portal-hero">
          <div className="hero-head-row">
            <span className="hero-tag">🔧 Smart Campus Maintenance Center</span>
            <div className="table-actions">
              <button
                type="button"
                className="tiny-btn"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh assigned tickets"
              >
                {refreshing ? "⏳ Refreshing..." : "🔄 Refresh Tickets"}
              </button>
              <button
                type="button"
                className="tiny-btn hero-back"
                onClick={() => {
                  clearMessages();
                  setCurrentDashboard("portal");
                }}
              >
                ← Back To Portal
              </button>
              <button type="button" className="tiny-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
          <h1>Maintenance Dashboard</h1>
          <p>
            Welcome <strong>{authUser?.fullName || "Maintenance Staff"}</strong>! 
            Manage and update maintenance tickets. Your actions will send real-time 
            notifications to users.
          </p>
        </header>

        {/* Statistics Cards */}
        <section className="stats-v3">
          <article className="stat-card-v3">
            <span>📋 Open Tickets</span>
            <strong>{openTickets.length}</strong>
            <small>Awaiting response</small>
          </article>
          <article className="stat-card-v3">
            <span>🔄 In Progress</span>
            <strong>{inProgressTickets.length}</strong>
            <small>Active maintenance</small>
          </article>
          <article className="stat-card-v3">
            <span>✅ Resolved</span>
            <strong>{resolvedTickets.length}</strong>
            <small>Completed tasks</small>
          </article>
          <article className="stat-card-v3">
            <span>🚫 Closed</span>
            <strong>{closedTickets.length}</strong>
            <small>Archived records</small>
          </article>
        </section>

        {/* Notifications Banner */}
        {notifications.length > 0 && (
          <article className="glass-panel" style={{ marginBottom: "1rem", border: "1px solid rgba(74,222,128,0.4)", background: "rgba(74,222,128,0.08)" }}>
            <div className="panel-header-actions">
              <h3 style={{ margin: 0, fontSize: "1rem" }}>🔔 New Tickets Assigned To You</h3>
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
                  <span style={{ marginRight: "0.5rem" }}>🎫</span>
                  {n.message}
                  <small style={{ marginLeft: "0.75rem", opacity: 0.6 }}>{n.timestamp}</small>
                </li>
              ))}
            </ul>
          </article>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && pendingTicket && (
          <div className="modal-overlay" onClick={cancelAction}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Action</h3>
              <div className="modal-body">
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>
                  {getActionConfirmMessage(pendingAction, pendingTicket)}
                </pre>
              </div>
              <div className="modal-actions">
                <button className="tiny-btn" onClick={confirmAction}>
                  Confirm
                </button>
                <button className="tiny-btn danger" onClick={cancelAction}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="workspace">
          <article className="glass-panel auth-panel">
            <h2>📊 Ticket Management</h2>
            <p className="summary-note">
              Click on any action button to update ticket status. Notifications will be 
              automatically sent to the user who created the ticket with building, floor, 
              and hall/lab details.
            </p>

            {tickets.length === 0 ? (
              <p className="empty">📭 No tickets assigned to you yet.</p>
            ) : (
              <div className="ticket-grid-modern">
                {tickets.map((ticket) => (
                  <article key={ticket.id} className={`ticket-card-modern status-${getStatusClass(ticket.status)}`}>
                    <div className="ticket-card-glow" />
                    <div className="ticket-card-content">
                      <div className="ticket-card-header-modern">
                        <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                          {formatLabel(ticket.status)}
                        </span>
                        <div className="ticket-priority-indicator">
                           <span className={`priority-dot ${getPriorityClass(ticket.priority)}`} title={`Priority: ${ticket.priority}`} />
                        </div>
                      </div>
                      
                      <h3>{ticket.title}</h3>
                      <p className="ticket-desc-short">{ticket.description}</p>
                      
                      <div className="ticket-info-group">
                        <div className="info-item">
                          <span className="info-label">Sender</span>
                          <span className="info-value">{ticket.creatorName || "Unknown"}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Category</span>
                          <span className="info-value">{formatLabel(ticket.category)}</span>
                        </div>
                        <div className="info-item full">
                          <span className="info-label">Location</span>
                          <span className="info-value">
                            🏢 {getTicketBuildingLabel(ticket.resourceId)}, Floor {ticket.userId}
                            {ticket.assignedTechnicianId && ` · Lab: ${ticket.assignedTechnicianId}`}
                          </span>
                        </div>
                      </div>

                      <div className="maintenance-actions-row" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {ticket.status === "OPEN" && (
                          <>
                            <button
                              type="button"
                              className="tiny-btn"
                              onClick={() => handleActionClick(ticket, "ACCEPT")}
                            >
                              ✓ Accept
                            </button>
                            <button
                              type="button"
                              className="tiny-btn"
                              onClick={() => handleActionClick(ticket, "IN_PROGRESS")}
                            >
                              🔄 Start Work
                            </button>
                            <button
                              type="button"
                              className="tiny-btn danger"
                              onClick={() => handleActionClick(ticket, "REJECT")}
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}

                        {ticket.status === "IN_PROGRESS" && (
                          <>
                            <button
                              type="button"
                              className="tiny-btn"
                              onClick={() => handleActionClick(ticket, "RESOLVED")}
                            >
                              ✅ Mark Resolved
                            </button>
                            <button
                              type="button"
                              className="tiny-btn danger"
                              onClick={() => handleActionClick(ticket, "CANCEL")}
                            >
                              ❌ Cancel
                            </button>
                          </>
                        )}
                      </div>

                      <div className="ticket-card-footer-modern" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.8rem' }}>
                         <span className="reported-date">🕒 {ticket.createdDate?.replace("T", " ")}</span>
                         <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '0.5rem' }}>
                           <ATicketComments ticketId={ticket.id} authUser={authUser} />
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
      <style>{`
        .priority-badge, .status-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .resolved-label, .closed-label {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          background: #1e293b;
          color: #94a3b8;
        }
        
        .resolved-label {
          color: #10b981;
        }
        
        .closed-label {
          color: #ef4444;
        }
        
        table td small {
          font-size: 0.7rem;
          color: #94a3b8;
        }
        
        .metric-card {
          cursor: default;
        }
        
        .metric-card strong {
          font-size: 1.8rem;
        }
      `}</style>
    </main>
  );
}