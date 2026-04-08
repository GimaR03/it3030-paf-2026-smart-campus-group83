import { dashboardActions, roomStatuses } from "./A_constants";
import { formatLabel } from "./A_helpers";

export default function A_AdminDashboardView({
  clearMessages,
  setCurrentDashboard,
  adminNotifications,
  showAdminNotifications,
  setShowAdminNotifications,
  clearAdminNotifications,
  buildings,
  totalFloors,
  rooms,
  editingBuildingId,
  editingFloorId,
  editingRoomId,
  activeSection,
  setActiveSection,
  isLoading,
  errorMessage,
  successMessage,
  buildingForm,
  setBuildingForm,
  floorForm,
  setFloorForm,
  handleCreateBuilding,
  handleAddFloor,
  roomForm,
  setRoomForm,
  handleRoomBuildingChange,
  selectedBuildingFloors,
  roomTypes,
  selectedBuildingId,
  setSelectedBuildingId,
  selectedMapBuilding,
  selectedBuildingStats,
  selectedFloorInsights,
  getRoomQuickNote,
  roomStatusCount,
  totalCapacity,
  activeCapacity,
  maintenanceCapacity,
  handleEditBuilding,
  handleDeleteBuilding,
  handleEditFloor,
  handleDeleteFloor,
  handleCreateRoom,
  handleEditRoom,
  handleDeleteRoom,
  handleCancelBuildingEdit,
  handleCancelFloorEdit,
  handleCancelRoomEdit,
  loadAdminBookings,
  adminBookingFilters,
  setAdminBookingFilters,
  adminBookingsLoading,
  adminBookings,
  handleAdminApprove,
  handleAdminReject,
}) {
  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap">
        <header className="hero-banner">
          <div className="hero-head-row">
            <span className="hero-tag">Smart Campus Control Center</span>
            <div className="table-actions">
              <button
                type="button"
                className="tiny-btn"
                onClick={() => setShowAdminNotifications((current) => !current)}
              >
                Notification ({adminNotifications.length})
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
            </div>
          </div>
          <h1>Campus Command Dashboard</h1>
          <p>
            Use action buttons to open Add Building and Add Floor forms, Book Room form,
            Building and Floor Map, and Rooms Status.
          </p>

          {adminNotifications.length > 0 && (
            <article className="glass-panel" style={{ marginTop: "0.8rem" }}>
              <div className="panel-header-actions">
                <h2>Notification Bar</h2>
                <button type="button" className="tiny-btn" onClick={clearAdminNotifications}>
                  Clear
                </button>
              </div>
              <ul className="ticket-images">
                {adminNotifications.slice(0, 5).map((notice) => (
                  <li key={notice.id}>
                    <strong>{notice.message}</strong>
                    <div>
                      {notice.building ? `Building: ${notice.building}` : ""}
                      {notice.floor ? ` | Floor: ${notice.floor}` : ""}
                      {notice.hallLab ? ` | Hall/Lab: ${notice.hallLab}` : ""}
                    </div>
                    {notice.timestamp && <small>{notice.timestamp}</small>}
                  </li>
                ))}
              </ul>
            </article>
          )}

          {showAdminNotifications && (
            <article className="glass-panel" style={{ marginTop: "0.8rem" }}>
              <div className="panel-header-actions">
                <h2>Admin Notifications</h2>
                <button type="button" className="tiny-btn" onClick={clearAdminNotifications}>
                  Clear
                </button>
              </div>
              {adminNotifications.length === 0 ? (
                <p className="empty">No notifications yet.</p>
              ) : (
                <ul className="ticket-images">
                  {adminNotifications.map((notice) => (
                    <li key={notice.id}>
                      <strong>{notice.message}</strong>
                      <div>
                        {notice.building ? `Building: ${notice.building}` : ""}
                        {notice.floor ? ` | Floor: ${notice.floor}` : ""}
                        {notice.hallLab ? ` | Hall/Lab: ${notice.hallLab}` : ""}
                      </div>
                      {notice.timestamp && <small>{notice.timestamp}</small>}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          )}
        </header>

        <section className="metrics-row">
          <article className="metric-card">
            <span>Buildings</span>
            <strong>{buildings.length}</strong>
          </article>
          <article className="metric-card">
            <span>Total Floors</span>
            <strong>{totalFloors}</strong>
          </article>
          <article className="metric-card">
            <span>Rooms</span>
            <strong>{rooms.length}</strong>
          </article>
        </section>

        <section className="action-grid">
          {dashboardActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`action-button ${action.accent} ${activeSection === action.id ? "active" : ""}`}
              onClick={() => setActiveSection(action.id)}
            >
              <span>{action.title}</span>
              <small>{action.subtitle}</small>
            </button>
          ))}
          <button
            type="button"
            className={`action-button sky ${activeSection === "view-book-status" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("view-book-status");
              loadAdminBookings();
            }}
          >
            <span>View Book Status</span>
            <small>Approve or reject booking requests</small>
          </button>
        </section>

        {isLoading && <p className="loading-text">Loading campus data...</p>}
        {errorMessage && <p className="message error">{errorMessage}</p>}
        {successMessage && <p className="message success">{successMessage}</p>}

        {!isLoading && (
          <section className="workspace">
            {activeSection === "manage-buildings" && (
              <div className="workspace-grid two-up">
                <form className="glass-panel" onSubmit={handleCreateBuilding}>
                  <div className="panel-header-actions">
                    <h2>{editingBuildingId ? "Update Building" : "Add Building"}</h2>
                    {editingBuildingId && (
                      <button type="button" className="tiny-btn" onClick={handleCancelBuildingEdit}>
                        Cancel
                      </button>
                    )}
                  </div>
                  <label>
                    Building No
                    <input
                      required
                      value={buildingForm.buildingNo}
                      onChange={(event) =>
                        setBuildingForm((current) => ({
                          ...current,
                          buildingNo: event.target.value,
                        }))
                      }
                      placeholder="3"
                    />
                  </label>
                  <label>
                    Building Name
                    <input
                      required
                      value={buildingForm.name}
                      onChange={(event) =>
                        setBuildingForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Lab Block"
                    />
                  </label>
                  <label>
                    Floor Count
                    <input
                      required
                      min="1"
                      max="150"
                      type="number"
                      value={buildingForm.floorCount}
                      onChange={(event) =>
                        setBuildingForm((current) => ({
                          ...current,
                          floorCount: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <button type="submit">
                    {editingBuildingId ? "Save Changes" : "Create Building"}
                  </button>
                </form>

                <form className="glass-panel" onSubmit={handleAddFloor}>
                  <div className="panel-header-actions">
                    <h2>{editingFloorId ? "Update Floor" : "Add Floor"}</h2>
                    {editingFloorId && (
                      <button type="button" className="tiny-btn" onClick={handleCancelFloorEdit}>
                        Cancel
                      </button>
                    )}
                  </div>
                  <label>
                    Building
                    <select
                      required
                      value={floorForm.buildingId}
                      onChange={(event) =>
                        setFloorForm((current) => ({
                          ...current,
                          buildingId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select Building</option>
                      {buildings.map((building) => (
                        <option key={building.id} value={building.id}>
                          {building.name} (No {building.buildingNo})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Floor Number
                    <input
                      required
                      min="1"
                      max="150"
                      type="number"
                      value={floorForm.floorNumber}
                      onChange={(event) =>
                        setFloorForm((current) => ({
                          ...current,
                          floorNumber: event.target.value,
                        }))
                      }
                      placeholder="14"
                    />
                  </label>
                  <label>
                    Floor Label (Optional)
                    <input
                      value={floorForm.label}
                      onChange={(event) =>
                        setFloorForm((current) => ({
                          ...current,
                          label: event.target.value,
                        }))
                      }
                      placeholder="14th floor"
                    />
                  </label>
                  <button type="submit" disabled={!floorForm.buildingId}>
                    {editingFloorId ? "Save Changes" : "Add Floor"}
                  </button>
                </form>
              </div>
            )}

            {activeSection === "book-room" && (
              <form className="glass-panel" onSubmit={handleCreateRoom}>
                <div className="panel-header-actions">
                  <h2>{editingRoomId ? "Update Room" : "Create Room"}</h2>
                  {editingRoomId && (
                    <button type="button" className="tiny-btn" onClick={handleCancelRoomEdit}>
                      Cancel
                    </button>
                  )}
                </div>
                <div className="room-field-grid">
                  <label>
                    Building
                    <select
                      required
                      value={roomForm.buildingId}
                      onChange={(event) => handleRoomBuildingChange(event.target.value)}
                    >
                      <option value="">Select Building</option>
                      {buildings.map((building) => (
                        <option key={building.id} value={building.id}>
                          {building.name} (No {building.buildingNo})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Floor
                    <select
                      required
                      value={roomForm.floorId}
                      onChange={(event) =>
                        setRoomForm((current) => ({
                          ...current,
                          floorId: event.target.value,
                        }))
                      }
                      disabled={!roomForm.buildingId}
                    >
                      <option value="">Select Floor</option>
                      {selectedBuildingFloors.map((floor) => (
                        <option key={floor.id} value={floor.id}>
                          {floor.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Name
                    <input
                      required
                      value={roomForm.name}
                      onChange={(event) =>
                        setRoomForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Lab 1"
                    />
                  </label>
                  <label>
                    Type
                    <select
                      value={roomForm.type}
                      onChange={(event) =>
                        setRoomForm((current) => ({
                          ...current,
                          type: event.target.value,
                        }))
                      }
                    >
                      {roomTypes.map((type) => (
                        <option key={type} value={type}>
                          {formatLabel(type)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Capacity
                    <input
                      required
                      min="1"
                      type="number"
                      value={roomForm.capacity}
                      onChange={(event) =>
                        setRoomForm((current) => ({
                          ...current,
                          capacity: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Location
                    <input
                      required
                      value={roomForm.location}
                      onChange={(event) =>
                        setRoomForm((current) => ({
                          ...current,
                          location: event.target.value,
                        }))
                      }
                      placeholder="Block A"
                    />
                  </label>
                  <label>
                    Availability Start
                    <input
                      required
                      type="time"
                      value={roomForm.availabilityStart}
                      onChange={(event) =>
                        setRoomForm((current) => ({
                          ...current,
                          availabilityStart: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Availability End
                    <input
                      required
                      type="time"
                      value={roomForm.availabilityEnd}
                      onChange={(event) =>
                        setRoomForm((current) => ({
                          ...current,
                          availabilityEnd: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={roomForm.status}
                      onChange={(event) =>
                        setRoomForm((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                    >
                      {roomStatuses.map((status) => (
                        <option key={status} value={status}>
                          {formatLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="description-field">
                    Description
                    <textarea
                      required
                      rows="3"
                      value={roomForm.description}
                      onChange={(event) =>
                        setRoomForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Computer lab with 40 PCs"
                    />
                  </label>
                </div>
                <button type="submit">{editingRoomId ? "Save Changes" : "Create Room"}</button>
              </form>
            )}

            {activeSection === "building-map" && (
              <article className="glass-panel">
                <h2>Building and Floor Map</h2>
                <p className="summary-note">
                  Quick summary note: click a building card to view floor-by-floor room details,
                  capacity, and status indicators to identify available and maintenance rooms fast.
                </p>
                {buildings.length === 0 ? (
                  <p className="empty">No buildings yet.</p>
                ) : (
                  <div className="building-insight-layout">
                    <ul className="map-grid">
                      {buildings.map((building) => (
                        <li
                          key={building.id}
                          className={`map-card ${String(selectedBuildingId) === String(building.id) ? "selected" : ""}`}
                          onClick={() => setSelectedBuildingId(building.id)}
                        >
                          <div className="map-card-head">
                            <h3>{building.name}</h3>
                            <span>No {building.buildingNo}</span>
                          </div>
                          <div className="card-actions">
                            <button
                              type="button"
                              className="tiny-btn"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleEditBuilding(building);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="tiny-btn danger"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteBuilding(building);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                          <p>{building.floors.length} floors</p>
                          <div className="floor-row-wrap">
                            {building.floors.map((floor) => (
                              <div key={floor.id} className="floor-row">
                                <span className="floor-chip">{floor.label}</span>
                                <div className="floor-actions">
                                  <button
                                    type="button"
                                    className="tiny-btn"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleEditFloor(floor);
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="tiny-btn danger"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleDeleteFloor(floor);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {selectedMapBuilding && (
                      <section className="building-detail-panel">
                        <h3>
                          {selectedMapBuilding.name} (No {selectedMapBuilding.buildingNo})
                        </h3>
                        <div className="building-detail-stats">
                          <span>Floors: {selectedMapBuilding.floors.length}</span>
                          <span>Rooms: {selectedBuildingStats.roomCount}</span>
                          <span>Capacity: {selectedBuildingStats.totalCapacity}</span>
                        </div>
                        <div className="status-legend">
                          <span className="status-pill active">Available To Book</span>
                          <span className="status-pill inactive">Unavailable</span>
                          <span className="status-pill maintenance">Under Maintenance</span>
                        </div>

                        <div className="status-grid compact">
                          <div className="status-box active">
                            <span>Active</span>
                            <strong>{selectedBuildingStats.activeCount}</strong>
                          </div>
                          <div className="status-box inactive">
                            <span>Inactive</span>
                            <strong>{selectedBuildingStats.inactiveCount}</strong>
                          </div>
                          <div className="status-box maintenance">
                            <span>Maintenance</span>
                            <strong>{selectedBuildingStats.maintenanceCount}</strong>
                          </div>
                        </div>

                        <div className="floor-insight-list">
                          {selectedFloorInsights.map((floor) => (
                            <article key={floor.id} className="floor-insight-card">
                              <header>
                                <h4>{floor.label}</h4>
                                <div>
                                  <small>Rooms: {floor.roomCount}</small>
                                  <small>Capacity: {floor.capacity}</small>
                                </div>
                              </header>
                              {floor.rooms.length === 0 ? (
                                <p className="empty">No rooms on this floor.</p>
                              ) : (
                                <div className="table-wrap">
                                  <table className="compact-table">
                                    <thead>
                                      <tr>
                                        <th>Room</th>
                                        <th>Type</th>
                                        <th>Capacity</th>
                                        <th>Status</th>
                                        <th>Quick Note</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {floor.rooms.map((room) => {
                                        const note = getRoomQuickNote(room);
                                        return (
                                          <tr key={room.id}>
                                            <td>{room.name}</td>
                                            <td>{formatLabel(room.type)}</td>
                                            <td>{room.capacity}</td>
                                            <td>
                                              <span className={`status-pill ${room.status.toLowerCase()}`}>
                                                {formatLabel(room.status)}
                                              </span>
                                            </td>
                                            <td>
                                              <span className={`quick-note ${note.tone}`}>
                                                {note.text}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </article>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </article>
            )}

            {activeSection === "rooms-status" && (
              <article className="glass-panel">
                <h2>Rooms Status</h2>
                <p className="summary-note">
                  Summary note: use status and quick-note labels to identify rooms that are
                  available to book, unavailable, or under maintenance at a glance.
                </p>
                <div className="status-grid">
                  <div className="status-box active">
                    <span>Active</span>
                    <strong>{roomStatusCount.ACTIVE || 0}</strong>
                  </div>
                  <div className="status-box inactive">
                    <span>Inactive</span>
                    <strong>{roomStatusCount.INACTIVE || 0}</strong>
                  </div>
                  <div className="status-box maintenance">
                    <span>Maintenance</span>
                    <strong>{roomStatusCount.MAINTENANCE || 0}</strong>
                  </div>
                </div>
                <div className="capacity-strip">
                  <span>Total Capacity: {totalCapacity}</span>
                  <span>Bookable Capacity: {activeCapacity}</span>
                  <span>Maintenance Capacity: {maintenanceCapacity}</span>
                </div>

                {rooms.length === 0 ? (
                  <p className="empty">No rooms created yet.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Building</th>
                          <th>Floor</th>
                          <th>Capacity</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Quick Note</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map((room) => (
                          <tr key={room.id}>
                            <td>{room.name}</td>
                            <td>{formatLabel(room.type)}</td>
                            <td>{room.buildingName}</td>
                            <td>{room.floorLabel}</td>
                            <td>{room.capacity}</td>
                            <td>
                              {room.availabilityStart} - {room.availabilityEnd}
                            </td>
                            <td>
                              <span className={`status-pill ${room.status.toLowerCase()}`}>
                                {formatLabel(room.status)}
                              </span>
                            </td>
                            <td>
                              {(() => {
                                const note = getRoomQuickNote(room);
                                return <span className={`quick-note ${note.tone}`}>{note.text}</span>;
                              })()}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  type="button"
                                  className="tiny-btn"
                                  onClick={() => handleEditRoom(room)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="tiny-btn danger"
                                  onClick={() => handleDeleteRoom(room)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            )}

            {activeSection === "view-book-status" && (
              <article className="glass-panel">
                <h2>Admin Booking Dashboard</h2>
                <p className="summary-note">
                  Review booking requests, apply filters, and approve or reject with details.
                </p>

                <div className="room-field-grid">
                  <label>
                    Resource ID
                    <input
                      type="number"
                      min="1"
                      value={adminBookingFilters.resourceId}
                      onChange={(event) =>
                        setAdminBookingFilters((current) => ({
                          ...current,
                          resourceId: event.target.value,
                        }))
                      }
                      placeholder="All"
                    />
                  </label>
                  <label>
                    Date
                    <input
                      type="date"
                      value={adminBookingFilters.date}
                      onChange={(event) =>
                        setAdminBookingFilters((current) => ({
                          ...current,
                          date: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={adminBookingFilters.status}
                      onChange={(event) =>
                        setAdminBookingFilters((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                    >
                      <option value="">All</option>
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </label>
                  <label>
                    User ID
                    <input
                      type="number"
                      min="1"
                      value={adminBookingFilters.requestedByUserId}
                      onChange={(event) =>
                        setAdminBookingFilters((current) => ({
                          ...current,
                          requestedByUserId: event.target.value,
                        }))
                      }
                      placeholder="All"
                    />
                  </label>
                </div>

                <div className="table-actions" style={{ marginBottom: "0.75rem" }}>
                  <button type="button" className="tiny-btn" onClick={loadAdminBookings}>
                    Apply Filters
                  </button>
                </div>

                {adminBookingsLoading ? (
                  <p className="loading-text">Loading booking requests...</p>
                ) : adminBookings.length === 0 ? (
                  <p className="empty">No booking requests found.</p>
                ) : (
                  <div className="table-wrap">
                    <table className="compact-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                          <th>Resource</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Expected Attendance</th>
                          <th>Status</th>
                          <th>Approve Details</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>{booking.id}</td>
                            <td>{booking.requestedByUserId}</td>
                            <td>{booking.resourceId}</td>
                            <td>{booking.date}</td>
                            <td>
                              {booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}
                            </td>
                            <td>{booking.expectedAttendees}</td>
                            <td>{booking.status}</td>
                            <td>{booking.adminReason || "-"}</td>
                            <td>
                              <div className="table-actions">
                                <button
                                  type="button"
                                  className="tiny-btn"
                                  onClick={() => handleAdminApprove(booking)}
                                  disabled={booking.status !== "PENDING"}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="tiny-btn danger"
                                  onClick={() => handleAdminReject(booking)}
                                  disabled={booking.status !== "PENDING"}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            )}
          </section>
        )}
      </div>
    </main>
  );
}