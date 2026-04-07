import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  addFloor,
  createBuilding,
  createRoom,
  deleteBuilding as deleteBuildingApi,
  deleteFloor as deleteFloorApi,
  deleteRoom as deleteRoomApi,
  fetchBuildings,
  fetchRooms,
  updateBuilding as updateBuildingApi,
  updateFloor as updateFloorApi,
  updateRoom as updateRoomApi,
} from "./api/campusApi";

const roomTypes = [
  "LAB",
  "CLASSROOM",
  "AUDITORIUM",
  "MEETING_ROOM",
  "OFFICE",
  "OTHER",
];

const roomStatuses = ["ACTIVE", "INACTIVE", "MAINTENANCE"];
const dashboardActions = [
  {
    id: "manage-buildings",
    title: "Add New Building and Floor",
    subtitle: "Open building and floor forms",
    accent: "terracotta",
  },
  {
    id: "book-room",
    title: "Book Room",
    subtitle: "Open room creation form",
    accent: "teal",
  },
  {
    id: "building-map",
    title: "Building and Floor Map",
    subtitle: "Show campus map list",
    accent: "sky",
  },
  {
    id: "rooms-status",
    title: "Rooms Status",
    subtitle: "Show room status dashboard",
    accent: "leaf",
  },
];

const portalActions = [
  {
    id: "book",
    title: "Book",
    subtitle: "Open room booking form",
    accent: "teal",
  },
  {
    id: "ticket",
    title: "Ticket",
    subtitle: "Open ticket and room status",
    accent: "sky",
  },
  {
    id: "admin",
    title: "Admin",
    subtitle: "Open admin management page",
    accent: "terracotta",
  },
  {
    id: "login",
    title: "Login",
    subtitle: "Open staff login panel",
    accent: "leaf",
  },
];

