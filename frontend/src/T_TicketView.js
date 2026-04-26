import { formatLabel } from "./A_helpers";

const ticketCategories = [
  "EQUIPMENT",
  "NETWORK",
  "ELECTRICAL",
  "PLUMBING",
  "CLEANING",
  "SECURITY",
  "OTHER",
];

const ticketPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const ticketStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const ticketBuildingOptions = [
  { value: "1", label: "Main Building", floorCount: 9 },
  { value: "2", label: "New Building", floorCount: 14 },
];

export default function T_TicketView({
  currentDashboard,
  clearMessages,
  setCurrentDashboard,
  myTicketHistory,
  myTicketStatusCount,
  errorMessage,
  successMessage,
  handleStartTicketEdit,
  handleDeleteTicket,
  getTicketStatusTone,
  getTicketBuildingLabel,
  selectedTicketBuilding,
  ticketFloorOptions,
  ticketForm,
  setTicketForm,
  editingTicketId,
  latestSubmittedTicket,
  handleCreateTicket,
  handleCancelTicketEdit,
  handleDownloadTicketPdf,
}) {
  const isHistoryPage = currentDashboard === "ticket-history";

  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap">
        <header className="hero-banner portal-hero">
          <div className="hero-head-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
            <span className="hero-tag">Smart Campus Access</span>
            <div className="v6-nav-actions" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '6px', backdropFilter: 'none' }}>
              <button
                type="button"
                className="v6-action-pill primary"
                onClick={() => {
                  clearMessages();
                  setCurrentDashboard(isHistoryPage ? "ticket" : "portal");
                }}
              >
                <span className="pill-icon">{isHistoryPage ? "🎫" : "🧭"}</span>
                <span className="pill-text">{isHistoryPage ? "Back To Tickets" : "Back To Portal"}</span>
              </button>
            </div>
          </div>
          <h1>{isHistoryPage ? "My Ticket History" : "Ticket Page"}</h1>
          <p>
            {isHistoryPage
              ? "View, update, or delete your ticket history from this page."
              : "Submit a campus support ticket with issue details, priority, related resource, technician assignment, and image references."}
          </p>
        </header>

        <section className="metrics-row">
          <article className="metric-card">
            <span>My Tickets</span>
            <strong>{myTicketHistory.length}</strong>
          </article>
          <article className="metric-card">
            <span>Open</span>
            <strong>{myTicketStatusCount.OPEN || 0}</strong>
          </article>
          <article className="metric-card">
            <span>In Progress</span>
            <strong>{myTicketStatusCount.IN_PROGRESS || 0}</strong>
          </article>
        </section>

        {errorMessage && <p className="message error">{errorMessage}</p>}
        {successMessage && <p className="message success">{successMessage}</p>}

        <section className="workspace">
          {isHistoryPage ? (
            <article className="glass-panel ticket-history-panel">
              <div className="panel-header-actions">
                <h2>My Ticket History</h2>
                <small className="field-hint">
                  Tickets created from this browser can be updated or deleted here.
                </small>
              </div>

              {myTicketHistory.length === 0 ? (
                <p className="empty">No personal ticket history found yet.</p>
              ) : (
                <div className="ticket-list">
                  {myTicketHistory.map((ticket) => (
                    <article key={`history-${ticket.id}`} className="ticket-card">
                      <div className="ticket-card-head">
                        <h3>{ticket.title}</h3>
                        <span className={`ticket-pill ${getTicketStatusTone(ticket.status)}`}>
                          {formatLabel(ticket.status)}
                        </span>
                      </div>
                      <p>{ticket.description}</p>
                      <div className="ticket-meta">
                        <span>{formatLabel(ticket.category)}</span>
                        <span>{formatLabel(ticket.priority)} Priority</span>
                        <span>{getTicketBuildingLabel(ticket.resourceId)}</span>
                        <span>Floor {ticket.userId}</span>
                        <span>
                          Hall/Lab {" "}
                          {ticket.assignedTechnicianId ? ticket.assignedTechnicianId : "Not Provided"}
                        </span>
                        <span>{ticket.createdDate.replace("T", " ")}</span>
                      </div>
                      <div className="ticket-card-actions" style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                        <button
                          type="button"
                          className="v6-action-pill"
                          onClick={() => handleStartTicketEdit(ticket)}
                        >
                          <span className="pill-icon">✏️</span>
                          <span className="pill-text">Edit</span>
                        </button>
                        <button
                          type="button"
                          className="v6-action-pill danger"
                          onClick={() => handleDeleteTicket(ticket.id)}
                        >
                          <span className="pill-icon">🗑️</span>
                          <span className="pill-text">Delete</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>
          ) : (
            <div className="workspace-grid two-up">
              <form className="glass-panel" onSubmit={handleCreateTicket}>
                <div className="panel-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>{editingTicketId ? "Update Ticket" : "Create Ticket"}</h2>
                  <button
                    type="button"
                    className="v6-action-pill"
                    onClick={() => {
                      clearMessages();
                      setCurrentDashboard("ticket-history");
                    }}
                  >
                    <span className="pill-icon">📋</span>
                    <span className="pill-text">My Ticket History</span>
                  </button>
                </div>
                <div className="ticket-field-grid">
                  <label>
                    Title
                    <input
                      required
                      value={ticketForm.title}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      placeholder="Projector not working"
                    />
                  </label>
                  <label>
                    Category
                    <select
                      value={ticketForm.category}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                    >
                      {ticketCategories.map((category) => (
                        <option key={category} value={category}>
                          {formatLabel(category)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Priority
                    <select
                      value={ticketForm.priority}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          priority: event.target.value,
                        }))
                      }
                    >
                      {ticketPriorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {formatLabel(priority)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Status
                    <select
                      value={ticketForm.status}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                    >
                      {ticketStatuses.map((status) => (
                        <option key={status} value={status}>
                          {formatLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Building
                    <select
                      required
                      value={ticketForm.resourceId}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          resourceId: event.target.value,
                          userId: "",
                        }))
                      }
                    >
                      <option value="">Select Building</option>
                      {ticketBuildingOptions.map((building) => (
                        <option key={building.value} value={building.value}>
                          {building.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Floor Number
                    <select
                      required
                      disabled={!selectedTicketBuilding}
                      value={ticketForm.userId}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          userId: event.target.value,
                        }))
                      }
                    >
                      <option value="">
                        {selectedTicketBuilding ? "Select Floor" : "Select Building First"}
                      </option>
                      {ticketFloorOptions.map((floorNumber) => (
                        <option key={floorNumber} value={floorNumber}>
                          Floor {floorNumber}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Lecturer Hall or Lab Number
                    <input
                      type="text"
                      value={ticketForm.assignedTechnicianId}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          assignedTechnicianId: event.target.value,
                        }))
                      }
                      placeholder="LH-101 or Lab 2"
                    />
                    <small className="field-hint">Enter the hall or lab number manually.</small>
                  </label>
                  <label>
                    Created Date
                    <input
                      required
                      type="datetime-local"
                      value={ticketForm.createdDate}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          createdDate: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="description-field">
                    Description
                    <textarea
                      required
                      rows="4"
                      value={ticketForm.description}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Explain the issue clearly so support staff can reproduce it."
                    />
                  </label>
                  <label className="description-field">
                    Ticket Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={Boolean(editingTicketId)}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          images: event.target.files || [],
                        }))
                      }
                    />
                    <small className="field-hint">
                      {editingTicketId
                        ? "Existing images stay attached while editing. Add new images by creating a new ticket."
                        : "Upload one or more image files directly from your device. Limit: 25MB per file, 50MB total."}
                    </small>
                  </label>
                </div>
                <div className="ticket-form-actions" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="v6-action-pill primary" style={{ fontSize: '15px', padding: '10px 24px' }}>
                     <span className="pill-icon">🚀</span>
                     <span className="pill-text">{editingTicketId ? "Update Ticket" : "Submit Ticket"}</span>
                  </button>
                  {editingTicketId && (
                    <button
                      type="button"
                      className="v6-action-pill danger"
                      style={{ fontSize: '15px', padding: '10px 24px' }}
                      onClick={handleCancelTicketEdit}
                    >
                      <span className="pill-icon">✖️</span>
                      <span className="pill-text">Cancel Edit</span>
                    </button>
                  )}
                </div>
              </form>

              {latestSubmittedTicket && !editingTicketId && (
                <article className="glass-panel">
                  <div className="panel-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2>Submitted Ticket Details</h2>
                    <button
                      type="button"
                      className="v6-action-pill"
                      onClick={() => handleDownloadTicketPdf(latestSubmittedTicket)}
                    >
                      <span className="pill-icon">📄</span>
                      <span className="pill-text">Download PDF</span>
                    </button>
                  </div>
                  <div className="ticket-meta" style={{ display: "grid", gap: "0.45rem" }}>
                    <span><strong>ID:</strong> {latestSubmittedTicket.id}</span>
                    <span><strong>Title:</strong> {latestSubmittedTicket.title}</span>
                    <span><strong>Description:</strong> {latestSubmittedTicket.description}</span>
                    <span><strong>Category:</strong> {formatLabel(latestSubmittedTicket.category)}</span>
                    <span><strong>Priority:</strong> {formatLabel(latestSubmittedTicket.priority)}</span>
                    <span><strong>Status:</strong> {formatLabel(latestSubmittedTicket.status)}</span>
                    <span><strong>Building:</strong> {getTicketBuildingLabel(latestSubmittedTicket.resourceId)}</span>
                    <span><strong>Floor Number:</strong> {latestSubmittedTicket.userId}</span>
                    <span>
                      <strong>Hall/Lab Number:</strong>{" "}
                      {latestSubmittedTicket.assignedTechnicianId || "Not Provided"}
                    </span>
                    <span>
                      <strong>Created Date:</strong>{" "}
                      {String(latestSubmittedTicket.createdDate).replace("T", " ")}
                    </span>
                  </div>
                </article>
              )}
            </div>
          )}
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