import React, { useState } from "react";
import ATicketComments from "./ATicketComments";
import NotificationPanel from "./NotificationPanel";

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
  notifications,
  unreadNotificationsCount,
  markNotificationsRead,
  clearNotifications,
  addSystemNotification,
}) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingTicket, setPendingTicket] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const getActionConfirmMessage = (action, ticket) => {
    const building = getTicketBuildingLabel(ticket.resourceId);
    const floor = ticket.userId;
    const hallLab = ticket.assignedTechnicianId || "Not specified";

    switch (action) {
      case "ACCEPT":
        return `Accept this ticket?\n\nBuilding: ${building}\nFloor: ${floor}\nHall/Lab: ${hallLab}\n\nThe ticket owner will receive a notification.`;
      case "REJECT":
        return `Reject this ticket?\n\nBuilding: ${building}\nFloor: ${floor}\nHall/Lab: ${hallLab}\n\nThe ticket owner will receive a notification.`;
      case "IN_PROGRESS":
        return `Mark this ticket as in progress?\n\nBuilding: ${building}\nFloor: ${floor}\nHall/Lab: ${hallLab}\n\nThe ticket owner will receive a notification.`;
      case "RESOLVED":
        return `Mark this ticket as resolved?\n\nBuilding: ${building}\nFloor: ${floor}\nHall/Lab: ${hallLab}\n\nThe ticket owner will receive a notification.`;
      case "CANCEL":
        return `Cancel this ticket?\n\nBuilding: ${building}\nFloor: ${floor}\nHall/Lab: ${hallLab}\n\nThe ticket owner will receive a notification.`;
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
            <span className="hero-tag">Smart Campus Maintenance Center</span>
            <div className="table-actions">
              <button
                type="button"
                className="tiny-btn"
                onClick={() => setShowNotifications((current) => !current)}
              >
                Notifications ({unreadNotificationsCount})
              </button>
              <button
                type="button"
                className="tiny-btn"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh assigned tickets"
              >
                {refreshing ? "Refreshing..." : "Refresh Tickets"}
              </button>
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
              <button type="button" className="tiny-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
          <h1>Maintenance Dashboard</h1>
          <p>
            Welcome <strong>{authUser?.fullName || "Maintenance Staff"}</strong>.
            Manage assigned tickets and use the notification panel to keep track
            of new assignments.
          </p>
        </header>

        <section className="stats-v3">
          <article className="stat-card-v3">
            <span>Open Tickets</span>
            <strong>{openTickets.length}</strong>
            <small>Awaiting response</small>
          </article>
          <article className="stat-card-v3">
            <span>In Progress</span>
            <strong>{inProgressTickets.length}</strong>
            <small>Active maintenance</small>
          </article>
          <article className="stat-card-v3">
            <span>Resolved</span>
            <strong>{resolvedTickets.length}</strong>
            <small>Completed tasks</small>
          </article>
          <article className="stat-card-v3">
            <span>Closed</span>
            <strong>{closedTickets.length}</strong>
            <small>Archived records</small>
          </article>
        </section>

        {showNotifications && (
          <NotificationPanel
            title="Assignment Notifications"
            kicker="Maintenance Updates"
            notifications={notifications}
            emptyText="No assignment notifications yet."
            onMarkAllRead={markNotificationsRead}
            onClearAll={clearNotifications}
          />
        )}

        {showConfirmDialog && pendingTicket && (
          <div className="modal-overlay" onClick={cancelAction}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
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
            <h2>Ticket Management</h2>
            <p className="summary-note">
              Update ticket statuses and add comments. Ticket owners receive
              notifications when statuses change or new comments are added.
            </p>

            {tickets.length === 0 ? (
              <p className="empty">No tickets assigned to you yet.</p>
            ) : (
              <div className="ticket-grid-modern">
                {tickets.map((ticket) => (
                  <article
                    key={ticket.id}
                    className={`ticket-card-modern status-${getStatusClass(ticket.status)}`}
                  >
                    <div className="ticket-card-glow" />
                    <div className="ticket-card-content">
                      <div className="ticket-card-header-modern">
                        <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                          {formatLabel(ticket.status)}
                        </span>
                        <div className="ticket-priority-indicator">
                          <span
                            className={`priority-dot ${getPriorityClass(ticket.priority)}`}
                            title={`Priority: ${ticket.priority}`}
                          />
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
                            {getTicketBuildingLabel(ticket.resourceId)}, Floor{" "}
                            {ticket.userId}
                            {ticket.assignedTechnicianId
                              ? ` · Lab: ${ticket.assignedTechnicianId}`
                              : ""}
                          </span>
                        </div>
                      </div>

                      <div
                        className="maintenance-actions-row"
                        style={{
                          marginTop: "1rem",
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {ticket.status === "OPEN" && (
                          <>
                            <button
                              type="button"
                              className="tiny-btn"
                              onClick={() => handleActionClick(ticket, "ACCEPT")}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              className="tiny-btn"
                              onClick={() => handleActionClick(ticket, "IN_PROGRESS")}
                            >
                              Start Work
                            </button>
                            <button
                              type="button"
                              className="tiny-btn danger"
                              onClick={() => handleActionClick(ticket, "REJECT")}
                            >
                              Reject
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
                              Mark Resolved
                            </button>
                            <button
                              type="button"
                              className="tiny-btn danger"
                              onClick={() => handleActionClick(ticket, "CANCEL")}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>

<<<<<<< HEAD
                      <div
                        className="ticket-card-footer-modern"
                        style={{
                          marginTop: "1rem",
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                          paddingTop: "0.8rem",
                        }}
                      >
                        <span className="reported-date">
                          {ticket.createdDate?.replace("T", " ")}
                        </span>
                        <div
                          style={{
                            marginTop: "0.75rem",
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: "12px",
                            padding: "0.5rem",
                          }}
                        >
                          <ATicketComments
                            ticketId={ticket.id}
                            authUser={authUser}
                            ticketTitle={ticket.title}
                            ticketCreatorId={ticket.creatorId}
                            addSystemNotification={addSystemNotification}
                          />
                        </div>
=======
                      <div className="ticket-card-footer-modern" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.8rem' }}>
                         <span className="reported-date">🕒 {ticket.createdDate?.replace("T", " ")}</span>
                         <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '0.5rem' }}>
                           <ATicketComments 
                              ticketId={ticket.id} 
                              authUser={authUser} 
                              ticketCreatorId={ticket.creatorId}
                              ticketTitle={ticket.title}
                           />
                         </div>
>>>>>>> 7739b8ef9e5669723df5b8f97710a05470f4cde0
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
