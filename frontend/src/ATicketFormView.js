import React from "react";
import {
  ticketCategories,
  ticketPriorities,
  ticketStatuses,
  ticketBuildingOptions,
} from "./A_constants";
import { formatLabel, formatFileSize } from "./A_helpers";

export default function ATicketFormView({
  editingTicketId,
  ticketForm,
  setTicketForm,
  handleCreateTicket,
  handleCancelTicketEdit,
  ticketLocationSummary,
  selectedTicketBuilding,
  ticketFloorOptions,
  selectedTicketImages,
  selectedTicketImageTotal,
  setCurrentDashboard,
  clearMessages,
  myTicketHistory,
  myTicketStatusCount,
  errorMessage,
  successMessage,
  handleLogout,
}) {
  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap portal-container">
        <div className="portal-top-bar">
          <div className="user-profile-badge">
            <div className="user-avatar">S</div>
            <div className="user-text">
              <span className="user-name">Support User</span>
              <span className="user-role">Campus Member</span>
            </div>
          </div>
          <div className="v6-nav-actions">
              <button
                type="button"
                className="v6-action-pill"
                onClick={() => {
                  clearMessages();
                  setCurrentDashboard("ticket-history");
                }}
              >
                <span className="pill-icon">📋</span>
                <span className="pill-text">My Tickets</span>
              </button>
              <button
                type="button"
                className="v6-action-pill primary"
                onClick={() => {
                  clearMessages();
                  setCurrentDashboard("portal");
                }}
              >
                <span className="pill-icon">🧭</span>
                <span className="pill-text">Portal</span>
              </button>
              <button type="button" className="v6-action-pill danger" onClick={handleLogout}>
                <span className="pill-icon">🚪</span>
                <span className="pill-text">Logout</span>
              </button>
          </div>
        </div>

        <header className="hero-banner admin-hero-v3">
          <div className="hero-content">
            <span className="hero-tag">✦ Smart Campus Support</span>
            <h1>Support Desk</h1>
            <p>
              Report technical or facility issues with ease. Our maintenance team is ready to assist you.
            </p>
          </div>
        </header>

        <section className="stats-v3">
          <article className="stat-card-v3">
            <span>📑 History</span>
            <strong>{myTicketHistory.length} Total</strong>
            <small>Requests submitted</small>
          </article>
          <article className="stat-card-v3">
            <span>⏺ Open</span>
            <strong>{myTicketStatusCount.OPEN || 0} Pending</strong>
            <small>Awaiting review</small>
          </article>
          <article className="stat-card-v3">
            <span>🔄 Active</span>
            <strong>{myTicketStatusCount.IN_PROGRESS || 0} Work</strong>
            <small>Being resolved now</small>
          </article>
          <article className="stat-card-v3">
            <span>✅ Done</span>
            <strong>{(myTicketStatusCount.RESOLVED || 0) + (myTicketStatusCount.CLOSED || 0)}</strong>
            <small>Resolved issues</small>
          </article>
        </section>

        {errorMessage && <p className="message error">{errorMessage}</p>}
        {successMessage && <p className="message success">{successMessage}</p>}

        <section className="workspace">
          <div className="ticket-page-centered-content">
            <form className="glass-panel ticket-form-shell modern-form" onSubmit={handleCreateTicket}>
              <div className="panel-header-actions">
                <div>
                  <p className="panel-kicker">{editingTicketId ? "Update Request" : "New Support Request"}</p>
                  <h2>{editingTicketId ? "✏️ Edit Ticket" : "🎫 Raise a Ticket"}</h2>
                </div>
                <div className="header-status-badge">
                   {editingTicketId ? "Editing Mode" : "New Draft"}
                </div>
              </div>
              
              <p className="summary-note ticket-intro">
                Provide clear details and specify the exact location to help our staff diagnose and fix the issue faster.
              </p>

              <div className="ticket-highlight-strip modern">
                <article className="ticket-highlight-card">
                  <span>Priority Level</span>
                  <strong className={`priority-${ticketForm.priority.toLowerCase()}`}>
                    {formatLabel(ticketForm.priority)}
                  </strong>
                </article>
                <article className="ticket-highlight-card">
                  <span>Issue Type</span>
                  <strong>{formatLabel(ticketForm.category)}</strong>
                </article>
                <article className="ticket-highlight-card wide">
                  <span>Selected Location</span>
                  <strong>{ticketLocationSummary || "Location not set"}</strong>
                </article>
              </div>

              <section className="ticket-form-section modern">
                <div className="ticket-section-head">
                  <div className="section-step-badge">1</div>
                  <div>
                    <h3>Problem Description</h3>
                    <p>What's happening? Be as specific as possible.</p>
                  </div>
                </div>
                <div className="ticket-field-grid">
                  <label className="field-card modern full-width">
                    <span className="field-label">Short Summary</span>
                    <input
                      required
                      value={ticketForm.title}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      placeholder="e.g., Projector not turning on in LH-101"
                    />
                  </label>
                  <label className="field-card modern">
                    <span className="field-label">Category</span>
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
                  <label className="field-card modern">
                    <span className="field-label">Priority Level</span>
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
                  <label className="field-card modern">
                    <span className="field-label">Current Status</span>
                    <select
                      value={ticketForm.status}
                      disabled={!editingTicketId}
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
                    <small className="field-hint">
                      {editingTicketId
                        ? "Update the resolution status as work progresses."
                        : "New tickets start as 'Open' automatically."}
                    </small>
                  </label>
                  <label className="description-field field-card modern full-width">
                    <span className="field-label">Detailed Explanation</span>
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
                      placeholder="Describe the issue, when it was noticed, and any steps already taken."
                    />
                  </label>
                </div>
              </section>

              <section className="ticket-form-section modern">
                <div className="ticket-section-head">
                  <div className="section-step-badge">2</div>
                  <div>
                    <h3>Exact Location</h3>
                    <p>Help us find the issue without extra phone calls.</p>
                  </div>
                </div>
                <div className="ticket-field-grid">
                  <label className="field-card modern">
                    <span className="field-label">Campus Building</span>
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
                      <option value="">— Select Building —</option>
                      {ticketBuildingOptions.map((building) => (
                        <option key={building.value} value={building.value}>
                          {building.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-card modern">
                    <span className="field-label">Floor Number</span>
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
                        {selectedTicketBuilding ? "— Select Floor —" : "Select Building First"}
                      </option>
                      {ticketFloorOptions.map((floorNumber) => (
                        <option key={floorNumber} value={floorNumber}>
                          Floor {floorNumber}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-card modern">
                    <span className="field-label">Room / Lab / Hall Name</span>
                    <input
                      type="text"
                      value={ticketForm.assignedTechnicianId}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          assignedTechnicianId: event.target.value,
                        }))
                      }
                      placeholder="e.g., Computer Lab 2, Hall A"
                    />
                  </label>
                  <label className="field-card modern">
                    <span className="field-label">Incident Time</span>
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
                </div>
              </section>

              <section className="ticket-form-section modern">
                <div className="ticket-section-head">
                  <div className="section-step-badge">3</div>
                  <div>
                    <h3>Attachments (Optional)</h3>
                    <p>Photos help us understand physical hardware damage.</p>
                  </div>
                </div>
                <label className="description-field upload-field modern">
                  <div className="upload-zone">
                    <div className="upload-icon">📸</div>
                    <span className="upload-label-row">
                      <span>
                        Upload Photo Evidence
                        <small className="field-hint">Max size: 25MB per file</small>
                      </span>
                      <span className="upload-badge premium">
                        {selectedTicketImages.length} {selectedTicketImages.length === 1 ? "file" : "files"}
                      </span>
                    </span>
                    <input
                      className="file-input-hidden"
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
                    <div className="upload-button-fake">Choose Images</div>
                  </div>
                  
                  {selectedTicketImages.length > 0 && (
                    <div className="upload-file-list-modern">
                      {selectedTicketImages.map((file) => (
                        <div key={`${file.name}-${file.size}`} className="upload-file-item-modern">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="upload-meta-row">
                    <span>Total size: {formatFileSize(selectedTicketImageTotal)}</span>
                    <span>System limit: 50MB</span>
                  </div>
                </label>
              </section>

              <div className="ticket-form-actions-modern">
                <button type="submit" className="primary-btn pulse">
                  {editingTicketId ? "✓ Update Ticket" : "🚀 Submit Support Request"}
                </button>
                {editingTicketId && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleCancelTicketEdit}
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </form>
          </div>
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
