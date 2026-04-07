import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  dashboardActions,
  portalActions,
  roomStatuses,
  roomTypes,
} from "./A_constants";
import { formatLabel, getRoomQuickNote, withSeconds } from "./A_helpers";
import APortalView from "./A_PortalView";
import ABookRoomView from "./A_BookRoomView";
import ABlankView from "./A_BlankView";
import {
  addFloor,
  createBuilding,
  createRoom,
  createTicket,
  deleteTicket as deleteTicketApi,
  deleteBuilding as deleteBuildingApi,
  deleteFloor as deleteFloorApi,
  deleteRoom as deleteRoomApi,
  fetchBuildings,
  fetchRooms,
  fetchTickets,
  updateTicket as updateTicketApi,
  updateBuilding as updateBuildingApi,
  updateFloor as updateFloorApi,
  updateRoom as updateRoomApi,
} from "./api/campusApi";

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
const MAX_TICKET_IMAGE_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_TICKET_IMAGE_REQUEST_BYTES = 50 * 1024 * 1024;
const ticketBuildingOptions = [
  { value: "1", label: "Main Building", floorCount: 9 },
  { value: "2", label: "New Building", floorCount: 14 },
];

function getCurrentDateTimeValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function getEmptyTicketForm() {
  return {
    title: "",
    description: "",
    category: "EQUIPMENT",
    priority: "MEDIUM",
    status: "OPEN",
    resourceId: "",
    userId: "",
    assignedTechnicianId: "",
    images: [],
    createdDate: getCurrentDateTimeValue(),
  };
}

