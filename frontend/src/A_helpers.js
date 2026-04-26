import { ticketBuildingOptions } from "./A_constants";

export function withSeconds(time) {
  return time.length === 5 ? `${time}:00` : time;
}

export function formatLabel(value) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getRoomQuickNote(room) {
  if (room.status === "MAINTENANCE") {
    return { text: "Under Maintenance", tone: "maintenance" };
  }

  if (room.status === "INACTIVE") {
    return { text: "Unavailable", tone: "inactive" };
  }

  return { text: "Available To Book", tone: "active" };
}

export function getCurrentDateTimeValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function getTicketStatusTone(status) {
  if (status === "OPEN") {
    return "open";
  }
  if (status === "IN_PROGRESS") {
    return "progress";
  }
  if (status === "RESOLVED") {
    return "resolved";
  }
  if (status === "REJECTED") {
    return "rejected";
  }
  return "closed";
}

export function getTicketBuildingLabel(resourceId) {
  const matchedBuilding = ticketBuildingOptions.find(
    (building) => building.value === String(resourceId)
  );
  return matchedBuilding ? matchedBuilding.label : `Building ${resourceId}`;
}
export function getCategoryColor(category) {
  const colors = {
    EQUIPMENT: '#0ea5e9',
    NETWORK: '#8b5cf6',
    ELECTRICAL: '#f59e0b',
    PLUMBING: '#10b981',
    CLEANING: '#ec4899',
    SECURITY: '#ef4444',
    OTHER: '#64748b',
  };
  return colors[category] || '#64748b';
}
