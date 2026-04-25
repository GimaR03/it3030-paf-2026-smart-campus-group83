import { dashboardActions, roomStatuses } from "./A_constants";
import { formatLabel } from "./A_helpers";

export default function A_AdminDashboardView({
  clearMessages,
  setCurrentDashboard,
  handleLogout,
  adminNotifications,
  showAdminNotifications,
  setShowAdminNotifications,
  clearAdminNotifications,
  authUser,
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
  createAdminForm,
  setCreateAdminForm,
  handleCreateAdmin,
  admins,
  loadAdmins,
  maintenanceStaff,
  loadMaintenanceStaff,
  createMaintenanceForm,
  setCreateMaintenanceForm,
  handleCreateMaintenance,
  allUsers,
  loadAllUsers,
  handleDeleteUser,
  tickets,
  handleAssignTicket,
  handleDeleteTicket,
  handleMaintenanceTicketAction,
}) {
  const userAccounts = (allUsers || []).filter((user) => user.role === "USER");
  const pendingBookings = (adminBookings || []).filter((booking) => booking.status === "PENDING").length;
  const openTickets = (tickets || []).filter(
    (ticket) => ticket.status === "OPEN" || ticket.status === "IN_PROGRESS"
  ).length;
  const latestNotifications = adminNotifications.slice(0, 4);

  const adminSections = [
    { id: "overview", title: "Overview", subtitle: "System Health", icon: "📊", accent: "teal" },
    { id: "manage-buildings", title: "Buildings", subtitle: "Floors & Structure", icon: "🏛️", accent: "terracotta" },
    { id: "book-room", title: "Rooms & Labs", subtitle: "Inventory Setup", icon: "🚪", accent: "teal" },
    { id: "building-map", title: "Campus Map", subtitle: "Visual Layout", icon: "🗺️", accent: "sky" },
    { id: "view-book-status", title: "Reservations", subtitle: "Approval Queue", icon: "📅", accent: "sky" },
    { id: "ticket-management", title: "Maintenance", subtitle: "Ticket Dispatch", icon: "🎫", accent: "sky" },
    { id: "admin-management", title: "Staffing", subtitle: "Admins & Techs", icon: "👥", accent: "leaf" },
    { id: "user-management", title: "Directory", subtitle: "User Accounts", icon: "👤", accent: "terracotta" },
  ];

  const activeSectionMeta =
    adminSections.find((section) => section.id === activeSection) || adminSections[0];

  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap portal-container">
        <div className="portal-top-bar">
          <div className="user-profile-badge">
            <div className="user-avatar">
              {authUser?.fullName?.charAt(0) || "A"}
            </div>
            <div className="user-text">
              <span className="user-name">{authUser?.fullName || "Admin"}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
          <div className="v6-nav-actions">
             <button
                type="button"
                className={`v6-action-pill ${adminNotifications.length > 0 ? 'has-alerts' : ''}`}
                onClick={() => setShowAdminNotifications((current) => !current)}
              >
                <span className="pill-icon">🔔</span>
                <span className="pill-text">Notifications</span>
                <span className="pill-badge">{adminNotifications.length}</span>
              </button>
              <button type="button" className="v6-action-pill danger" onClick={handleLogout}>
                <span className="pill-icon">🚪</span>
                <span className="pill-text">Logout</span>
              </button>
          </div>
        </div>

        <header className="hero-banner admin-hero-v3">
          <div className="hero-content">
            <span className="hero-tag">✦ Smart Campus Operations</span>
            <h1>Operations Center</h1>
            <p>
              Signed in as <strong>{authUser?.email || "admin@my.sliit.lk"}</strong>. 
              Centralized control for campus infrastructure, booking approvals, and staff coordination.
            </p>
          </div>
        </header>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            {adminSections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`admin-nav-item ${activeSection === section.id ? "active" : ""}`}
                onClick={() => {
                   setActiveSection(section.id);
                   if (section.id === "view-book-status") {
                     loadAdminBookings();
                   }
                }}
              >
                <div className="nav-icon-box">{section.icon}</div>
                <div className="nav-text">
                  <span className="nav-title">{section.title}</span>
                  <span className="nav-subtitle">{section.subtitle}</span>
                </div>
              </button>
            ))}
          </aside>

          <section className="admin-main-content">
            <div className="section-hero-card">
              <div className="section-hero-info">
                <h2>{activeSectionMeta.title}</h2>
                <p>{activeSectionMeta.subtitle}</p>
              </div>
              <div className="section-hero-stats">
                 {/* Contextual stats could go here */}
              </div>
            </div>

            {activeSection === "overview" && (
              <div className="overview-workspace animate-fade-in">
                <section className="stats-v3">
                  <article className="stat-card-v3">
                    <span>Campus Resources</span>
                    <strong>{buildings.length} Buildings</strong>
                    <small>{rooms.length} Rooms Total</small>
                  </article>
                  <article className="stat-card-v3">
                    <span>Pending Reviews</span>
                    <strong>{pendingBookings} Requests</strong>
                    <small>Requires Attention</small>
                  </article>
                  <article 
                    className="stat-card-v3 clickable" 
                    onClick={() => setActiveSection("ticket-management")}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Support Queue</span>
                    <strong>{openTickets} Tickets</strong>
                    <small>Maintenance Pending</small>
                  </article>
                  <article className="stat-card-v3">
                    <span>Total Accounts</span>
                    <strong>{admins.length + maintenanceStaff.length + userAccounts.length}</strong>
                    <small>Staff & Students</small>
                  </article>
                </section>

                <section className="admin-notice-bar" style={{ marginTop: '1.5rem' }}>
                  <div className="admin-notice-head">
                    <div>
                      <span className="panel-kicker">Live Alerts</span>
                      <h2>Recent System Activity</h2>
                    </div>
                    {adminNotifications.length > 0 && (
                      <button type="button" className="tiny-btn" onClick={clearAdminNotifications}>
                        Clear all
                      </button>
                    )}
                  </div>

                  {latestNotifications.length === 0 ? (
                    <p className="empty">No new system alerts.</p>
                  ) : (
                    <div className="admin-notice-grid">
                      {latestNotifications.map((notice) => (
                        <article key={notice.id} className="admin-notice-card">
                          <strong>{notice.message}</strong>
                          <p>
                            {[notice.building, notice.floor, notice.hallLab].filter(Boolean).join(" · ") ||
                              "Campus update"}
                          </p>
                          {notice.timestamp && <small>{notice.timestamp}</small>}
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {isLoading && <p className="loading-text">Loading campus data...</p>}
            {errorMessage && <p className="message error">{errorMessage}</p>}
            {successMessage && <p className="message success">{successMessage}</p>}

            {!isLoading && (
              <>
                {/* Notification Modal / Drawer */}
                {showAdminNotifications && (
                  <article className="glass-panel admin-notification-panel animate-fade-in">
                    <div className="panel-header-actions">
                      <div>
                        <span className="panel-kicker">Notification Center</span>
                        <h2>All admin notifications</h2>
                      </div>
                      <button type="button" className="tiny-btn" onClick={clearAdminNotifications}>
                        Clear
                      </button>
                    </div>
                    {adminNotifications.length === 0 ? (
                      <p className="empty">No notifications yet.</p>
                    ) : (
                      <ul className="admin-notification-list">
                        {adminNotifications.map((notice) => (
                          <li key={notice.id}>
                            <div>
                              <strong>{notice.message}</strong>
                              <p>
                                {[notice.building, notice.floor, notice.hallLab]
                                  .filter(Boolean)
                                  .join(" · ") || "Campus update"}
                              </p>
                            </div>
                            {notice.timestamp && <small>{notice.timestamp}</small>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                )}

            {activeSection === "admin-management" && (
              <div className="workspace-grid two-up staff-management-grid">
                <div className="staff-column">
                  <form className="glass-panel admin-form-panel" onSubmit={handleCreateAdmin}>
                    <div className="panel-header-actions">
                      <div>
                        <span className="panel-kicker">Admin Access</span>
                        <h2>Add Admin Account</h2>
                      </div>
                    </div>
                    <p className="summary-note">
                      Create a new administrator with full control over rooms, bookings, and
                      staff management.
                    </p>
                    <label>
                      Full Name
                      <input
                        value={createAdminForm.fullName}
                        onChange={(event) =>
                          setCreateAdminForm((current) => ({
                            ...current,
                            fullName: event.target.value,
                          }))
                        }
                        placeholder="e.g. Faculty Admin"
                      />
                    </label>
                    <label>
                      Admin Email
                      <input
                        required
                        type="email"
                        value={createAdminForm.email}
                        onChange={(event) =>
                          setCreateAdminForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="e.g. opslead@my.sliit.lk"
                      />
                    </label>
                    <label>
                      Password
                      <input
                        required
                        type="password"
                        value={createAdminForm.password}
                        onChange={(event) =>
                          setCreateAdminForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        placeholder="At least 6 characters"
                      />
                    </label>
                    <button type="submit" className="teal-btn">
                      Create Admin
                    </button>
                  </form>

                  <article className="glass-panel admin-directory-panel">
                    <div className="panel-header-actions">
                      <div>
                        <span className="panel-kicker">Admin Directory</span>
                        <h3>System Admins</h3>
                      </div>
                      <button type="button" className="tiny-btn" onClick={loadAdmins}>
                        Refresh
                      </button>
                    </div>
                    {admins && admins.length > 0 ? (
                      <ul className="staff-list admin-staff-list">
                        {admins.map((admin) => (
                          <li key={admin.userId} className="staff-item">
                            <div>
                              <strong>{admin.fullName}</strong>
                              <span>{admin.email}</span>
                            </div>
                            <span className="status-badge">ADMIN</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty">No additional admins.</p>
                    )}
                  </article>
                </div>

                <div className="staff-column">
                  <form className="glass-panel admin-form-panel" onSubmit={handleCreateMaintenance}>
                    <div className="panel-header-actions">
                      <div>
                        <span className="panel-kicker">Maintenance Access</span>
                        <h2>Add Maintenance Account</h2>
                      </div>
                    </div>
                    <p className="summary-note">
                      Set up maintenance staff so tickets can be assigned and tracked
                      without sharing admin credentials.
                    </p>
                    <label>
                      Full Name
                      <input
                        value={createMaintenanceForm.fullName}
                        onChange={(event) =>
                          setCreateMaintenanceForm((current) => ({
                            ...current,
                            fullName: event.target.value,
                          }))
                        }
                        placeholder="e.g. Technical Staff"
                      />
                    </label>
                    <label>
                      Staff Email
                      <input
                        required
                        type="email"
                        value={createMaintenanceForm.email}
                        onChange={(event) =>
                          setCreateMaintenanceForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="e.g. maintenance@my.sliit.lk"
                      />
                    </label>
                    <label>
                      Password
                      <input
                        required
                        type="password"
                        value={createMaintenanceForm.password}
                        onChange={(event) =>
                          setCreateMaintenanceForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        placeholder="At least 6 characters"
                      />
                    </label>
                    <button type="submit" className="sky-btn">
                      Create Maintenance
                    </button>
                  </form>

                  <article className="glass-panel admin-directory-panel">
                    <div className="panel-header-actions">
                      <div>
                        <span className="panel-kicker">Maintenance Directory</span>
                        <h3>Maintenance Staff</h3>
                      </div>
                      <button type="button" className="tiny-btn" onClick={loadMaintenanceStaff}>
                        Refresh
                      </button>
                    </div>
                    {maintenanceStaff && maintenanceStaff.length > 0 ? (
                      <ul className="staff-list admin-staff-list">
                        {maintenanceStaff.map((staff) => (
                          <li key={staff.userId} className="staff-item">
                            <div>
                              <strong>{staff.fullName}</strong>
                              <span>{staff.email}</span>
                            </div>
                            <span className="status-badge">MAINTENANCE</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty">No maintenance staff.</p>
                    )}
                  </article>
                </div>
              </div>
            )}

            {activeSection === "user-management" && (
              <article className="glass-panel admin-table-panel">
                <div className="panel-header-actions">
                  <div>
                    <span className="panel-kicker">Account Oversight</span>
                    <h2>Campus User Directory</h2>
                  </div>
                  <button type="button" className="tiny-btn" onClick={loadAllUsers}>
                    Refresh Directory
                  </button>
                </div>
                <p className="summary-note">
                  Review registered student and staff accounts, then remove invalid entries if
                  needed.
                </p>
                <div className="capacity-strip admin-info-strip">
                  <span>Total user accounts: {userAccounts.length}</span>
                  <span>Admin accounts: {admins.length}</span>
                  <span>Maintenance accounts: {maintenanceStaff.length}</span>
                </div>

                {userAccounts.length > 0 ? (
                  <div className="table-wrap admin-table-wrap">
                    <table className="compact-table admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Phone</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userAccounts.map((user) => (
                          <tr key={user.userId}>
                            <td>{user.userId}</td>
                            <td>
                              <strong>{user.fullName}</strong>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span className="status-badge">{user.role}</span>
                            </td>
                            <td>{user.phoneNumber || "-"}</td>
                            <td>
                              <button
                                type="button"
                                className="tiny-btn danger"
                                onClick={() => handleDeleteUser(user.userId)}
                                title="Delete User"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty">No users found in the directory.</p>
                )}
              </article>
            )}

            {activeSection === "manage-buildings" && (
              <div className="workspace-grid two-up">
                <form className="glass-panel admin-form-panel" onSubmit={handleCreateBuilding}>
                  <div className="panel-header-actions">
                    <div>
                      <span className="panel-kicker">Building Setup</span>
                      <h2>{editingBuildingId ? "Update Building" : "Add Building"}</h2>
                    </div>
                    {editingBuildingId && (
                      <button type="button" className="tiny-btn" onClick={handleCancelBuildingEdit}>
                        Cancel
                      </button>
                    )}
                  </div>
                  <p className="summary-note">
                    Register a building with its number, name, and expected floor count before
                    mapping rooms.
                  </p>
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

                <form className="glass-panel admin-form-panel" onSubmit={handleAddFloor}>
                  <div className="panel-header-actions">
                    <div>
                      <span className="panel-kicker">Floor Setup</span>
                      <h2>{editingFloorId ? "Update Floor" : "Add Floor"}</h2>
                    </div>
                    {editingFloorId && (
                      <button type="button" className="tiny-btn" onClick={handleCancelFloorEdit}>
                        Cancel
                      </button>
                    )}
                  </div>
                  <p className="summary-note">
                    Attach floors to a building so rooms can be assigned to the correct level.
                  </p>
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
                          Building {building.buildingNo}
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
              <form className="glass-panel admin-form-panel" onSubmit={handleCreateRoom}>
                <div className="panel-header-actions">
                  <div>
                    <span className="panel-kicker">Room Setup</span>
                    <h2>{editingRoomId ? "Update Room" : "Create Room"}</h2>
                  </div>
                  {editingRoomId && (
                    <button type="button" className="tiny-btn" onClick={handleCancelRoomEdit}>
                      Cancel
                    </button>
                  )}
                </div>
                <p className="summary-note">
                  Add a room with capacity, availability window, and status so it appears
                  correctly across booking and reporting views.
                </p>
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
                          Building {building.buildingNo}
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
                          Floor {floor.floorNumber ?? floor.label}
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
              <article className="glass-panel admin-table-panel">
                <div className="panel-header-actions">
                  <div>
                    <span className="panel-kicker">Campus Layout</span>
                    <h2>Building and Floor Map</h2>
                  </div>
                </div>
                <p className="summary-note">
                  Select a building to inspect floors, room counts, total capacity, and current
                  room status indicators.
                </p>
                {buildings.length === 0 ? (
                  <p className="empty">No buildings yet.</p>
                ) : (
                  <div className="building-insight-layout">
                    <ul className="map-grid">
                      {buildings.map((building) => (
                        <li
                          key={building.id}
                          className={`map-card ${
                            String(selectedBuildingId) === String(building.id) ? "selected" : ""
                          }`}
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
              <article className="glass-panel admin-table-panel">
                <div className="panel-header-actions">
                  <div>
                    <span className="panel-kicker">Room Availability</span>
                    <h2>Rooms Status</h2>
                  </div>
                </div>
                <p className="summary-note">
                  Track which rooms are ready to book, unavailable, or under maintenance at a
                  glance.
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
                  <div className="table-wrap admin-table-wrap">
                    <table className="admin-table">
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
              <article className="glass-panel admin-table-panel">
                <div className="panel-header-actions">
                  <div>
                    <span className="panel-kicker">Booking Control</span>
                    <h2>Admin Booking Dashboard</h2>
                  </div>
                </div>
                <p className="summary-note">
                  Filter requests by resource, date, status, or user, then approve or reject
                  pending bookings.
                </p>

                <div className="room-field-grid admin-filter-grid">
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
                  <div className="table-wrap admin-table-wrap">
                    <table className="compact-table admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                          <th>Resource</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Expected Attendance</th>
                          <th>Status</th>
                          <th>Decision Details</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminBookings.map((booking) => {
                          const detailsText =
                            booking.status === "CANCELLED"
                              ? booking.cancellationReason || "-"
                              : booking.adminReason || "-";

                          return (
                            <tr key={booking.id}>
                              <td>{booking.id}</td>
                              <td>{booking.requestedByUserId}</td>
                              <td>{booking.resourceId}</td>
                              <td>{booking.date}</td>
                              <td>
                                {booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}
                              </td>
                              <td>{booking.expectedAttendees ?? "-"}</td>
                              <td>
                                <span className={`booking-status-badge ${booking.status.toLowerCase()}`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td>{detailsText}</td>
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            )}

            {activeSection === "ticket-management" && (
              <article className="glass-panel admin-table-panel">
                <div className="panel-header-actions">
                  <div>
                    <span className="panel-kicker">Maintenance Routing</span>
                    <h2>Ticket Assignments</h2>
                  </div>
                </div>
                <p className="summary-note">
                  Route open or in-progress tickets to the right maintenance staff member.
                </p>

                {(!tickets || tickets.length === 0) ? (
                  <p className="empty">No tickets available.</p>
                ) : (
                  <div className="table-wrap admin-table-wrap">
                    <table className="compact-table admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Sender</th>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Assigned To</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((ticket) => {
                          const assignedUser = maintenanceStaff?.find(
                            (staff) => String(staff.userId) === String(ticket.assignedMaintenanceId)
                          );
                          return (
                            <tr key={ticket.id}>
                              <td>#{ticket.id}</td>
                              <td>{ticket.creatorName || "Unknown"}</td>
                              <td>{ticket.title}</td>
                              <td>{ticket.status}</td>
                              <td>{assignedUser ? assignedUser.fullName : "Unassigned"}</td>
                              <td>
                                <div className="table-actions">
                                  {ticket.status === "SUBMITTED" && (
                                    <button
                                      type="button"
                                      className="tiny-btn"
                                      style={{ background: '#3182ce', color: 'white' }}
                                      onClick={() => handleMaintenanceTicketAction(ticket, "APPROVE")}
                                    >
                                      Approve
                                    </button>
                                  )}
                                  <select
                                    className="tiny-btn admin-select-inline"
                                    value={ticket.assignedMaintenanceId || ""}
                                    onChange={(event) => handleAssignTicket(ticket.id, event.target.value)}
                                    title="Assign this ticket to maintenance staff"
                                  >
                                    <option value="">Assign...</option>
                                    {maintenanceStaff?.map((staff) => (
                                      <option key={staff.userId} value={staff.userId}>
                                        {staff.fullName}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            )}
          </>
        )}
      </section>
        </div>
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

        .v6-action-pill.has-alerts {
            background: #fef08a;
            color: #854d0e;
        }

        .v6-action-pill.has-alerts:hover {
            background: #fde047;
        }

        .pill-icon {
            font-size: 14px;
        }

        .pill-badge {
            background: #ef4444;
            color: #ffffff;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 800;
            margin-left: 4px;
        }
      `}</style>
    </main>
  );
}
