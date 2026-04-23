import { useMemo, useState } from "react";

export default function ABookRoomView({
  clearMessages,
  setCurrentDashboard,
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
  clearBookNotifications,
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
      <div className="dashboard-wrap">
        <header className="hero-banner portal-hero">
          <div className="hero-head-row">
            <span className="hero-tag">Smart Campus Access</span>
            <div className="table-actions">
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
                Notification ({bookNotifications.length})
              </button>
              <button
                type="button"
                className="tiny-btn hero-back"
                onClick={() => {
                  clearMessages();
                  setCurrentDashboard("portal");
                }}
              >
                Back To Dashboard
              </button>
            </div>
          </div>
          <h1>Book Room</h1>
          <p>Select a building and floor to view and book available rooms.</p>
          <div className="hero-head-row" style={{ marginTop: "0.8rem" }}>
            <button
              type="button"
              className="tiny-btn"
              onClick={handleViewBookingStatus}
            >
              View Booking Status
            </button>
          </div>

          {bookNotifications.length > 0 && (
            <article className="glass-panel" style={{ marginTop: "0.8rem" }}>
              <div className="panel-header-actions">
                <h2>Notification Bar</h2>
                <button type="button" className="tiny-btn" onClick={clearBookNotifications}>
                  Clear
                </button>
              </div>
              <ul className="ticket-images">
                {bookNotifications.slice(0, 5).map((notice) => (
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

          {showNotifications && (
            <article className="glass-panel" style={{ marginTop: "0.8rem" }}>
              <div className="panel-header-actions">
                <h2>Book Notifications</h2>
                <button type="button" className="tiny-btn" onClick={clearBookNotifications}>
                  Clear
                </button>
              </div>
              {bookNotifications.length === 0 ? (
                <p className="empty">No notifications yet.</p>
              ) : (
                <ul className="ticket-images">
                  {bookNotifications.map((notice) => (
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

        <div className="book-room-container">
          <form className="glass-panel" onSubmit={handleSubmitBooking}>
            <h2>Create Booking Request</h2>
            <div className="room-field-grid">
              <label>
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
              <label>
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
              <label>
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
              <label>
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
              <label>
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
              <label>
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
              <label className="description-field">
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
            <button type="submit" disabled={bookingLoading}>
              {bookingLoading ? "Submitting..." : "Submit Booking Request"}
            </button>
          </form>

          <div className="book-room-selectors">
            <div className="selector-group">
              <label>Select Building</label>
              <select
                value={bookRoomSelectedBuildingId || ""}
                onChange={(event) => {
                  setBookRoomSelectedBuildingId(event.target.value);
                  setBookRoomSelectedFloorId(null);
                }}
              >
                <option value="">-- Choose a Building --</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name} (No {building.buildingNo})
                  </option>
                ))}
              </select>
            </div>

            {bookRoomSelectedBuilding && (
              <div className="selector-group">
                <label>Select Floor</label>
                <select
                  value={bookRoomSelectedFloorId || ""}
                  onChange={(event) => setBookRoomSelectedFloorId(event.target.value)}
                >
                  <option value="">-- Choose a Floor --</option>
                  {bookRoomFloors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {bookRoomSelectedFloor && (
            <div className="glass-panel book-room-panel">
              <h2>
                {bookRoomSelectedBuilding.name} - {bookRoomSelectedFloor.label}
              </h2>
              {bookRoomRooms.length === 0 ? (
                <p className="empty">No rooms on this floor.</p>
              ) : (
                <div className="table-wrap">
                  <table className="compact-table">
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
                                className="tiny-btn"
                                onClick={() => handleBookRoomSelect(room)}
                              >
                                Book Now
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
            <article className="glass-panel" id="my-booking-status">
              <div className="panel-header-actions">
                <h2>My Booking Status</h2>
                <div className="table-actions">
                  <button type="button" className="tiny-btn" onClick={handleViewBookingStatus}>
                    Refresh
                  </button>
                  <button
                    type="button"
                    className="tiny-btn"
                    onClick={() => setShowBookingStatus(false)}
                  >
                    Hide
                  </button>
                </div>
              </div>
              <div className="table-actions" style={{ marginBottom: "0.75rem" }}>
                {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`tiny-btn ${statusFilter === status ? "hero-back" : ""}`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <p className="empty">No bookings found for this user.</p>
              ) : (
                <div className="table-wrap">
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Building</th>
                        <th>Floor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Expected Attendees</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Details</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => {
                        const room = roomLookup.get(String(booking.resourceId));
                        const detailsText =
                          booking.status === "CANCELLED"
                            ? booking.cancellationReason || "-"
                            : booking.adminReason || "-";
                        return (
                          <tr key={booking.id}>
                            <td>{booking.id}</td>
                            <td>{booking.buildingName || room?.buildingName || "-"}</td>
                            <td>{booking.floorLabel || room?.floorLabel || "-"}</td>
                            <td>{booking.date}</td>
                            <td>
                              {booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}
                            </td>
                            <td>{booking.expectedAttendees ?? "-"}</td>
                            <td>{booking.purpose}</td>
                            <td>{booking.status}</td>
                            <td>{detailsText}</td>
                            <td>
                              <button
                                type="button"
                                className="tiny-btn danger"
                                onClick={() => handleCancelMyBooking(booking)}
                                disabled={booking.status !== "APPROVED"}
                              >
                                Cancel
                              </button>
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

          {errorMessage && <p className="message error">{errorMessage}</p>}
          {successMessage && <p className="message success">{successMessage}</p>}
        </div>
      </div>
    </main>
  );
}
