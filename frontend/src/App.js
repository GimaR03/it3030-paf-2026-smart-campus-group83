import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import "./App.css";
import {
  dashboardActions,
  portalActions,
  roomStatuses,
  roomTypes,
  ticketCategories,
  ticketPriorities,
  ticketStatuses,
  MAX_TICKET_IMAGE_SIZE_BYTES,
  MAX_TICKET_IMAGE_REQUEST_BYTES,
  ticketBuildingOptions,
} from "./A_constants";
import { 
  formatLabel, 
  getRoomQuickNote, 
  withSeconds,
  formatFileSize,
  getCurrentDateTimeValue,
  getTicketStatusTone,
  getTicketBuildingLabel
} from "./A_helpers";
import APortalView from "./A_PortalView";
import ABookRoomView from "./B_BookRoomView";
import ABlankView from "./A_BlankView";
import ALoginView from "./L_LoginView";
import ARegisterView from "./A_RegisterView";
import AMaintenanceView from "./M_MaintenanceView";
import AAdminDashboardView from "./A_AdminDashboardView";
import ATicketFormView from "./ATicketFormView";
import ATicketHistoryView from "./ATicketHistoryView";
import {
  addFloor,
  approveBooking,
  cancelBooking,
  createBuilding,
  createBookingRequest,
  createRoom,
  createTicket,
  deleteTicket as deleteTicketApi,
  deleteBuilding as deleteBuildingApi,
  deleteFloor as deleteFloorApi,
  deleteRoom as deleteRoomApi,
  fetchAllBookingsForAdmin,
  fetchBuildings,
  fetchMyBookings,
  fetchRooms,
  fetchTickets,
  loginUser,
  rejectBooking,
  registerUser,
  updateTicket as updateTicketApi,
  updateBuilding as updateBuildingApi,
  updateFloor as updateFloorApi,
  updateRoom as updateRoomApi,
} from "./api/campusApi";

const NOTIFICATION_STORAGE_KEY = "smartCampusSystemNotifications";


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

function getEmptyRegisterForm() {
  return {
    fullName: "",
    email: "",
    phoneNumber: "",
    idNumber: "",
    dateOfBirth: "",
    affiliation: "",
    department: "",
    password: "",
    confirmPassword: "",
  };
}

