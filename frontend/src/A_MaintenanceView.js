import { useState } from "react";

export default function AMaintenanceView({
  clearMessages,
  setCurrentDashboard,
  handleLogout,
  authUser,
  tickets,
  formatLabel,
  getTicketBuildingLabel,
  handleMaintenanceTicketAction,
}) {
  const [selectedActionTicket, setSelectedActionTicket] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingTicket, setPendingTicket] = useState(null);

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
        <section className="metrics-row">
          <article className="metric-card">
            <span>📋 Open Tickets</span>
            <strong>{openTickets.length}</strong>
          </article>
          <article className="metric-card">
            <span>🔄 In Progress</span>
            <strong>{inProgressTickets.length}</strong>
          </article>
          <article className="metric-card">
            <span>✅ Resolved</span>
            <strong>{resolvedTickets.length}</strong>
          </article>
          <article className="metric-card">
            <span>🚫 Closed</span>
            <strong>{closedTickets.length}</strong>
          </article>
        </section>

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
              <p className="empty">📭 No tickets submitted yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Building</th>
                      <th>Floor</th>
                      <th>Hall/Lab No</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>#{ticket.id}</td>
                        <td>
                          <strong>{ticket.title}</strong>
                          <br />
                          <small>{ticket.description?.substring(0, 50)}...</small>
                        </td>
                        <td>
                          <span className="category-badge">
                            {formatLabel(ticket.category)}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                            {formatLabel(ticket.priority)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                            {formatLabel(ticket.status)}
                          </span>
                        </td>
                        <td>🏢 {getTicketBuildingLabel(ticket.resourceId)}</td>
                        <td>📍 Floor {ticket.userId}</td>
                        <td>🏠 {ticket.assignedTechnicianId || "Not specified"}</td>
                        <td>
                          <small>{ticket.createdDate?.replace("T", " ")}</small>
                        </td>
                        <td>
                          <div className="table-actions" style={{ gap: "0.3rem", flexWrap: "wrap" }}>
                            {ticket.status === "OPEN" && (
                              <>
                                <button
                                  type="button"
                                  className="tiny-btn"
                                  onClick={() => handleActionClick(ticket, "ACCEPT")}
                                  title="Accept this ticket"
                                >
                                  ✓ Accept
                                </button>
                                <button
                                  type="button"
                                  className="tiny-btn danger"
                                  onClick={() => handleActionClick(ticket, "REJECT")}
                                  title="Reject this ticket"
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
                                  title="Mark as resolved"
                                >
                                  ✅ Resolved
                                </button>
                                <button
                                  type="button"
                                  className="tiny-btn danger"
                                  onClick={() => handleActionClick(ticket, "CANCEL")}
                                  title="Cancel this ticket"
                                >
                                  ❌ Cancel
                                </button>
                              </>
                            )}
                            
                            {ticket.status === "OPEN" && (
                              <button
                                type="button"
                                className="tiny-btn"
                                onClick={() => handleActionClick(ticket, "IN_PROGRESS")}
                                title="Start working on this ticket"
                              >
                                🔄 In Process
                              </button>
                            )}

                            {ticket.status === "RESOLVED" && (
                              <span className="resolved-label">✓ Completed</span>
                            )}
                            
                            {ticket.status === "CLOSED" && (
                              <span className="closed-label">✗ Closed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </section>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 500px;
          width: 90%;
          border: 1px solid #334155;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .modal-content h3 {
          margin: 0 0 1rem 0;
          color: #f1f5f9;
        }
        
        .modal-body {
          margin: 1rem 0;
          color: #cbd5e1;
          line-height: 1.6;
        }
        
        .modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
        
        .priority-urgent {
          background: #dc2626;
          color: white;
        }
        
        .priority-high {
          background: #f97316;
          color: white;
        }
        
        .priority-medium {
          background: #eab308;
          color: white;
        }
        
        .priority-low {
          background: #22c55e;
          color: white;
        }
        
        .status-open {
          background: #3b82f6;
          color: white;
        }
        
        .status-progress {
          background: #8b5cf6;
          color: white;
        }
        
        .status-resolved {
          background: #10b981;
          color: white;
        }
        
        .status-closed {
          background: #6b7280;
          color: white;
        }
        
        .category-badge {
          background: #334155;
          color: #cbd5e1;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        
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