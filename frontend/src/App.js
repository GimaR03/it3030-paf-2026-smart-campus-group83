import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import "./App.css";
import {
  portalActions,
  roomTypes,
} from "./A_constants";
import {
  formatLabel,
  getRoomQuickNote,
  getTicketStatusTone,
  getTicketBuildingLabel
} from "./A_helpers";
import APortalView from "./A_PortalView";
import ABookRoomView from "./A_BookRoomView";
import ABlankView from "./A_BlankView";
import ALoginView from "./A_LoginView";
import ARegisterView from "./A_RegisterView";
import AMaintenanceView from "./A_MaintenanceView";
import AAdminDashboardView from "./A_AdminDashboardView";
import ATicketFormView from "./ATicketFormView";
import ATicketHistoryView from "./ATicketHistoryView";
import {
  clearNotificationsForUser,
  getNotificationsForUser,
  markNotificationsAsRead,
} from "./notificationUtils";
import { useCampusResources } from "./hooks/useCampusResources";
import { useCampusAuth } from "./hooks/useCampusAuth";
import { useCampusBookings } from "./hooks/useCampusBookings";
import { useCampusTickets } from "./hooks/useCampusTickets";

const NOTIFICATION_STORAGE_KEY = "smartCampusSystemNotifications";

function App() {
  const [currentDashboard, setCurrentDashboard] = useState(() => {
    const saved = localStorage.getItem("campus_auth_user");
    if (!saved) return "login";
    try {
      const user = JSON.parse(saved);
      if (user.role === "ADMIN") return "admin";
      if (user.role === "MAINTENANCE") return "maintenance";
      return "portal";
    } catch (e) {
      return "login";
    }
  });
  const [blankPageTitle, setBlankPageTitle] = useState("");
  const [activeSection, setActiveSection] = useState("manage-buildings");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [systemNotifications, setSystemNotifications] = useState(() => {
    try {
      const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });
  const [showAdminNotifications, setShowAdminNotifications] = useState(false);

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const addSystemNotification = (notification) => {
    if (!notification) return;
    setSystemNotifications((prev) => [notification, ...prev].slice(0, 250));
  };

  // 1. Auth Hook
  const auth = useCampusAuth({ setErrorMessage, setSuccessMessage, setCurrentDashboard, clearMessages });
  const { authUser } = auth;

  // 2. Resources Hook
  const resources = useCampusResources({ setErrorMessage, setSuccessMessage, setIsLoading });
  const { buildings, rooms } = resources;

  // 3. Bookings Hook
  const bookings = useCampusBookings({
    setErrorMessage,
    setSuccessMessage,
    authUser,
    clearMessages,
    systemNotifications,
    setSystemNotifications,
    addSystemNotification,
    buildings,
    rooms
  });

  // 4. Tickets Hook
  const tickets = useCampusTickets({
    setErrorMessage,
    setSuccessMessage,
    clearMessages,
    setCurrentDashboard,
    authUser,
    addSystemNotification,
  });

  const currentUserNotifications = useMemo(
    () => getNotificationsForUser(systemNotifications, authUser?.userId),
    [systemNotifications, authUser]
  );

  const ticketNotifications = useMemo(
    () =>
      currentUserNotifications.filter(
        (notification) =>
          notification.category === "TICKET" &&
          notification.type !== "TICKET_ASSIGNED"
      ),
    [currentUserNotifications]
  );

  const assignmentNotifications = useMemo(
    () =>
      currentUserNotifications.filter(
        (notification) => notification.type === "TICKET_ASSIGNED"
      ),
    [currentUserNotifications]
  );

  const unreadNotificationsCount = useMemo(
    () => currentUserNotifications.filter((notification) => !notification.read).length,
    [currentUserNotifications]
  );

  const unreadTicketNotificationsCount = useMemo(
    () => ticketNotifications.filter((notification) => !notification.read).length,
    [ticketNotifications]
  );

  const unreadAssignmentNotificationsCount = useMemo(
    () => assignmentNotifications.filter((notification) => !notification.read).length,
    [assignmentNotifications]
  );

  const markCurrentUserNotificationsRead = (predicate = () => true) => {
    setSystemNotifications((prev) =>
      markNotificationsAsRead(prev, authUser?.userId, predicate)
    );
  };

  const clearCurrentUserNotifications = (predicate = () => true) => {
    setSystemNotifications((prev) =>
      clearNotificationsForUser(prev, authUser?.userId, predicate)
    );
  };

  useEffect(() => {
    window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(systemNotifications));
  }, [systemNotifications]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await Promise.all([resources.loadResources(), tickets.loadTickets()]);
      } catch (e) {
        setErrorMessage(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleDownloadTicketPdf = (ticket) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Smart Campus Support Ticket", 20, 25);
    doc.setFontSize(14);
    doc.text(`Ticket ID: ${ticket.id}`, 20, 40);
    doc.text(`Title: ${ticket.title}`, 20, 50);
    doc.text(`Category: ${formatLabel(ticket.category)}`, 20, 60);
    doc.text(`Priority: ${ticket.priority}`, 20, 70);
    doc.text(`Status: ${ticket.status}`, 20, 80);
    doc.text(`Location: ${getTicketBuildingLabel(ticket.resourceId)}`, 20, 90);
    doc.text(`Created: ${ticket.createdDate}`, 20, 100);
    doc.text("Description:", 20, 115);
    doc.setFontSize(12);
    doc.text(ticket.description || "No description provided", 20, 125, { maxWidth: 170 });
    doc.save(`ticket_${ticket.id}.pdf`);
  };

  const handlePortalAction = (id) => {
    clearMessages();
    if (id === "admin") {
      if (!authUser) { setErrorMessage("Please login as admin."); setCurrentDashboard("login"); return; }
      if (authUser.role !== "ADMIN") { setErrorMessage("Admin access required."); return; }
      setCurrentDashboard("admin");
      setActiveSection("view-book-status");
      bookings.loadAdminBookings();
      auth.loadAdmins();
      auth.loadMaintenanceStaff();
      auth.loadAllUsers();
      return;
    }
    if (id === "book") {
      if (!authUser) { setErrorMessage("Please login to book."); setCurrentDashboard("login"); return; }
      setCurrentDashboard("book");
      bookings.setShowBookingStatus(false);
      bookings.loadMyBookings(authUser);
      return;
    }
    if (id === "ticket") {
      if (!authUser) { setErrorMessage("Please login to report issues."); setCurrentDashboard("login"); return; }
      setCurrentDashboard("ticket");
      tickets.loadTickets();
      return;
    }
    if (id === "maintenance") {
      if (!authUser) { setErrorMessage("Please login."); setCurrentDashboard("login"); return; }
      if (authUser.role !== "MAINTENANCE") { setErrorMessage("Maintenance access required."); return; }
      setCurrentDashboard("maintenance");
      return;
    }
    if (id === "logout") {
      auth.handleLogout();
      return;
    }
    setBlankPageTitle(formatLabel(id));
    setCurrentDashboard("blank");
  };

  if (currentDashboard === "portal") {
    const dynamicActions = [...portalActions];

    // Add Maintenance Hub if user is MAINTENANCE
    if (authUser?.role === "MAINTENANCE") {
      dynamicActions.push({
        id: "maintenance",
        title: "Maintenance Hub",
        subtitle: "Respond to support tickets",
        accent: "sky",
        icon: "🔧",
      });
    }

    // Filter out login and admin if already logged in
    let filteredActions = dynamicActions;
    if (authUser) {
      filteredActions = dynamicActions.filter(a => a.id !== "login" && a.id !== "admin");
    }

    return (
      <APortalView
        portalActions={filteredActions}
        handlePortalAction={handlePortalAction}
        successMessage={successMessage}
        buildingsCount={buildings.length}
        roomsCount={rooms.length}
        ticketsCount={tickets.tickets.length}
        authUser={authUser}
        handleLogout={auth.handleLogout}
        notifications={currentUserNotifications}
        unreadNotificationsCount={unreadNotificationsCount}
        markNotificationsRead={() => markCurrentUserNotificationsRead()}
        clearNotifications={() => clearCurrentUserNotifications()}
      />
    );
  }

  if (currentDashboard === "book") {
    return (
      <ABookRoomView
        {...bookings}
        authUser={authUser}
        clearMessages={clearMessages}
        setCurrentDashboard={setCurrentDashboard}
        handleLogout={auth.handleLogout}
        buildings={buildings}
        rooms={rooms}
        getRoomQuickNote={getRoomQuickNote}
        formatLabel={formatLabel}
        setErrorMessage={setErrorMessage}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    );
  }

  if (currentDashboard === "blank") {
    return <ABlankView blankPageTitle={blankPageTitle} clearMessages={clearMessages} setCurrentDashboard={setCurrentDashboard} />;
  }

  if (currentDashboard === "login") {
    return (
      <ALoginView
        {...auth}
        clearMessages={clearMessages}
        setCurrentDashboard={setCurrentDashboard}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    );
  }

  if (currentDashboard === "register") {
    return (
      <ARegisterView
        {...auth}
        clearMessages={clearMessages}
        setCurrentDashboard={setCurrentDashboard}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    );
  }

  if (currentDashboard === "maintenance") {
    return (
      <AMaintenanceView
        {...tickets}
        clearMessages={clearMessages}
        setCurrentDashboard={setCurrentDashboard}
        handleLogout={auth.handleLogout}
        authUser={authUser}
        formatLabel={formatLabel}
        getTicketBuildingLabel={getTicketBuildingLabel}
        notifications={assignmentNotifications}
        unreadNotificationsCount={unreadAssignmentNotificationsCount}
        markNotificationsRead={() =>
          markCurrentUserNotificationsRead(
            (notification) => notification.type === "TICKET_ASSIGNED"
          )
        }
        clearNotifications={() =>
          clearCurrentUserNotifications(
            (notification) => notification.type === "TICKET_ASSIGNED"
          )
        }
        addSystemNotification={addSystemNotification}
      />
    );
  }

  if (currentDashboard === "ticket-history") {
    return (
      <ATicketHistoryView
        authUser={auth.authUser}
        myTicketHistory={tickets.tickets}
        myTicketStatusCount={tickets.ticketStatusCount}
        getTicketStatusTone={getTicketStatusTone}
        getTicketBuildingLabel={getTicketBuildingLabel}
        handleStartTicketEdit={tickets.handleStartTicketEdit}
        handleDeleteTicket={tickets.handleDeleteTicket}
        setCurrentDashboard={setCurrentDashboard}
        clearMessages={clearMessages}
        handleLogout={auth.handleLogout}
        errorMessage={errorMessage}
        successMessage={successMessage}
        notifications={ticketNotifications}
        unreadNotificationsCount={unreadTicketNotificationsCount}
        markNotificationsRead={() =>
          markCurrentUserNotificationsRead(
            (notification) =>
              notification.category === "TICKET" &&
              notification.type !== "TICKET_ASSIGNED"
          )
        }
        clearNotifications={() =>
          clearCurrentUserNotifications(
            (notification) =>
              notification.category === "TICKET" &&
              notification.type !== "TICKET_ASSIGNED"
          )
        }
        addSystemNotification={addSystemNotification}
      />
    );
  }

  if (currentDashboard === "ticket") {
    return (
      <ATicketFormView
        {...tickets}
        myTicketHistory={tickets.tickets}
        myTicketStatusCount={tickets.ticketStatusCount}
        setCurrentDashboard={setCurrentDashboard}
        clearMessages={clearMessages}
        handleLogout={auth.handleLogout}
        errorMessage={errorMessage}
        successMessage={successMessage}
        handleDownloadTicketPdf={handleDownloadTicketPdf}
        notifications={ticketNotifications}
        unreadNotificationsCount={unreadTicketNotificationsCount}
        markNotificationsRead={() =>
          markCurrentUserNotificationsRead(
            (notification) =>
              notification.category === "TICKET" &&
              notification.type !== "TICKET_ASSIGNED"
          )
        }
        clearNotifications={() =>
          clearCurrentUserNotifications(
            (notification) =>
              notification.category === "TICKET" &&
              notification.type !== "TICKET_ASSIGNED"
          )
        }
      />
    );
  }

  return (
    <AAdminDashboardView
      {...resources}
      {...bookings}
      {...auth}
      {...tickets}
      clearMessages={clearMessages}
      setCurrentDashboard={setCurrentDashboard}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      isLoading={isLoading}
      errorMessage={errorMessage}
      successMessage={successMessage}
      roomTypes={roomTypes}
      getRoomQuickNote={getRoomQuickNote}
      showAdminNotifications={showAdminNotifications}
      setShowAdminNotifications={setShowAdminNotifications}
    />
  );
}

export default App;