function App() {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tickets, setTickets] = useState([]);
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
  const [ticketForm, setTicketForm] = useState(() => getEmptyTicketForm());
  const [editingTicketId, setEditingTicketId] = useState(null);

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

  const selectedTicketBuilding = useMemo(
    () =>
      ticketBuildingOptions.find(
        (building) => building.value === String(ticketForm.resourceId)
      ) || null,
    [ticketForm.resourceId]
  );

  const ticketFloorOptions = useMemo(() => {
    if (!selectedTicketBuilding) {
      return [];
    }

    return Array.from(
      { length: selectedTicketBuilding.floorCount },
      (_, index) => String(index + 1)
    );
  }, [selectedTicketBuilding]);

  const myTicketHistory = tickets;

  const myTicketStatusCount = useMemo(
    () =>
      ticketStatuses.reduce(
        (accumulator, status) => ({
          ...accumulator,
          [status]: myTicketHistory.filter((ticket) => ticket.status === status).length,
        }),
        {}
      ),
    [myTicketHistory]
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

  const bookRoomFloors = useMemo(
    () => bookRoomSelectedBuilding?.floors || [],
    [bookRoomSelectedBuilding]
  );
  
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
      const [buildingData, roomData, ticketData] = await Promise.all([
        fetchBuildings(),
        fetchRooms(),
        fetchTickets(),
      ]);
      setBuildings(buildingData);
      setRooms(roomData);
      setTickets(ticketData);
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

  async function handleCreateTicket(event) {
    event.preventDefault();
    clearMessages();

    try {
      if (editingTicketId) {
        const updatedTicket = await updateTicketApi(
          editingTicketId,
          buildTicketUpdatePayload(ticketForm)
        );

        setTickets((current) =>
          current.map((ticket) => (ticket.id === editingTicketId ? updatedTicket : ticket))
        );
        setEditingTicketId(null);
        setTicketForm(getEmptyTicketForm());
        setCurrentDashboard("ticket-history");
        setSuccessMessage(`Ticket "${updatedTicket.title}" updated successfully.`);
        return;
      }

      validateTicketImages(ticketForm.images);
      const newTicket = await createTicket(buildTicketFormData(ticketForm));

      setTickets((current) => [newTicket, ...current]);
      setTicketForm(getEmptyTicketForm());
      setSuccessMessage(`Ticket "${newTicket.title}" created successfully.`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function withDateTimeSeconds(value) {
    return value.length === 16 ? `${value}:00` : value;
  }

  function buildTicketFormData(form) {
    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("description", form.description.trim());
    payload.append("category", form.category);
    payload.append("priority", form.priority);
    payload.append("status", form.status);
    payload.append("resourceId", String(Number(form.resourceId)));
    payload.append("userId", String(Number(form.userId)));
    if (form.assignedTechnicianId) {
      payload.append("assignedTechnicianId", form.assignedTechnicianId.trim());
    }
    payload.append("createdDate", withDateTimeSeconds(form.createdDate));
    Array.from(form.images || []).forEach((image) => {
      payload.append("images", image);
    });
    return payload;
  }

  function buildTicketUpdatePayload(form) {
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      status: form.status,
      resourceId: Number(form.resourceId),
      userId: Number(form.userId),
      assignedTechnicianId: form.assignedTechnicianId.trim() || null,
      createdDate: withDateTimeSeconds(form.createdDate),
    };
  }

  function validateTicketImages(images) {
    const files = Array.from(images || []);
    const oversizedFile = files.find((file) => file.size > MAX_TICKET_IMAGE_SIZE_BYTES);
    if (oversizedFile) {
      throw new Error(
        `${oversizedFile.name} is too large. Each image must be 25MB or smaller.`
      );
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TICKET_IMAGE_REQUEST_BYTES) {
      throw new Error("Total image upload is too large. Select files under 50MB in total.");
    }
  }

  function clearMessages() {
    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleStartTicketEdit(ticket) {
    clearMessages();
    setEditingTicketId(ticket.id);
    setTicketForm({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      resourceId: String(ticket.resourceId),
      userId: String(ticket.userId),
      assignedTechnicianId: ticket.assignedTechnicianId || "",
      images: [],
      createdDate: ticket.createdDate.slice(0, 16),
    });
    setCurrentDashboard("ticket");
  }

  function handleCancelTicketEdit() {
    clearMessages();
    setEditingTicketId(null);
    setTicketForm(getEmptyTicketForm());
  }

  async function handleDeleteTicket(ticketId) {
    clearMessages();
    if (!window.confirm("Delete this ticket?")) {
      return;
    }

    try {
      await deleteTicketApi(ticketId);
      setTickets((current) => current.filter((ticket) => ticket.id !== ticketId));
      if (editingTicketId === ticketId) {
        setEditingTicketId(null);
        setTicketForm(getEmptyTicketForm());
      }
      setSuccessMessage("Ticket deleted successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handlePortalAction(actionId) {
    clearMessages();

    if (actionId === "admin") {
      setCurrentDashboard("admin");
      setActiveSection("manage-buildings");
      return;
    }

    if (actionId === "book") {
      setCurrentDashboard("book");
      setBookRoomSelectedBuildingId(null);
      setBookRoomSelectedFloorId(null);
      return;
    }

    if (actionId === "ticket") {
      setCurrentDashboard("ticket");
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

  function getTicketStatusTone(status) {
    if (status === "OPEN") {
      return "open";
    }

    if (status === "IN_PROGRESS") {
      return "progress";
    }

    if (status === "RESOLVED") {
      return "resolved";
    }

    return "closed";
  }

  function getTicketBuildingLabel(resourceId) {
    const matchedBuilding = ticketBuildingOptions.find(
      (building) => building.value === String(resourceId)
    );

    return matchedBuilding ? matchedBuilding.label : `Building ${resourceId}`;
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
      <APortalView
        portalActions={portalActions}
        handlePortalAction={handlePortalAction}
        successMessage={successMessage}
      />
    );
  }

  // New Book Room Dashboard
  if (currentDashboard === "book") {
    return (
      <ABookRoomView
        clearMessages={clearMessages}
        setCurrentDashboard={setCurrentDashboard}
        buildings={buildings}
        bookRoomSelectedBuildingId={bookRoomSelectedBuildingId}
        setBookRoomSelectedBuildingId={setBookRoomSelectedBuildingId}
        setBookRoomSelectedFloorId={setBookRoomSelectedFloorId}
        bookRoomSelectedBuilding={bookRoomSelectedBuilding}
        bookRoomSelectedFloorId={bookRoomSelectedFloorId}
        bookRoomFloors={bookRoomFloors}
        bookRoomSelectedFloor={bookRoomSelectedFloor}
        bookRoomRooms={bookRoomRooms}
        getRoomQuickNote={getRoomQuickNote}
        formatLabel={formatLabel}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    );
  }

  if (currentDashboard === "blank") {
    return (
      <ABlankView
        blankPageTitle={blankPageTitle}
        clearMessages={clearMessages}
        setCurrentDashboard={setCurrentDashboard}
      />
    );
  }

  if (currentDashboard === "ticket-history") {
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
                  setCurrentDashboard("ticket");
                }}
              >
                Back To Ticket Page
              </button>
            </div>
            <h1>My Ticket History</h1>
            <p>View, update, or delete your ticket history from this page.</p>
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
                          Hall/Lab{" "}
                          {ticket.assignedTechnicianId
                            ? ticket.assignedTechnicianId
                            : "Not Provided"}
                        </span>
                        <span>{ticket.createdDate.replace("T", " ")}</span>
                      </div>
                      <div className="ticket-card-actions">
                        <button
                          type="button"
                          className="tiny-btn"
                          onClick={() => handleStartTicketEdit(ticket)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="tiny-btn danger"
                          onClick={() => handleDeleteTicket(ticket.id)}
                        >
                          Delete
                        </button>
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

  if (currentDashboard === "ticket") {
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
            <h1>Ticket Page</h1>
            <p>
              Submit a campus support ticket with issue details, priority, related
              resource, technician assignment, and image references.
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
            <div className="workspace-grid two-up">
              <form className="glass-panel" onSubmit={handleCreateTicket}>
                <div className="panel-header-actions">
                  <h2>{editingTicketId ? "Update Ticket" : "Create Ticket"}</h2>
                  <button
                    type="button"
                    className="tiny-btn"
                    onClick={() => {
                      clearMessages();
                      setCurrentDashboard("ticket-history");
                    }}
                  >
                    My Ticket History
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
                    <small className="field-hint">
                      Enter the hall or lab number manually.
                    </small>
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
                <div className="ticket-form-actions">
                  <button type="submit">
                    {editingTicketId ? "Update Ticket" : "Submit Ticket"}
                  </button>
                  {editingTicketId && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={handleCancelTicketEdit}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
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
