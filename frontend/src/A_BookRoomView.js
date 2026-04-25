import { useMemo, useState } from "react";
import NotificationPanel from "./NotificationPanel";

export default function ABookRoomView({
  clearMessages,
  setCurrentDashboard,
  handleLogout,
  buildings,
  bookRoomSelectedBuildingId,
  setBookRoomSelectedBuildingId,
  setBookRoomSelectedFloorId,
  bookRoomSelectedBuilding,
  bookRoomSelectedFloorId,
  bookRoomFloors,
  bookRoomSelectedFloor,
  bookRoomRooms,
  getRoomQuickNote,
  formatLabel,
  setErrorMessage,
  errorMessage,
  successMessage,
  bookingUserId,
  setBookingUserId,
  bookingForm,
  setBookingForm,
  handleSubmitBooking,
  bookingLoading,
  showBookingStatus,
  setShowBookingStatus,
  myBookings,
  loadMyBookings,
  handleCancelMyBooking,
  rooms,
  bookNotifications,
  bookUnreadCount,
  clearBookNotifications,
  markBookNotificationsRead,
  authUser,
}) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showNotifications, setShowNotifications] = useState(false);

  async function handleViewBookingStatus() {
    clearMessages();

    if (!bookingUserId) {
      setErrorMessage("Enter a User ID to view booking status.");
      return;
    }

    await loadMyBookings();
    setStatusFilter("ALL");
    setShowBookingStatus(true);

    setTimeout(() => {
      document.getElementById("my-booking-status")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  const roomLookup = useMemo(() => {
    const buildingNameById = new Map();
    const floorMetaById = new Map();

    (buildings || []).forEach((building) => {
      buildingNameById.set(String(building.id), building.name);
      (building.floors || []).forEach((floor) => {
        floorMetaById.set(String(floor.id), {
          label: floor.label,
          buildingId: String(building.id),
        });
      });
    });

    const map = new Map();
    (rooms || []).forEach((room) => {
      const floorMeta = floorMetaById.get(String(room.floorId));
      const derivedBuildingName = buildingNameById.get(String(room.buildingId));
      const derivedFloorLabel = floorMeta?.label;

      map.set(String(room.id), {
        ...room,
        buildingName: room.buildingName || derivedBuildingName,
        floorLabel: room.floorLabel || derivedFloorLabel,
      });
    });
    return map;
  }, [buildings, rooms]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "ALL") {
      return myBookings;
    }
    return myBookings.filter((booking) => booking.status === statusFilter);
  }, [myBookings, statusFilter]);

  const selectedRoom = useMemo(
    () => roomLookup.get(String(bookingForm.resourceId)) || null,
    [bookingForm.resourceId, roomLookup]
  );

  const roomStatusSummary = useMemo(
    () => ({
      total: bookRoomRooms.length,
      active: bookRoomRooms.filter((room) => room.status === "ACTIVE").length,
      inactive: bookRoomRooms.filter((room) => room.status === "INACTIVE").length,
      maintenance: bookRoomRooms.filter((room) => room.status === "MAINTENANCE").length,
    }),
    [bookRoomRooms]
  );

  const bookingSummary = useMemo(
    () => ({
      total: myBookings.length,
      approved: myBookings.filter((booking) => booking.status === "APPROVED").length,
      pending: myBookings.filter((booking) => booking.status === "PENDING").length,
      cancelled: myBookings.filter((booking) => booking.status === "CANCELLED").length,
    }),
    [myBookings]
  );

  function handleBookRoomSelect(room) {
    if (room.status !== "ACTIVE") {
      setErrorMessage(`Room ${room.name} is not available for booking.`);
      return;
    }

    clearMessages();
    setBookingForm((current) => ({
      ...current,
      resourceId: String(room.id),
      purpose: current.purpose || `Booking request for ${room.name}`,
    }));
  }

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
                Ticket Page
              </button>
              <button
                type="button"
                className="tiny-btn"
                onClick={() => setShowNotifications((current) => !current)}
              >
                Notifications ({bookUnreadCount})
              </button>
              <button type="button" className="tiny-btn logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
              <button
                type="button"
                className="tiny-btn"
                onClick={() => {
                  clearMessages();
                  setCurrentDashboard("portal");
                }}
              >
                ← Portal
              </button>
          </div>
        </div>

        <header className="hero-banner admin-hero-v3">
          <div className="hero-content">
            <span className="hero-tag">✦ Smart Campus Access</span>
            <h1>Room Booking</h1>
            <p>
              Find and reserve available campus resources. Use our interactive map to select the perfect space for your needs.
            </p>
          </div>
        </header>

          <div className="booking-hero-strip">
            <div className="booking-hero-card">
              <span>Live rooms</span>
              <strong>{bookRoomSelectedFloor ? roomStatusSummary.total : rooms.length}</strong>
            </div>
            <div className="booking-hero-card accent-teal">
              <span>Ready to book</span>
              <strong>{bookRoomSelectedFloor ? roomStatusSummary.active : "-"}</strong>
            </div>
            <div className="booking-hero-card accent-sky">
              <span>My pending</span>
              <strong>{bookingSummary.pending}</strong>
            </div>
            <div className="booking-hero-card accent-coral">
              <span>Alerts</span>
              <strong>{bookNotifications.length}</strong>
            </div>
          </div>
          <div className="hero-head-row booking-hero-actions">
            <button
              type="button"
              className="tiny-btn booking-btn booking-btn-primary"
              onClick={handleViewBookingStatus}
            >
              View Booking Status
            </button>
          </div>

          {showNotifications && (
            <NotificationPanel
              title="Booking Notifications"
              kicker="Approval Updates"
              notifications={bookNotifications}
              emptyText="No booking updates yet."
              onMarkAllRead={markBookNotificationsRead}
              onClearAll={clearBookNotifications}
            />
          )}

        <div className="book-room-container">
          <section className="booking-main-grid">
            <form className="glass-panel booking-form-panel" onSubmit={handleSubmitBooking}>
              <div className="booking-panel-head">
                <div>
                  <span className="booking-section-kicker">Request studio</span>
                  <h2>Create Booking Request</h2>
                  <p className="summary-note">
                    Fill the schedule details below, or tap a room from the availability list to
                    auto-fill the room ID.
                  </p>
                </div>
                <div className="booking-selection-chip">
                  {selectedRoom ? `${selectedRoom.name} selected` : "No room selected"}
                </div>
              </div>

              <div className="booking-highlight-strip">
                <div className="booking-highlight-card">
                  <span>Selected room</span>
                  <strong>{selectedRoom?.name || "Choose from below"}</strong>
                </div>
                <div className="booking-highlight-card">
                  <span>Location</span>
                  <strong>
                    {selectedRoom 
                      ? `${selectedRoom.buildingName} - Floor ${selectedRoom.floorLabel}`
                      : bookRoomSelectedFloor 
                        ? `${bookRoomSelectedBuilding.name} - Floor ${bookRoomSelectedFloor.label || bookRoomSelectedFloor.floorNumber}`
                        : "-"}
                  </strong>
                </div>
                <div className="booking-highlight-card">
                  <span>Capacity</span>
                  <strong>{selectedRoom?.capacity || bookingForm.expectedAttendees || "-"}</strong>
                </div>
              </div>

              <div className="room-field-grid booking-form-grid">
                <label className="field-card">
                  User ID
                  <input
                    required
                    min="1"
                    type="number"
                    value={bookingUserId}
                    onChange={(event) => setBookingUserId(event.target.value)}
                    placeholder="1"
                  />
                </label>
                <label className="field-card">
                  Resource ID (Room ID)
                  <input
                    required
                    min="1"
                    type="number"
                    value={bookingForm.resourceId}
                    onChange={(event) =>
                      setBookingForm((current) => ({
                        ...current,
                        resourceId: event.target.value,
                      }))
                    }
                    placeholder="Auto fill by Book Now"
                  />
                </label>
                <label className="field-card">
                  Date
                  <input
                    required
                    type="date"
                    value={bookingForm.date}
                    onChange={(event) =>
                      setBookingForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="field-card">
                  Start Time
                  <input
                    required
                    type="time"
                    value={bookingForm.startTime}
                    onChange={(event) =>
                      setBookingForm((current) => ({
                        ...current,
                        startTime: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="field-card">
                  End Time
                  <input
                    required
                    type="time"
                    value={bookingForm.endTime}
                    onChange={(event) =>
                      setBookingForm((current) => ({
                        ...current,
                        endTime: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="field-card">
                  Expected Attendees
                  <input
                    min="1"
                    type="number"
                    value={bookingForm.expectedAttendees}
                    onChange={(event) =>
                      setBookingForm((current) => ({
                        ...current,
                        expectedAttendees: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                  />
                </label>
                <label className="description-field field-card">
                  Purpose
                  <textarea
                    required
                    rows="3"
                    value={bookingForm.purpose}
                    onChange={(event) =>
                      setBookingForm((current) => ({
                        ...current,
                        purpose: event.target.value,
                      }))
                    }
                    placeholder="Lecture, workshop, meeting"
                  />
                </label>
              </div>

              <div className="booking-form-actions">
                <button
                  type="submit"
                  className="tiny-btn booking-btn booking-btn-primary booking-btn-large"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Submitting..." : "Submit Booking Request"}
                </button>
                <button
                  type="button"
                  className="tiny-btn booking-btn booking-btn-secondary booking-btn-large"
                  onClick={handleViewBookingStatus}
                >
                  Check My Booking Status
                </button>
              </div>
            </form>

            <aside className="glass-panel booking-side-panel">
              <div className="booking-panel-head">
                <div>
                  <span className="booking-section-kicker">Availability overview</span>
                  <h2>Room Selection</h2>
                </div>
              </div>
              <div className="booking-side-stack">
                <div className="booking-side-card">
                  <span>Active rooms</span>
                  <strong>{bookRoomSelectedFloor ? roomStatusSummary.active : rooms.length}</strong>
                </div>
                <div className="booking-side-card">
                  <span>Approved bookings</span>
                  <strong>{bookingSummary.approved}</strong>
                </div>
                <div className="booking-side-card">
                  <span>Cancelled bookings</span>
                  <strong>{bookingSummary.cancelled}</strong>
                </div>
              </div>
              <p className="summary-note booking-side-note">
                Buttons are highlighted clearly so users can spot primary actions faster.
              </p>
            </aside>
          </section>

          <div className="book-room-selectors booking-selectors-modern">
            <div className="selector-group combined-selector">
              <label>Select Location (Building & Floor)</label>
              <select
                value={bookRoomSelectedFloorId ? `${bookRoomSelectedBuildingId}_${bookRoomSelectedFloorId}` : ""}
                onChange={(event) => {
                  const val = event.target.value;
                  if (!val) {
                    setBookRoomSelectedBuildingId(null);
                    setBookRoomSelectedFloorId(null);
                  } else {
                    const [bId, fId] = val.split("_");
                    setBookRoomSelectedBuildingId(bId);
                    setBookRoomSelectedFloorId(fId);
                  }
                }}
              >
                <option value="">-- Choose Building & Floor --</option>
                {buildings.map((building) => (
                  <optgroup key={building.id} label={`Building ${building.buildingNo}: ${building.name}`}>
                    {building.floors?.map((floor) => (
                      <option key={floor.id} value={`${building.id}_${floor.id}`}>
                        Building {building.buildingNo} - Floor {floor.label || floor.floorNumber}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {bookRoomSelectedFloor && (
            <div className="glass-panel book-room-panel">
              <div className="booking-panel-head">
                <div>
                  <span className="booking-section-kicker">Availability board</span>
                  <h2>
                    Building {bookRoomSelectedBuilding.buildingNo} - Floor{" "}
                    {bookRoomSelectedFloor.floorNumber ?? bookRoomSelectedFloor.label}
                  </h2>
                </div>
                <div className="booking-availability-strip">
                  <span className="booking-mini-stat available">
                    {roomStatusSummary.active} available
                  </span>
                  <span className="booking-mini-stat inactive">
                    {roomStatusSummary.inactive} inactive
                  </span>
                  <span className="booking-mini-stat maintenance">
                    {roomStatusSummary.maintenance} maintenance
                  </span>
                </div>
              </div>
              {bookRoomRooms.length === 0 ? (
                <p className="empty">No rooms on this floor.</p>
              ) : (
                <div className="table-wrap booking-table-shell">
                  <table className="compact-table booking-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Room</th>
                        <th>Type</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Quick Note</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookRoomRooms.map((room) => {
                        const note = getRoomQuickNote(room);
                        return (
                          <tr key={room.id}>
                            <td>{room.id}</td>
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
                            <td>
                              <button
                                type="button"
                                className={`tiny-btn booking-btn ${
                                  room.status === "ACTIVE"
                                    ? "booking-btn-primary"
                                    : "booking-btn-muted"
                                }`}
                                onClick={() => handleBookRoomSelect(room)}
                              >
                                {room.status === "ACTIVE" ? "Book Now" : "Unavailable"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {showBookingStatus && (
            <article className="glass-panel booking-status-panel" id="my-booking-status">
              <div className="panel-header-actions">
                <div>
                  <span className="booking-section-kicker">My requests</span>
                  <h2>My Booking Status</h2>
                </div>
                <div className="table-actions">
                  <button
                    type="button"
                    className="tiny-btn booking-btn booking-btn-secondary"
                    onClick={handleViewBookingStatus}
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    className="tiny-btn booking-btn booking-btn-ghost"
                    onClick={() => setShowBookingStatus(false)}
                  >
                    Hide
                  </button>
                </div>
              </div>
              <div className="booking-filter-row">
                {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`tiny-btn booking-filter-chip ${
                      statusFilter === status ? "active" : ""
                    }`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <p className="empty">No bookings found for this user.</p>
              ) : (
                <div className="ticket-grid-modern">
                  {filteredBookings.map((booking) => {
                    const room = roomLookup.get(String(booking.resourceId));
                    const detailsText =
                      booking.status === "CANCELLED"
                        ? booking.cancellationReason || "-"
                        : booking.adminReason || "-";
                    const buildingLabel = booking.buildingName || room?.buildingName || "-";
                    const floorLabel = booking.floorLabel || room?.floorLabel || "-";
                    // For the glow / tone logic, you can reuse getTicketStatusTone if needed, 
                    // or just write a small helper logic here based on booking status.
                    let tone = "open";
                    if (booking.status === "APPROVED") tone = "resolved";
                    if (booking.status === "REJECTED" || booking.status === "CANCELLED") tone = "closed";
                    if (booking.status === "PENDING") tone = "progress";

                    return (
                      <article key={`booking-${booking.id}`} className={`ticket-card-modern status-${tone}`}>
                        <div className="ticket-card-glow" />
                        <div className="ticket-card-content">
                          <div className="ticket-card-header-modern">
                            <span className={`status-badge ${tone}`}>
                              {booking.status}
                            </span>
                            <div className="ticket-priority-indicator">
                               <span className="priority-dot medium" title="Booking" />
                            </div>
                          </div>
                          
                          <h3>{buildingLabel} - Floor {floorLabel}</h3>
                          <p className="ticket-desc-short">{booking.purpose}</p>
                          
                          <div className="ticket-info-group">
                            <div className="info-item">
                              <span className="info-label">Date</span>
                              <span className="info-value">{booking.date}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Time</span>
                              <span className="info-value">
                                {booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}
                              </span>
                            </div>
                            <div className="info-item full">
                              <span className="info-label">Expected Attendees</span>
                              <span className="info-value">{booking.expectedAttendees ?? "-"}</span>
                            </div>
                          </div>

                          {detailsText !== "-" && (
                            <div className="ticket-info-group" style={{ marginTop: '0.5rem' }}>
                              <div className="info-item full">
                                <span className="info-label">Admin / Details</span>
                                <span className="info-value">{detailsText}</span>
                              </div>
                            </div>
                          )}

                          <div className="ticket-card-footer-modern" style={{ marginTop: '1rem', borderTop: '1px solid rgba(20, 35, 31, 0.08)', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="footer-meta">
                               <span className="reported-date">🆔 Booking #{booking.id}</span>
                            </div>
                            <div className="table-actions">
                               <button
                                 type="button"
                                 className="tiny-btn booking-btn booking-btn-primary"
                                 disabled={booking.status !== "APPROVED" && booking.status !== "PENDING"}
                                 onClick={() => {
                                   clearMessages();
                                   setErrorMessage("Modify booking is not yet supported. Please cancel and re-book if needed.");
                                 }}
                               >
                                 Modify
                               </button>
                               <button
                                 type="button"
                                 className="tiny-btn booking-btn booking-btn-danger"
                                 onClick={() => handleCancelMyBooking(booking)}
                                 disabled={booking.status !== "APPROVED" && booking.status !== "PENDING"}
                               >
                                 Cancel
                               </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </article>
          )}

          {errorMessage && <p className="message error">{errorMessage}</p>}
          {successMessage && <p className="message success">{successMessage}</p>}
        </div>
      </div>
    </main>
  );
}
