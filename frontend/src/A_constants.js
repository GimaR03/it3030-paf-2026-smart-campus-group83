export const roomTypes = [
  "LAB",
  "CLASSROOM",
  "AUDITORIUM",
  "MEETING_ROOM",
  "OFFICE",
  "OTHER",
];

export const roomStatuses = ["ACTIVE", "INACTIVE", "MAINTENANCE"];

export const dashboardActions = [
  {
    id: "manage-buildings",
    title: "Buildings & Floors",
    subtitle: "Create buildings and add floors",
    accent: "terracotta",
    icon: "🏛️",
  },
  {
    id: "book-room",
    title: "Create Room",
    subtitle: "Add a new room to a floor",
    accent: "teal",
    icon: "🚪",
  },
  {
    id: "building-map",
    title: "Building Map",
    subtitle: "Browse campus floor layout",
    accent: "sky",
    icon: "🗺️",
  },
  {
    id: "rooms-status",
    title: "Rooms Status",
    subtitle: "View all room availability",
    accent: "leaf",
    icon: "📋",
  },
];

export const portalActions = [
  {
    id: "book",
    title: "Book a Room",
    subtitle: "Find and reserve available rooms",
    accent: "teal",
    icon: "🏢",
  },
  {
    id: "ticket",
    title: "Support Ticket",
    subtitle: "Report issues and track requests",
    accent: "sky",
    icon: "🎫",
  },
  {
    id: "admin",
    title: "Admin Panel",
    subtitle: "Manage buildings, floors & rooms",
    accent: "terracotta",
    icon: "⚙️",
  },
  {
    id: "login",
    title: "Staff Login",
    subtitle: "Sign in to your staff account",
    accent: "leaf",
    icon: "🔐",
  },
];

export const ticketCategories = [
  "EQUIPMENT",
  "NETWORK",
  "ELECTRICAL",
  "PLUMBING",
  "CLEANING",
  "SECURITY",
  "OTHER",
];

export const ticketPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const ticketStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export const MAX_TICKET_IMAGE_SIZE_BYTES = 25 * 1024 * 1024;

export const MAX_TICKET_IMAGE_REQUEST_BYTES = 50 * 1024 * 1024;

export const ticketBuildingOptions = [
  { value: "1", label: "Main Building", floorCount: 9 },
  { value: "2", label: "New Building", floorCount: 14 },
];
