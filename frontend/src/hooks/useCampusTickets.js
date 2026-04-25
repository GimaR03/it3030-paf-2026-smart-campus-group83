import { useState, useMemo, useEffect } from "react";
import {
  fetchTickets,
  createTicket,
  updateTicket as updateTicketApi,
  deleteTicket as deleteTicketApi,
} from "../api/campusApi";
import { getCurrentDateTimeValue } from "../A_helpers";
import { ticketBuildingOptions, MAX_TICKET_IMAGE_SIZE_BYTES, MAX_TICKET_IMAGE_REQUEST_BYTES } from "../A_constants";
import { createNotification } from "../notificationUtils";

export function useCampusTickets({
  setErrorMessage,
  setSuccessMessage,
  clearMessages,
  setCurrentDashboard,
  authUser,
  addSystemNotification,
}) {
  const [tickets, setTickets] = useState([]);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [latestSubmittedTicket, setLatestSubmittedTicket] = useState(null);
  const [ticketForm, setTicketForm] = useState({
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
  });

  useEffect(() => {
    loadTickets();
  }, [authUser]);

  const loadTickets = async () => {
    if (!authUser) {
      setTickets([]);
      return;
    }
    try {
      const data = await fetchTickets({ 
        userId: authUser.userId, 
        role: authUser.role 
      });
      setTickets(data);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      if (editingTicketId) {
        const payload = buildTicketUpdatePayload(ticketForm);
        const updated = await updateTicketApi(editingTicketId, payload, {
          userId: authUser.userId,
          role: authUser.role,
        });
        setTickets((curr) => curr.map((t) => (t.id === editingTicketId ? updated : t)));
        setEditingTicketId(null);
        setSuccessMessage(`Ticket updated.`);
        setCurrentDashboard("ticket-history");
      } else {
        validateTicketImages(ticketForm.images);
        const saved = await createTicket(buildTicketFormData(ticketForm), {
          userId: authUser.userId,
          role: authUser.role,
        });
        setTickets((curr) => [saved, ...curr]);
        setLatestSubmittedTicket(saved);
        setSuccessMessage(`Ticket created.`);
      }
      setTicketForm({
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
      });
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDeleteTicket = async (id) => {
    clearMessages();
    if (!window.confirm("Delete ticket?")) return;
    try {
      await deleteTicketApi(id);
      setTickets((curr) => curr.filter((t) => t.id !== id));
      setSuccessMessage("Ticket deleted.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleStartTicketEdit = (t) => {
    clearMessages();
    setEditingTicketId(t.id);
    setTicketForm({
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      status: t.status,
      resourceId: String(t.resourceId),
      userId: String(t.userId),
      assignedTechnicianId: String(t.assignedTechnicianId ?? ""),
      images: [],
      createdDate: t.createdDate.slice(0, 16),
    });
    setCurrentDashboard("ticket");
  };

  const handleCancelTicketEdit = () => {
    setEditingTicketId(null);
    setTicketForm({
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
    });
  };

  const handleMaintenanceTicketAction = async (ticket, action) => {
    clearMessages();
    try {
      const statusMap = {
        RESOLVED: "RESOLVED",
        CANCEL: "CLOSED",
        IN_PROGRESS: "IN_PROGRESS",
        ACCEPT: "IN_PROGRESS",
        REJECT: "CLOSED",
      };
      const newStatus = statusMap[action] || action;
      const payload = { ...ticket, status: newStatus };
      const updated = await updateTicketApi(ticket.id, payload, {
        userId: authUser.userId,
        role: authUser.role,
      });
      setTickets((curr) => curr.map((t) => (t.id === ticket.id ? updated : t)));
      setSuccessMessage(`Ticket status updated to ${newStatus}.`);

      addSystemNotification(
        createNotification({
          type: "TICKET_STATUS_CHANGED",
          category: "TICKET",
          recipientUserId: ticket.creatorId,
          title: `Ticket "${ticket.title}" updated`,
          message: `Your ticket status changed to ${newStatus}.`,
        })
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleAssignTicket = async (ticketId, maintenanceUserId) => {
    clearMessages();
    const targetMaintenanceId = maintenanceUserId ? Number(maintenanceUserId) : null;
    try {
      const { assignTicketToMaintenance } = await import("../api/campusApi");
      const updated = await assignTicketToMaintenance(ticketId, targetMaintenanceId, {
        role: authUser.role,
      });
      setTickets((curr) => curr.map((t) => (t.id === ticketId ? updated : t)));
      setSuccessMessage(targetMaintenanceId ? "Ticket assigned to maintenance." : "Ticket unassigned.");

<<<<<<< HEAD
      addSystemNotification(
        createNotification({
          type: "TICKET_ASSIGNED",
          category: "TICKET",
          recipientUserId: Number(maintenanceUserId),
          title: `Ticket #${updated.id} assigned to you`,
          message: `You have been assigned ticket "${updated.title}".`,
        })
      );
=======
      // Notify the maintenance user if assigned
      if (targetMaintenanceId) {
        dispatchTicketNotification({
          type: "ASSIGNED",
          ticketId: updated.id,
          ticketTitle: updated.title,
          newStatus: updated.status,
          creatorId: targetMaintenanceId, 
          message: `A new ticket #${updated.id} "${updated.title}" has been assigned to you.`,
        });
      }
>>>>>>> 7739b8ef9e5669723df5b8f97710a05470f4cde0
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Helper functions for ticket processing
  function validateTicketImages(images) {
    const files = Array.from(images || []);
    const oversized = files.find((f) => f.size > MAX_TICKET_IMAGE_SIZE_BYTES);
    if (oversized) throw new Error(`${oversized.name} is too large.`);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TICKET_IMAGE_REQUEST_BYTES) throw new Error("Total upload too large.");
  }

  function buildTicketFormData(form) {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("priority", form.priority);
    fd.append("status", form.status);
    fd.append("resourceId", form.resourceId);
    fd.append("userId", form.userId);
    if (form.assignedTechnicianId) fd.append("assignedTechnicianId", form.assignedTechnicianId);
    fd.append("createdDate", form.createdDate.length === 16 ? `${form.createdDate}:00` : form.createdDate);
    Array.from(form.images || []).forEach((img) => fd.append("images", img));
    return fd;
  }

  function buildTicketUpdatePayload(form) {
    return {
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      status: form.status,
      resourceId: Number(form.resourceId),
      userId: Number(form.userId),
      assignedTechnicianId: form.assignedTechnicianId || null,
      createdDate: form.createdDate.length === 16 ? `${form.createdDate}:00` : form.createdDate,
    };
  }

  const selectedTicketBuilding = useMemo(
    () => ticketBuildingOptions.find((opt) => opt.value === String(ticketForm.resourceId)) || null,
    [ticketForm.resourceId]
  );

  const ticketFloorOptions = useMemo(() => {
    if (!selectedTicketBuilding) return [];
    return Array.from({ length: selectedTicketBuilding.floorCount }, (_, i) => String(i + 1));
  }, [selectedTicketBuilding]);

  const selectedTicketImages = useMemo(() => Array.from(ticketForm.images || []), [ticketForm.images]);

  const selectedTicketImageTotal = useMemo(
    () => selectedTicketImages.reduce((sum, file) => sum + file.size, 0),
    [selectedTicketImages]
  );
  const ticketLocationSummary = useMemo(() => {
    if (!selectedTicketBuilding) return "Choose building";
    return `${selectedTicketBuilding.label}, Floor ${ticketForm.userId}${ticketForm.assignedTechnicianId ? `, ${ticketForm.assignedTechnicianId}` : ""}`;
  }, [selectedTicketBuilding, ticketForm.userId, ticketForm.assignedTechnicianId]);

  const ticketStatusCount = useMemo(() => {
    return ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].reduce((acc, status) => {
      acc[status] = tickets.filter((t) => t.status === status).length;
      return acc;
    }, {});
  }, [tickets]);

  return {
    tickets,
    ticketForm,
    setTicketForm,
    editingTicketId,
    latestSubmittedTicket,
    loadTickets,
    handleCreateTicket,
    handleDeleteTicket,
    handleStartTicketEdit,
    handleCancelTicketEdit,
    handleMaintenanceTicketAction,
    handleAssignTicket,
    ticketLocationSummary,
    selectedTicketBuilding,
    ticketFloorOptions,
    selectedTicketImages,
    selectedTicketImageTotal,
    ticketStatusCount,
  };
}
