export default function A_BookRoomView({
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
  setSuccessMessage,
  errorMessage,
  successMessage,
}) {
  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap">
        <header className="hero-banner portal-hero">
          <div className="hero-head-row">
            <span className="hero-tag">Smart Campus Access</span>
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
          <h1>Book Room</h1>
          <p>Select a building and floor to view and book available rooms.</p>
        </header>

        <div className="book-room-container">
          <div className="book-room-selectors">
            <div className="selector-group">
              <label>Select Building</label>
              <select
                value={bookRoomSelectedBuildingId || ""}
                onChange={(e) => {
                  setBookRoomSelectedBuildingId(e.target.value);
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
                  onChange={(e) => setBookRoomSelectedFloorId(e.target.value)}
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
                                onClick={() => {
                                  if (room.status !== "ACTIVE") {
                                    setErrorMessage(
                                      `Room ${room.name} is not available for booking.`
                                    );
                                    return;
                                  }
                                  setSuccessMessage(
                                    `Booking request sent for ${room.name}.`
                                  );
                                }}
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

          {errorMessage && <p className="message error">{errorMessage}</p>}
          {successMessage && <p className="message success">{successMessage}</p>}
        </div>
      </div>
    </main>
  );
}
