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