function parseRequiredPositiveInt(value, fieldLabel) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${fieldLabel} must be a valid positive number.`);
  }
  return parsed;
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
  const [editingBuildingId, setEditingBuildingId] = useState(null);

  const [floorForm, setFloorForm] = useState({
    buildingId: "",
    floorNumber: "",
    label: "",
  });
  const [editingFloorId, setEditingFloorId] = useState(null);

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
  const [editingRoomId, setEditingRoomId] = useState(null);

  // State for the Book Room Dashboard (from portal)
  const [bookRoomSelectedBuildingId, setBookRoomSelectedBuildingId] = useState(null);
  const [bookRoomSelectedFloorId, setBookRoomSelectedFloorId] = useState(null);
  const [ticketForm, setTicketForm] = useState(() => getEmptyTicketForm());
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [latestSubmittedTicket, setLatestSubmittedTicket] = useState(null);
  const [bookingUserId, setBookingUserId] = useState("1");
  const [bookingForm, setBookingForm] = useState({
    resourceId: "",
    date: getCurrentDateTimeValue().slice(0, 10),
    startTime: "09:00",
    endTime: "10:00",
    purpose: "",
    expectedAttendees: "10",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingStatus, setShowBookingStatus] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [adminBookingFilters, setAdminBookingFilters] = useState({
    resourceId: "",
    date: "",
    status: "",
    requestedByUserId: "",
  });
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminBookingsLoading, setAdminBookingsLoading] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState(() => getEmptyRegisterForm());
  const [systemNotifications, setSystemNotifications] = useState(() => {
    try {
      const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  });
  const [showAdminNotifications, setShowAdminNotifications] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(systemNotifications)
    );
  }, [systemNotifications]);

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
  const selectedTicketImages = useMemo(() => Array.from(ticketForm.images || []), [ticketForm.images]);
  const selectedTicketImageTotal = useMemo(
    () => selectedTicketImages.reduce((sum, file) => sum + file.size, 0),
    [selectedTicketImages]
  );
  const ticketLocationSummary = useMemo(() => {
    if (!selectedTicketBuilding) {
      return "Choose a building to continue";
    }

    if (!ticketForm.userId) {
      return `${selectedTicketBuilding.label} selected`;
    }

    const roomLabel = ticketForm.assignedTechnicianId?.trim();
    return `${selectedTicketBuilding.label}, Floor ${ticketForm.userId}${
      roomLabel ? `, ${roomLabel}` : ""
    }`;
  }, [
    selectedTicketBuilding,
    ticketForm.assignedTechnicianId,
    ticketForm.userId,
  ]);

  const bookNotifications = useMemo(
    () => systemNotifications.filter((item) => item.target === "BOOK"),
    [systemNotifications]
  );

  const adminNotifications = useMemo(
    () => systemNotifications.filter((item) => item.target === "ADMIN"),
    [systemNotifications]
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
      const isEditing = editingBuildingId !== null;
      const payload = {
        buildingNo: buildingForm.buildingNo.trim(),
        name: buildingForm.name.trim(),
        floorCount: Number(buildingForm.floorCount),
      };

      const savedBuilding = isEditing
        ? await updateBuildingApi(editingBuildingId, payload)
        : await createBuilding(payload);

      setBuildings((current) =>
        isEditing
          ? current
              .map((item) => (item.id === editingBuildingId ? savedBuilding : item))
              .sort((left, right) =>
                left.buildingNo.localeCompare(right.buildingNo, undefined, { numeric: true })
              )
          : [...current, savedBuilding].sort((left, right) =>
              left.buildingNo.localeCompare(right.buildingNo, undefined, { numeric: true })
            )
      );
      setBuildingForm({ buildingNo: "", name: "", floorCount: 1 });
      setEditingBuildingId(null);
      setSuccessMessage(
        isEditing
          ? `Building ${savedBuilding.name} updated successfully.`
          : `Building ${savedBuilding.name} added with ${savedBuilding.floors.length} floors.`
      );
      setActiveSection("manage-buildings");
      setEditingBuildingId(null);

      if (!floorForm.buildingId) {
        setFloorForm((current) => ({ ...current, buildingId: String(savedBuilding.id) }));
      }
      if (!roomForm.buildingId) {
        setRoomForm((current) => ({
          ...current,
          buildingId: String(savedBuilding.id),
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
      const isEditing = editingFloorId !== null;
      const payload = {
        floorNumber: Number(floorForm.floorNumber),
        label: floorForm.label.trim(),
      };

      const savedFloor = isEditing
        ? await updateFloorApi(editingFloorId, payload)
        : await addFloor(Number(floorForm.buildingId), payload);

      const targetBuildingId = isEditing
        ? buildings.find((building) =>
            building.floors.some((item) => item.id === editingFloorId)
          )?.id || Number(floorForm.buildingId)
        : Number(floorForm.buildingId);

      setBuildings((current) =>
        current.map((building) =>
          String(building.id) === String(targetBuildingId)
            ? {
                ...building,
                floors: isEditing
                  ? building.floors
                      .map((item) => (item.id === editingFloorId ? savedFloor : item))
                      .sort((a, b) => a.floorNumber - b.floorNumber)
                  : [...building.floors, savedFloor].sort((a, b) => a.floorNumber - b.floorNumber),
            }
            : building
        )
      );

      setFloorForm((current) => ({
        ...current,
        floorNumber: "",
        label: "",
      }));
      setEditingFloorId(null);
      setSuccessMessage(isEditing ? `Floor ${savedFloor.label} updated successfully.` : `Floor ${savedFloor.label} added.`);
      setActiveSection("manage-buildings");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleCreateRoom(event) {
    event.preventDefault();
    clearMessages();
    try {
      const isEditing = editingRoomId !== null;
      const payload = {
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
      };

      const savedRoom = isEditing
        ? await updateRoomApi(editingRoomId, payload)
        : await createRoom(payload);

      if (isEditing) {
        setRooms((current) =>
          current.map((item) => (item.id === editingRoomId ? savedRoom : item))
        );
        setEditingRoomId(null);
        setSuccessMessage(`Room ${savedRoom.name} updated successfully.`);
      } else {
        setRooms((current) => [savedRoom, ...current]);
        setSuccessMessage(`Room ${savedRoom.name} created successfully.`);
      }
      setRoomForm((current) => ({
        ...current,
        floorId: "",
        name: "",
        description: "",
      }));
      setActiveSection("rooms-status");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleCancelBuildingEdit() {
    clearMessages();
    setEditingBuildingId(null);
    setBuildingForm({ buildingNo: "", name: "", floorCount: 1 });
  }

  function handleCancelFloorEdit() {
    clearMessages();
    setEditingFloorId(null);
    setFloorForm({ buildingId: "", floorNumber: "", label: "" });
  }

  function handleCancelRoomEdit() {
    clearMessages();
    setEditingRoomId(null);
    setRoomForm({
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
      setLatestSubmittedTicket(newTicket);
      setSuccessMessage(`Ticket "${newTicket.title}" created successfully.`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function withDateTimeSeconds(value) {
    return value.length === 16 ? `${value}:00` : value;
  }

  function buildTicketFormData(form) {
    const resourceId = parseRequiredPositiveInt(form.resourceId, "Building");
    const userId = parseRequiredPositiveInt(form.userId, "Floor Number");
    const assignedTechnicianId = String(form.assignedTechnicianId ?? "").trim();

    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("description", form.description.trim());
    payload.append("category", form.category);
    payload.append("priority", form.priority);
    payload.append("status", form.status);
    payload.append("resourceId", String(resourceId));
    payload.append("userId", String(userId));
    if (assignedTechnicianId) {
      payload.append("assignedTechnicianId", assignedTechnicianId);
    }
    payload.append("createdDate", withDateTimeSeconds(form.createdDate));
    Array.from(form.images || []).forEach((image) => {
      payload.append("images", image);
    });
    return payload;
  }

  function buildTicketUpdatePayload(form) {
    const resourceId = parseRequiredPositiveInt(form.resourceId, "Building");
    const userId = parseRequiredPositiveInt(form.userId, "Floor Number");
    const assignedTechnicianId = String(form.assignedTechnicianId ?? "").trim();

    return {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      status: form.status,
      resourceId,
      userId,
      assignedTechnicianId: assignedTechnicianId || null,
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
      assignedTechnicianId: String(ticket.assignedTechnicianId ?? ""),
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
      if (latestSubmittedTicket?.id === ticketId) {
        setLatestSubmittedTicket(null);
      }
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
      setActiveSection("view-book-status");
      loadAdminBookings();
      return;
    }

    if (actionId === "book") {
      setCurrentDashboard("book");
      setBookRoomSelectedBuildingId(null);
      setBookRoomSelectedFloorId(null);
      setShowBookingStatus(false);
      loadMyBookings();
      return;
    }

    if (actionId === "ticket") {
      setCurrentDashboard("ticket");
      return;
    }

    if (actionId === "login") {
      setCurrentDashboard("login");
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

  function resolveUserRoleByEmail(email = "") {
    const normalized = String(email).trim().toLowerCase();
    const username = normalized.includes("@")
      ? normalized.slice(0, normalized.indexOf("@"))
      : normalized;

    if (username.includes("maintance") || username.includes("maintenance")) {
      return "MAINTENANCE";
    }

    if (username.includes("admin")) {
      return "ADMIN";
    }

    return "USER";
  }

  function routeUserByRole(user) {
    const effectiveRole =
      user.role === "ADMIN" || user.role === "MAINTENANCE"
        ? user.role
        : resolveUserRoleByEmail(user.email);

    if (effectiveRole === "ADMIN") {
      setCurrentDashboard("admin");
      setActiveSection("view-book-status");
      loadAdminBookings();
      return;
    }

    if (effectiveRole === "MAINTENANCE") {
      setCurrentDashboard("maintenance");
      return;
    }

    setCurrentDashboard("book");
    setBookRoomSelectedBuildingId(null);
    setBookRoomSelectedFloorId(null);
    setShowBookingStatus(false);
    setBookingUserId(String(user.userId || 1));
    loadMyBookings();
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    clearMessages();

    const email = loginForm.email.trim().toLowerCase();
    const password = loginForm.password;

    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    try {
      const found = await loginUser({ email, password });
      setAuthUser(found);
      setSuccessMessage(`Welcome ${found.fullName}.`);
      setLoginForm({ email: "", password: "" });
      routeUserByRole(found);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    clearMessages();

    const fullName = registerForm.fullName.trim();
    const email = registerForm.email.trim().toLowerCase();
    const phoneNumber = registerForm.phoneNumber.trim();
    const idNumber = registerForm.idNumber.trim().toUpperCase();
    const dateOfBirth = registerForm.dateOfBirth;
    const affiliation = registerForm.affiliation.trim();
    const department = registerForm.department.trim();
    const password = registerForm.password;
    const confirmPassword = registerForm.confirmPassword;
    const phonePattern = /^\d{10}$/;
    const idPattern = /^[A-Z0-9]{6,15}$/;
    const sliitEmailPattern = /^[a-zA-Z0-9._%+-]+@my\.sliit\.lk$/;
    const allowedAffiliations = ["Academic Staff", "Administrative Staff"];
    const parsedDob = new Date(dateOfBirth);
    const isDobValid =
      Boolean(dateOfBirth) &&
      !Number.isNaN(parsedDob.getTime()) &&
      dateOfBirth < new Date().toISOString().split("T")[0];

    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !idNumber ||
      !dateOfBirth ||
      !affiliation ||
      !department ||
      !password
    ) {
      setErrorMessage("All register fields are required.");
      return;
    }

    if (!sliitEmailPattern.test(email)) {
      setErrorMessage("Email must be in this format: username@my.sliit.lk");
      return;
    }

    if (!allowedAffiliations.includes(affiliation)) {
      setErrorMessage("Affiliation must be Academic Staff or Administrative Staff.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (!phonePattern.test(phoneNumber)) {
      setErrorMessage("Phone number must contain exactly 10 digits.");
      return;
    }

    if (!idPattern.test(idNumber)) {
      setErrorMessage("ID number must contain 6 to 15 letters or numbers.");
      return;
    }

    if (!isDobValid) {
      setErrorMessage("Enter a valid date of birth in the past.");
      return;
    }

    if (department.length < 2) {
      setErrorMessage("Department must be at least 2 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password and confirm password do not match.");
      return;
    }

    try {
      await registerUser({
        fullName,
        email,
        phoneNumber,
        idNumber,
        dateOfBirth,
        affiliation,
        department,
        password,
      });

      setRegisterForm(getEmptyRegisterForm());
      setLoginForm({ email, password: "" });
      setSuccessMessage("Registration successful. Please login.");
      setCurrentDashboard("login");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleLogout() {
    setAuthUser(null);
    clearMessages();
    setCurrentDashboard("portal");
  }

  async function handleSubmitBooking(event) {
    event.preventDefault();
    clearMessages();

    if (!bookingUserId) {
      setErrorMessage("User ID is required.");
      return;
    }

    try {
      setBookingLoading(true);
      const expectedAttendeesValue = bookingForm.expectedAttendees?.trim();
      const created = await createBookingRequest(
        {
          resourceId: Number(bookingForm.resourceId),
          date: bookingForm.date,
          startTime: withSeconds(bookingForm.startTime),
          endTime: withSeconds(bookingForm.endTime),
          purpose: bookingForm.purpose.trim(),
          expectedAttendees: expectedAttendeesValue ? Number(expectedAttendeesValue) : null,
        },
        { userId: Number(bookingUserId), role: "USER" }
      );

      setSuccessMessage(`Booking request #${created.id} submitted with status ${created.status}.`);
      setBookingForm((current) => ({
        ...current,
        purpose: "",
      }));
      await loadMyBookings();
      setShowBookingStatus(true);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleCancelMyBooking(booking) {
    clearMessages();

    if (!bookingUserId) {
      setErrorMessage("User ID is required.");
      return;
    }

    if (!window.confirm(`Cancel booking #${booking.id}?`)) {
      return;
    }

    try {
      await cancelBooking(booking.id, { userId: Number(bookingUserId), role: "USER" });
      setSuccessMessage(`Booking #${booking.id} cancelled.`);
      await loadMyBookings();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function loadMyBookings() {
    if (!bookingUserId) {
      setMyBookings([]);
      return;
    }

    try {
      const records = await fetchMyBookings({
        userId: Number(bookingUserId),
        role: "USER",
      });
      setMyBookings(records || []);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function loadAdminBookings() {
    try {
      setAdminBookingsLoading(true);
      const records = await fetchAllBookingsForAdmin(
        {
          resourceId: adminBookingFilters.resourceId,
          date: adminBookingFilters.date,
          status: adminBookingFilters.status,
          requestedByUserId: adminBookingFilters.requestedByUserId,
        },
        { role: "ADMIN" }
      );
      setAdminBookings(records || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setAdminBookingsLoading(false);
    }
  }

  async function handleAdminApprove(booking) {
    clearMessages();

    const reason = window.prompt("Approval reason (required)", booking.adminReason || "");
    if (reason === null) {
      return;
    }
    if (!reason.trim()) {
      setErrorMessage("Reason is required to approve a booking.");
      return;
    }

    try {
      await approveBooking(booking.id, reason.trim(), { role: "ADMIN" });
      setSuccessMessage(`Booking #${booking.id} approved.`);
      await loadAdminBookings();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleAdminReject(booking) {
    clearMessages();
    const reason = window.prompt("Rejection reason (required)", booking.adminReason || "");
    if (reason === null) {
      return;
    }
    if (!reason.trim()) {
      setErrorMessage("Reason is required to reject a booking.");
      return;
    }

    try {
      await rejectBooking(booking.id, reason.trim(), { role: "ADMIN" });
      setSuccessMessage(`Booking #${booking.id} rejected.`);
      await loadAdminBookings();
    } catch (error) {
      setErrorMessage(error.message);
    }
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

  function handleDownloadTicketPdf(ticket) {
    if (!ticket) {
      return;
    }

    const document = new jsPDF();
    const lines = [
      "Smart Campus Ticket Details",
      "",
      `Ticket ID: ${ticket.id}`,
      `Title: ${ticket.title}`,
      `Description: ${ticket.description}`,
      `Category: ${formatLabel(ticket.category)}`,
      `Priority: ${formatLabel(ticket.priority)}`,
      `Status: ${formatLabel(ticket.status)}`,
      `Building: ${getTicketBuildingLabel(ticket.resourceId)}`,
      `Floor Number: ${ticket.userId}`,
      `Hall/Lab Number: ${ticket.assignedTechnicianId || "Not Provided"}`,
      `Created Date: ${String(ticket.createdDate).replace("T", " ")}`,
    ];

    let y = 20;
    lines.forEach((line, index) => {
      if (index === 0) {
        document.setFontSize(16);
        document.text(line, 14, y);
        y += 10;
        document.setFontSize(11);
        return;
      }

      const wrapped = document.splitTextToSize(line, 180);
      document.text(wrapped, 14, y);
      y += wrapped.length * 7;
    });

    document.save(`ticket-${ticket.id}.pdf`);
  }

  function getBuildingDetails(resourceId) {
    const matchedBuilding = ticketBuildingOptions.find(
      (building) => building.value === String(resourceId)
    );

    return matchedBuilding ? matchedBuilding.label : `Building ${resourceId}`;
  }

  function pushNotification(target, message, details = {}) {
    setSystemNotifications((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        target,
        message,
        building: details.building || null,
        floor: details.floor || null,
        hallLab: details.hallLab || null,
        timestamp: new Date().toLocaleString(),
      },
      ...current,
    ]);
  }

  function clearBookNotifications() {
    setSystemNotifications((current) =>
      current.filter((notification) => notification.target !== "BOOK")
    );
  }

  function clearAdminNotifications() {
    setSystemNotifications((current) =>
      current.filter((notification) => notification.target !== "ADMIN")
    );
  }

  async function handleMaintenanceTicketAction(ticket, action) {
    clearMessages();

    const actionMeta = {
      ACCEPT: { status: "IN_PROGRESS", label: "Accept" },
      REJECT: { status: "CLOSED", label: "Reject" },
      IN_PROGRESS: { status: "IN_PROGRESS", label: "In Process" },
      RESOLVED: { status: "RESOLVED", label: "Resolved" },
      CANCEL: { status: "CLOSED", label: "Cancel" },
    };

    const selectedAction = actionMeta[action];
    if (!selectedAction) {
      setErrorMessage("Unsupported maintenance action.");
      return;
    }

    const nextStatus = selectedAction.status;
    const buildingName = getBuildingDetails(ticket.resourceId);
    const floorNumber = ticket.userId;
    const hallLabNumber = ticket.assignedTechnicianId || "Not specified";
    const detailText = `${buildingName} | Floor ${floorNumber} | Hall/Lab ${hallLabNumber}`;

    // Optimistic UI update so notification/status appears immediately after click.
    setTickets((current) =>
      current.map((item) =>
        item.id === ticket.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );

    if (action === "REJECT") {
      pushNotification(
        "BOOK",
        `❌ REJECTED: Ticket #${ticket.id} has been rejected. ${detailText}`,
        {
          building: buildingName,
          floor: floorNumber,
          hallLab: hallLabNumber,
        }
      );
    } else if (action === "ACCEPT") {
      pushNotification(
        "BOOK",
        `✅ ACCEPTED: Ticket #${ticket.id} has been accepted. ${detailText}`,
        {
          building: buildingName,
          floor: floorNumber,
          hallLab: hallLabNumber,
        }
      );
    } else if (action === "IN_PROGRESS") {
      pushNotification(
        "BOOK",
        `🔄 IN PROGRESS: Ticket #${ticket.id} is now being processed. ${detailText}`,
        {
          building: buildingName,
          floor: floorNumber,
          hallLab: hallLabNumber,
        }
      );
    } else if (action === "RESOLVED") {
      pushNotification(
        "BOOK",
        `✓ RESOLVED: Ticket #${ticket.id} has been resolved. ${detailText}`,
        {
          building: buildingName,
          floor: floorNumber,
          hallLab: hallLabNumber,
        }
      );
    } else if (action === "CANCEL") {
      pushNotification(
        "BOOK",
        `✗ CANCELLED: Ticket #${ticket.id} has been cancelled. ${detailText}`,
        {
          building: buildingName,
          floor: floorNumber,
          hallLab: hallLabNumber,
        }
      );
    }

    pushNotification(
      "ADMIN",
      `Maintenance ${selectedAction.label}: Ticket #${ticket.id} - ${detailText}`,
      {
        building: buildingName,
        floor: floorNumber,
        hallLab: hallLabNumber,
      }
    );

    try {
      const payload = {
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: nextStatus,
        resourceId: ticket.resourceId,
        userId: ticket.userId,
        assignedTechnicianId: ticket.assignedTechnicianId || null,
        createdDate: ticket.createdDate,
      };

      const updated = await updateTicketApi(ticket.id, payload);
      setTickets((current) =>
        current.map((item) => (item.id === ticket.id ? updated : item))
      );
      setSuccessMessage(`Ticket #${ticket.id} updated: ${selectedAction.label}.`);
    } catch (error) {
      setSuccessMessage(
        `Notification sent for Ticket #${ticket.id} (${selectedAction.label}). Backend sync pending.`
      );
    }
  }

  async function handleEditBuilding(building) {
    clearMessages();
    setEditingBuildingId(building.id);
    setBuildingForm({
      buildingNo: building.buildingNo,
      name: building.name,
      floorCount: building.floors.length || 1,
    });
    setActiveSection("manage-buildings");
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
      if (editingBuildingId === building.id) {
        handleCancelBuildingEdit();
      }
      setSuccessMessage("Building deleted successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleEditFloor(floor) {
    clearMessages();
    setEditingFloorId(floor.id);
    setFloorForm({
      buildingId: String(floor.buildingId || floor.building?.id || ""),
      floorNumber: String(floor.floorNumber),
      label: floor.label,
    });
    setActiveSection("manage-buildings");
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
      if (editingFloorId === floor.id) {
        handleCancelFloorEdit();
      }
      setSuccessMessage("Floor deleted successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleEditRoom(room) {
    clearMessages();
    setEditingRoomId(room.id);
    setRoomForm({
      buildingId: String(room.buildingId),
      floorId: String(room.floorId),
      name: room.name,
      type: room.type,
      capacity: String(room.capacity),
      location: room.location,
      availabilityStart: room.availabilityStart.slice(0, 5),
      availabilityEnd: room.availabilityEnd.slice(0, 5),
      status: room.status,
      description: room.description,
    });
    setActiveSection("book-room");
  }

  async function handleDeleteRoom(room) {
    clearMessages();
    if (!window.confirm(`Delete room ${room.name}?`)) {
      return;
    }

    try {
      await deleteRoomApi(room.id);
      setRooms((current) => current.filter((item) => item.id !== room.id));
      if (editingRoomId === room.id) {
        handleCancelRoomEdit();
      }
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
        buildingsCount={buildings.length}
        roomsCount={rooms.length}
        ticketsCount={tickets.length}
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
        errorMessage={errorMessage}
        successMessage={successMessage}
        bookingUserId={bookingUserId}
        setBookingUserId={setBookingUserId}
        bookingForm={bookingForm}
        setBookingForm={setBookingForm}
        handleSubmitBooking={handleSubmitBooking}
        bookingLoading={bookingLoading}
        showBookingStatus={showBookingStatus}
        setShowBookingStatus={setShowBookingStatus}
        myBookings={myBookings}
        loadMyBookings={loadMyBookings}
        handleCancelMyBooking={handleCancelMyBooking}
        rooms={rooms}
        bookNotifications={bookNotifications}
        clearBookNotifications={clearBookNotifications}
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

  if (currentDashboard === "login") {
    return (
      <ALoginView
        clearMessages={clearMessages}
        setCurrentDashboard={setCurrentDashboard}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLoginSubmit={handleLoginSubmit}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    );
  }

  if (currentDashboard === "register") {
    return (
      <ARegisterView
        clearMessages={clearMessages}
        setCurrentDashboard={setCurrentDashboard}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        handleRegisterSubmit={handleRegisterSubmit}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    );
  }

  if (currentDashboard === "maintenance") {
    return (
      <AMaintenanceView
        clearMessages={clearMessages}
        setCurrentDashboard={setCurrentDashboard}
        handleLogout={handleLogout}
        authUser={authUser}
        tickets={tickets}
        formatLabel={formatLabel}
        getTicketBuildingLabel={getTicketBuildingLabel}
        handleMaintenanceTicketAction={handleMaintenanceTicketAction}
      />
    );
  }

  if (currentDashboard === "ticket-history") {
    return (
      <ATicketHistoryView
        myTicketHistory={myTicketHistory}
        myTicketStatusCount={myTicketStatusCount}
        getTicketStatusTone={getTicketStatusTone}
        getTicketBuildingLabel={getTicketBuildingLabel}
        handleStartTicketEdit={handleStartTicketEdit}
        handleDeleteTicket={handleDeleteTicket}
        setCurrentDashboard={setCurrentDashboard}
        clearMessages={clearMessages}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    );
  }

  if (currentDashboard === "ticket") {
    return (
      <ATicketFormView
        editingTicketId={editingTicketId}
        ticketForm={ticketForm}
        setTicketForm={setTicketForm}
        handleCreateTicket={handleCreateTicket}
        handleCancelTicketEdit={handleCancelTicketEdit}
        ticketLocationSummary={ticketLocationSummary}
        selectedTicketBuilding={selectedTicketBuilding}
        ticketFloorOptions={ticketFloorOptions}
        selectedTicketImages={selectedTicketImages}
        selectedTicketImageTotal={selectedTicketImageTotal}
        setCurrentDashboard={setCurrentDashboard}
        clearMessages={clearMessages}
        myTicketHistory={myTicketHistory}
        myTicketStatusCount={myTicketStatusCount}
        errorMessage={errorMessage}
        successMessage={successMessage}
        latestSubmittedTicket={latestSubmittedTicket}
        handleDownloadTicketPdf={handleDownloadTicketPdf}
      />
    );
  }

  return (
    <AAdminDashboardView
      clearMessages={clearMessages}
      setCurrentDashboard={setCurrentDashboard}
      handleLogout={handleLogout}
      authUser={authUser}
      adminNotifications={adminNotifications}
      showAdminNotifications={showAdminNotifications}
      setShowAdminNotifications={setShowAdminNotifications}
      clearAdminNotifications={clearAdminNotifications}
      buildings={buildings}
      totalFloors={totalFloors}
      rooms={rooms}
      editingBuildingId={editingBuildingId}
      editingFloorId={editingFloorId}
      editingRoomId={editingRoomId}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      isLoading={isLoading}
      errorMessage={errorMessage}
      successMessage={successMessage}
      buildingForm={buildingForm}
      setBuildingForm={setBuildingForm}
      floorForm={floorForm}
      setFloorForm={setFloorForm}
      handleCreateBuilding={handleCreateBuilding}
      handleAddFloor={handleAddFloor}
      roomForm={roomForm}
      setRoomForm={setRoomForm}
      handleRoomBuildingChange={handleRoomBuildingChange}
      selectedBuildingFloors={selectedBuildingFloors}
      roomTypes={roomTypes}
      selectedBuildingId={selectedBuildingId}
      setSelectedBuildingId={setSelectedBuildingId}
      selectedMapBuilding={selectedMapBuilding}
      selectedBuildingStats={selectedBuildingStats}
      selectedFloorInsights={selectedFloorInsights}
      getRoomQuickNote={getRoomQuickNote}
      roomStatusCount={roomStatusCount}
      totalCapacity={totalCapacity}
      activeCapacity={activeCapacity}
      maintenanceCapacity={maintenanceCapacity}
      handleEditBuilding={handleEditBuilding}
      handleDeleteBuilding={handleDeleteBuilding}
      handleEditFloor={handleEditFloor}
      handleDeleteFloor={handleDeleteFloor}
      handleCreateRoom={handleCreateRoom}
      handleEditRoom={handleEditRoom}
      handleDeleteRoom={handleDeleteRoom}
      handleCancelBuildingEdit={handleCancelBuildingEdit}
      handleCancelFloorEdit={handleCancelFloorEdit}
      handleCancelRoomEdit={handleCancelRoomEdit}
      loadAdminBookings={loadAdminBookings}
      adminBookingFilters={adminBookingFilters}
      setAdminBookingFilters={setAdminBookingFilters}
      adminBookingsLoading={adminBookingsLoading}
      adminBookings={adminBookings}
      handleAdminApprove={handleAdminApprove}
      handleAdminReject={handleAdminReject}
    />
    );
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
              className={`action-button ${action.accent} ${activeSection === action.id ? "active" : ""
                }`}
              onClick={() => setActiveSection(action.id)}
            >
              <span>{action.title}</span>
              <small>{action.subtitle}</small>
            </button>
          ))}
          <button
            type="button"
            className={`action-button sky ${
              activeSection === "view-book-status" ? "active" : ""
            }`}
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
                          className={`map-card ${String(selectedBuildingId) === String(building.id)
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
                            <td>{booking.status}</td>
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
          </section>
        )}
      </div>
    </main>
}

export default App;
