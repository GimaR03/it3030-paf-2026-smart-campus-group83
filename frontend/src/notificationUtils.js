export function createNotification({
  type,
  category,
  recipientUserId,
  message,
  title,
  metadata = {},
}) {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    category,
    recipientUserId: recipientUserId == null ? null : Number(recipientUserId),
    message,
    title: title || message,
    metadata,
    timestamp: new Date().toISOString(),
    read: false,
  };
}

export function getNotificationsForUser(notifications, userId, predicate = () => true) {
  if (!userId) return [];
  return (notifications || [])
    .filter(
      (notification) =>
        String(notification.recipientUserId) === String(userId) && predicate(notification)
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function markNotificationsAsRead(notifications, userId, predicate = () => true) {
  if (!userId) return notifications;
  return (notifications || []).map((notification) => {
    if (
      String(notification.recipientUserId) === String(userId) &&
      predicate(notification)
    ) {
      return { ...notification, read: true };
    }
    return notification;
  });
}

export function clearNotificationsForUser(notifications, userId, predicate = () => true) {
  if (!userId) return notifications;
  return (notifications || []).filter(
    (notification) =>
      !(
        String(notification.recipientUserId) === String(userId) &&
        predicate(notification)
      )
  );
}

export function getNotificationIcon(type) {
  switch (type) {
    case "BOOKING_APPROVED":
      return "✅";
    case "BOOKING_REJECTED":
      return "❌";
    case "TICKET_STATUS_CHANGED":
      return "🔄";
    case "TICKET_COMMENT_ADDED":
      return "💬";
    case "TICKET_ASSIGNED":
      return "🎫";
    default:
      return "🔔";
  }
}

export function formatNotificationTimestamp(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}