function App() {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [currentDashboard, setCurrentDashboard] = useState("portal");
  const [blankPageTitle, setBlankPageTitle] = useState("");
  const [activeSection, setActiveSection] = useState("manage-buildings");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [buildingForm, setBuildingForm] = useState({
    buildingNo: "",
    name: "",
    floorCount: 1,
  });

  const [floorForm, setFloorForm] = useState({
    buildingId: "",
    floorNumber: "",
    label: "",
  });

  const [roomForm, setRoomForm] = useState({
    buildingId: "",
    floorId: "",
    name: "",
    type: "LAB",
    capacity: 40,
    location: "Block",
    availabilityStart: "08:00",
    availabilityEnd: "18:00",
    status: "ACTIVE",
    description: "",
  });

  // State for the Book Room Dashboard (from portal)
  const [bookRoomSelectedBuildingId, setBookRoomSelectedBuildingId] = useState(null);
  const [bookRoomSelectedFloorId, setBookRoomSelectedFloorId] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const selectedRoomBuilding = useMemo(
    () => buildings.find((building) => String(building.id) === roomForm.buildingId),
    [buildings, roomForm.buildingId]
  );

  const selectedBuildingFloors = selectedRoomBuilding?.floors || [];
  const roomStatusCount = useMemo(
    () =>
      roomStatuses.reduce(
        (accumulator, status) => ({
          ...accumulator,
          [status]: rooms.filter((room) => room.status === status).length,
        }),
        {}
      ),
    [rooms]
  );

  const totalFloors = useMemo(
    () =>
      buildings.reduce((count, building) => count + (building.floors?.length || 0), 0),
    [buildings]
  );

  const totalCapacity = useMemo(
    () => rooms.reduce((count, room) => count + (room.capacity || 0), 0),
    [rooms]
  );

  const activeCapacity = useMemo(
    () =>
      rooms
        .filter((room) => room.status === "ACTIVE")
        .reduce((count, room) => count + (room.capacity || 0), 0),
    [rooms]
  );

  const maintenanceCapacity = useMemo(
    () =>
      rooms
        .filter((room) => room.status === "MAINTENANCE")
        .reduce((count, room) => count + (room.capacity || 0), 0),
    [rooms]
  );

  const selectedMapBuilding = useMemo(
    () =>
      buildings.find((building) => String(building.id) === String(selectedBuildingId)) ||
      null,
    [buildings, selectedBuildingId]
  );

  const selectedBuildingRooms = useMemo(
    () =>
      selectedMapBuilding
        ? rooms.filter((room) => room.buildingId === selectedMapBuilding.id)
        : [],
    [rooms, selectedMapBuilding]
  );

  const selectedBuildingStats = useMemo(() => {
    const roomCount = selectedBuildingRooms.length;      
    return {
      roomCount,
      activeCount: selectedBuildingRooms.filter((room) => room.status === "ACTIVE").length,
      inactiveCount: selectedBuildingRooms.filter((room) => room.status === "INACTIVE")
        .length,
      maintenanceCount: selectedBuildingRooms.filter(
        (room) => room.status === "MAINTENANCE"
      ).length,
      totalCapacity: selectedBuildingRooms.reduce(
        (count, room) => count + (room.capacity || 0),
        0
      ),
    };
  }, [selectedBuildingRooms]);

  const selectedFloorInsights = useMemo(() => {
    if (!selectedMapBuilding) {
      return [];
    }

    return selectedMapBuilding.floors
      .map((floor) => {
        const floorRooms = selectedBuildingRooms.filter(
          (room) => room.floorId === floor.id
        );
        return {
          ...floor,
          rooms: floorRooms,
          roomCount: floorRooms.length,
          activeCount: floorRooms.filter((room) => room.status === "ACTIVE").length,
          inactiveCount: floorRooms.filter((room) => room.status === "INACTIVE").length,
          maintenanceCount: floorRooms.filter((room) => room.status === "MAINTENANCE")
            .length,
          capacity: floorRooms.reduce((count, room) => count + (room.capacity || 0), 0),
        };
      })
      .sort((left, right) => left.floorNumber - right.floorNumber);
  }, [selectedMapBuilding, selectedBuildingRooms]);

  // Data for the Book Room Dashboard
  const bookRoomSelectedBuilding = useMemo(
    () => buildings.find((building) => String(building.id) === String(bookRoomSelectedBuildingId)),
    [buildings, bookRoomSelectedBuildingId]
  );

  const bookRoomFloors = bookRoomSelectedBuilding?.floors || [];
  
  const bookRoomSelectedFloor = useMemo(
    () => bookRoomFloors.find((floor) => String(floor.id) === String(bookRoomSelectedFloorId)),
    [bookRoomFloors, bookRoomSelectedFloorId]
  );

  const bookRoomRooms = useMemo(() => {
    if (!bookRoomSelectedFloor) return [];
    return rooms.filter((room) => room.floorId === bookRoomSelectedFloor.id);
  }, [rooms, bookRoomSelectedFloor]);

  useEffect(() => {
    if (buildings.length === 0) {
      setSelectedBuildingId(null);
      return;
    }

    const stillExists = buildings.some(
      (building) => String(building.id) === String(selectedBuildingId)
    );

    if (!stillExists) {
      setSelectedBuildingId(buildings[0].id);
    }
  }, [buildings, selectedBuildingId]);

  async function loadInitialData() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [buildingData, roomData] = await Promise.all([fetchBuildings(), fetchRooms()]);
      setBuildings(buildingData);
      setRooms(roomData);
      if (buildingData.length > 0) {
        setSelectedBuildingId(buildingData[0].id);
      }

      if (buildingData.length > 0) {
        const firstBuildingId = String(buildingData[0].id);
        setFloorForm((current) => ({
          ...current,
          buildingId: current.buildingId || firstBuildingId,
        }));
        setRoomForm((current) => ({
          ...current,
          buildingId: current.buildingId || firstBuildingId,
        }));
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateBuilding(event) {
    event.preventDefault();
    clearMessages();
    try {
      const newBuilding = await createBuilding({
        buildingNo: buildingForm.buildingNo.trim(),
        name: buildingForm.name.trim(),
        floorCount: Number(buildingForm.floorCount),
      });

      setBuildings((current) =>
        [...current, newBuilding].sort((left, right) =>
          left.buildingNo.localeCompare(right.buildingNo, undefined, { numeric: true })
        )
      );
      setBuildingForm({ buildingNo: "", name: "", floorCount: 1 });
      setSuccessMessage(`Building ${newBuilding.name} added with ${newBuilding.floors.length} floors.`);
      setActiveSection("manage-buildings");

      if (!floorForm.buildingId) {
        setFloorForm((current) => ({ ...current, buildingId: String(newBuilding.id) }));
      }
      if (!roomForm.buildingId) {
        setRoomForm((current) => ({
          ...current,
          buildingId: String(newBuilding.id),
          floorId: "",
        }));
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleAddFloor(event) {
    event.preventDefault();
    clearMessages();
    try {
      const newFloor = await addFloor(Number(floorForm.buildingId), {
        floorNumber: Number(floorForm.floorNumber),
        label: floorForm.label.trim(),
      });

      setBuildings((current) =>
        current.map((building) =>
          String(building.id) === floorForm.buildingId
            ? {
                ...building,
                floors: [...building.floors, newFloor].sort(
                  (a, b) => a.floorNumber - b.floorNumber
                ),
              }
            : building
        )
      );

      setFloorForm((current) => ({
        ...current,
        floorNumber: "",
        label: "",
      }));
      setSuccessMessage(`Floor ${newFloor.label} added.`);
      setActiveSection("manage-buildings");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleCreateRoom(event) {
    event.preventDefault();
    clearMessages();
    try {
      const newRoom = await createRoom({
        buildingId: Number(roomForm.buildingId),
        floorId: Number(roomForm.floorId),
        name: roomForm.name.trim(),
        type: roomForm.type,
        capacity: Number(roomForm.capacity),
        location: roomForm.location.trim(),
        availabilityStart: withSeconds(roomForm.availabilityStart),
        availabilityEnd: withSeconds(roomForm.availabilityEnd),
        status: roomForm.status,
        description: roomForm.description.trim(),
      });

      setRooms((current) => [newRoom, ...current]);
      setRoomForm((current) => ({
        ...current,
        floorId: "",
        name: "",
        description: "",
      }));
      setSuccessMessage(`Room ${newRoom.name} created successfully.`);
      setActiveSection("rooms-status");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function withSeconds(time) {
    return time.length === 5 ? `${time}:00` : time;
  }

  function clearMessages() {
    setErrorMessage("");
    setSuccessMessage("");
  }

  function handlePortalAction(actionId) {
    clearMessages();

    if (actionId === "admin") {
      setCurrentDashboard("admin");
      setActiveSection("manage-buildings");
      return;
    }

    // Handle the "Book" action from portal
    if (actionId === "book") {
      setCurrentDashboard("book");
      // Reset selections when opening the book dashboard
      setBookRoomSelectedBuildingId(null);
      setBookRoomSelectedFloorId(null);
      return;
    }

    const selectedAction = portalActions.find((action) => action.id === actionId);
    setBlankPageTitle(selectedAction?.title || "Page");
    setCurrentDashboard("blank");
  }

  function handleRoomBuildingChange(buildingId) {
    setRoomForm((current) => ({
      ...current,
      buildingId,
      floorId: "",
    }));
  }

  function formatLabel(value) {
    return value
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function getRoomQuickNote(room) {
    if (room.status === "MAINTENANCE") {
      return { text: "Under Maintenance", tone: "maintenance" };
    }

    if (room.status === "INACTIVE") {
      return { text: "Unavailable", tone: "inactive" };
    }

    return { text: "Available To Book", tone: "active" };
  }

  async function handleEditBuilding(building) {
    clearMessages();
    const nextBuildingNo = window.prompt("Building No", building.buildingNo);
    if (nextBuildingNo === null) {
      return;
    }

    const nextName = window.prompt("Building Name", building.name);
    if (nextName === null) {
      return;
    }

    try {
      const updated = await updateBuildingApi(building.id, {
        buildingNo: nextBuildingNo.trim(),
        name: nextName.trim(),
      });

      setBuildings((current) =>
        current
          .map((item) => (item.id === building.id ? updated : item))
          .sort((left, right) =>
            left.buildingNo.localeCompare(right.buildingNo, undefined, { numeric: true })
          )
      );
      setSuccessMessage("Building updated successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteBuilding(building) {
    clearMessages();
    if (
      !window.confirm(
        `Delete ${building.name}? If this building has rooms, delete rooms first.`
      )
    ) {
      return;
    }

    try {
      await deleteBuildingApi(building.id);
      setBuildings((current) => current.filter((item) => item.id !== building.id));
      setRooms((current) => current.filter((room) => room.buildingId !== building.id));
      setSuccessMessage("Building deleted successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleEditFloor(floor) {
    clearMessages();
    const nextFloorNumberValue = window.prompt(
      "Floor Number",
      String(floor.floorNumber)
    );
    if (nextFloorNumberValue === null) {
      return;
    }

    const nextFloorNumber = Number(nextFloorNumberValue);
    if (!Number.isInteger(nextFloorNumber) || nextFloorNumber < 1) {
      setErrorMessage("Floor number must be a positive number.");
      return;
    }

    const nextLabel = window.prompt("Floor Label", floor.label);
    if (nextLabel === null) {
      return;
    }

    try {
      const updatedFloor = await updateFloorApi(floor.id, {
        floorNumber: nextFloorNumber,
        label: nextLabel.trim(),
      });

      setBuildings((current) =>
        current.map((building) => ({
          ...building,
          floors: building.floors
            .map((item) => (item.id === floor.id ? updatedFloor : item))
            .sort((left, right) => left.floorNumber - right.floorNumber),
        }))
      );
      setSuccessMessage("Floor updated successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteFloor(floor) {
    clearMessages();
    if (!window.confirm(`Delete ${floor.label}?`)) {
      return;
    }

    try {
      await deleteFloorApi(floor.id);
      setBuildings((current) =>
        current.map((building) => ({
          ...building,
          floors: building.floors.filter((item) => item.id !== floor.id),
        }))
      );
      setRooms((current) => current.filter((room) => room.floorId !== floor.id));
      setSuccessMessage("Floor deleted successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleEditRoom(room) {
    clearMessages();
    const nextName = window.prompt("Room Name", room.name);
    if (nextName === null) {
      return;
    }

    const nextType = window.prompt(
      `Room Type (${roomTypes.join(", ")})`,
      room.type
    );
    if (nextType === null) {
      return;
    }

    const nextCapacityValue = window.prompt("Capacity", String(room.capacity));
    if (nextCapacityValue === null) {
      return;
    }

    const nextLocation = window.prompt("Location", room.location);
    if (nextLocation === null) {
      return;
    }

    const nextStart = window.prompt(
      "Availability Start (HH:mm)",
      room.availabilityStart.slice(0, 5)
    );
    if (nextStart === null) {
      return;
    }

    const nextEnd = window.prompt(
      "Availability End (HH:mm)",
      room.availabilityEnd.slice(0, 5)
    );
    if (nextEnd === null) {
      return;
    }

    const nextStatus = window.prompt(
      `Status (${roomStatuses.join(", ")})`,
      room.status
    );
    if (nextStatus === null) {
      return;
    }

    const nextDescription = window.prompt("Description", room.description);
    if (nextDescription === null) {
      return;
    }

    const nextBuildingIdValue = window.prompt(
      "Building ID",
      String(room.buildingId)
    );
    if (nextBuildingIdValue === null) {
      return;
    }

    const nextFloorIdValue = window.prompt("Floor ID", String(room.floorId));
    if (nextFloorIdValue === null) {
      return;
    }

    const nextCapacity = Number(nextCapacityValue);
    const nextBuildingId = Number(nextBuildingIdValue);
    const nextFloorId = Number(nextFloorIdValue);

    if (!Number.isInteger(nextCapacity) || nextCapacity < 1) {
      setErrorMessage("Capacity must be a positive number.");
      return;
    }

    if (!Number.isInteger(nextBuildingId) || !Number.isInteger(nextFloorId)) {
      setErrorMessage("Building ID and Floor ID must be numeric.");
      return;
    }

    try {
      const updatedRoom = await updateRoomApi(room.id, {
        buildingId: nextBuildingId,
        floorId: nextFloorId,
        name: nextName.trim(),
        type: nextType.trim(),
        capacity: nextCapacity,
        location: nextLocation.trim(),
        availabilityStart: withSeconds(nextStart.trim()),
        availabilityEnd: withSeconds(nextEnd.trim()),
        status: nextStatus.trim(),
        description: nextDescription.trim(),
      });

      setRooms((current) =>
        current.map((item) => (item.id === room.id ? updatedRoom : item))
      );
      setSuccessMessage("Room updated successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteRoom(room) {
    clearMessages();
    if (!window.confirm(`Delete room ${room.name}?`)) {
      return;
    }

    try {
      await deleteRoomApi(room.id);
      setRooms((current) => current.filter((item) => item.id !== room.id));
      setSuccessMessage("Room deleted successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (currentDashboard === "portal") {
    return (
      <main className="dashboard-shell">
        <div className="abstract-bg" />
        <div className="dashboard-wrap">
          <header className="hero-banner portal-hero">
            <span className="hero-tag">Smart Campus Access</span>
            <h1>Smart Campus Portal</h1>
            <p>
              Choose an action to continue. Use Admin to open your created admin page,
              or jump directly to booking and ticket sections.
            </p>
          </header>

          <section className="action-grid portal-grid">
            {portalActions.map((action) => (
              <button
                key={action.id}
                type="button"
                className={`action-button ${action.accent}`}
                onClick={() => handlePortalAction(action.id)}
              >
                <span>{action.title}</span>
                <small>{action.subtitle}</small>
              </button>
            ))}
          </section>

          {successMessage && <p className="message success">{successMessage}</p>}
        </div>
      </main>
    );
  }

  // New Book Room Dashboard
  if (currentDashboard === "book") {
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
                <h2>{bookRoomSelectedBuilding.name} - {bookRoomSelectedFloor.label}</h2>
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
                                      setErrorMessage(`Room ${room.name} is not available for booking.`);
                                      return;
                                    }
                                    setSuccessMessage(`Booking request sent for ${room.name}.`);
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

  if (currentDashboard === "blank") {
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
            <h1>{blankPageTitle} Page</h1>
            <p>This page is intentionally blank.</p>
          </header>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <div className="abstract-bg" />
      <div className="dashboard-wrap">
        <header className="hero-banner">
          <div className="hero-head-row">
            <span className="hero-tag">Smart Campus Control Center</span>
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
          <h1>Campus Command Dashboard</h1>
          <p>
            Use action buttons to open Add Building and Add Floor forms, Book Room form,
            Building and Floor Map, and Rooms Status.
          </p>
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
              className={`action-button ${action.accent} ${
                activeSection === action.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(action.id)}
            >
              <span>{action.title}</span>
              <small>{action.subtitle}</small>
            </button>
          ))}
        </section>

        {isLoading && <p className="loading-text">Loading campus data...</p>}
        {errorMessage && <p className="message error">{errorMessage}</p>}
        {successMessage && <p className="message success">{successMessage}</p>}

        {!isLoading && (
          <section className="workspace">
            {activeSection === "manage-buildings" && (
              <div className="workspace-grid two-up">
                <form className="glass-panel" onSubmit={handleCreateBuilding}>
                  <h2>Add Building</h2>
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
                  <button type="submit">Create Building</button>
                </form>

                <form className="glass-panel" onSubmit={handleAddFloor}>
                  <h2>Add Floor</h2>
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
                    Add Floor
                  </button>
                </form>
              </div>
            )}

            {activeSection === "book-room" && (
              <form className="glass-panel" onSubmit={handleCreateRoom}>
                <h2>Create Room</h2>
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
                <button type="submit">Create Room</button>
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
                          className={`map-card ${
                            String(selectedBuildingId) === String(building.id)
                              ? "selected"
                              : ""
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
                                              <span
                                                className={`status-pill ${room.status.toLowerCase()}`}
                                              >
                                                {formatLabel(room.status)}
                                              </span>
                                            </td>
                                            <td>
                                              <span
                                                className={`quick-note ${note.tone}`}
                                              >
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
                              <span
                                className={`status-pill ${room.status.toLowerCase()}`}
                              >
                                {formatLabel(room.status)}
                              </span>
                            </td>
                            <td>
                              {(() => {
                                const note = getRoomQuickNote(room);
                                return (
                                  <span className={`quick-note ${note.tone}`}>
                                    {note.text}
                                  </span>
                                );
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
          </section>
        )}
      </div>
    </main>
  );
}

export default App;