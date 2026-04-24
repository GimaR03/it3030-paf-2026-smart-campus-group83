/**
 * Stores a ticket notification in localStorage so the creator can see it
 * when they next view their tickets.
 */
export function dispatchTicketNotification({ type, ticketId, ticketTitle, newStatus, creatorId, message: customMessage }) {
  if (!creatorId) return;
  const key = `ticket_notifications_${creatorId}`;
  let existing = [];
  try {
    existing = JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    existing = [];
  }

  const notification = {
    id: Date.now(),
    type,
    ticketId,
    ticketTitle,
    newStatus,
    message: customMessage || buildMessage(type, ticketTitle, newStatus),
    timestamp: new Date().toLocaleString(),
    read: false,
  };

  existing.unshift(notification);
  // Keep only last 50 notifications
  if (existing.length > 50) existing = existing.slice(0, 50);
  localStorage.setItem(key, JSON.stringify(existing));
}

function buildMessage(type, title, newStatus) {
  if (type === "STATUS_CHANGE") {
    return `Your ticket "${title}" status changed to ${newStatus}.`;
  }
  if (type === "NEW_COMMENT") {
    return `A new comment was added to your ticket "${title}".`;
  }
  return `Update on ticket "${title}".`;
}

export function getTicketNotifications(userId) {
  if (!userId) return [];
  const key = `ticket_notifications_${userId}`;
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function markTicketNotificationsRead(userId) {
  if (!userId) return;
  const key = `ticket_notifications_${userId}`;
  const notifications = getTicketNotifications(userId).map((n) => ({ ...n, read: true }));
  localStorage.setItem(key, JSON.stringify(notifications));
}

export function clearTicketNotifications(userId) {
  if (!userId) return;
  localStorage.removeItem(`ticket_notifications_${userId}`);
}
