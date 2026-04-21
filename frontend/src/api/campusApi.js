const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api/campus";
const BOOKING_API_BASE_URL =
  process.env.REACT_APP_BOOKING_API_BASE_URL || "http://localhost:8080/api/bookings";

function toJsonHeaders(headers = {}) {
  return {
    "Content-Type": "application/json",
    ...headers,
  };
}

async function request(path, options = {}) {
  let response;
  try {
    const headers =
      options.body instanceof FormData
        ? options.headers
        : toJsonHeaders(options.headers);

    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      `Cannot connect to backend API (${API_BASE_URL}). Make sure Spring Boot is running.`
    );
  }

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response));
  }

  return payload;
}

async function bookingRequest(path, options = {}) {
  let response;
  try {
    const headers =
      options.body instanceof FormData
        ? options.headers
        : toJsonHeaders(options.headers);

    response = await fetch(`${BOOKING_API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      `Cannot connect to booking API (${BOOKING_API_BASE_URL}). Make sure Spring Boot is running.`
    );
  }

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response));
  }

  return payload;
}

function getErrorMessage(payload, response) {
  const fallback =
    response?.statusText || (response?.status ? `HTTP ${response.status}` : "Request failed");

  if (!payload) {
    return fallback;
  }
  if (payload.fieldErrors && typeof payload.fieldErrors === "object") {
    const firstFieldError = Object.values(payload.fieldErrors)[0];
    if (firstFieldError) {
      return firstFieldError;
    }
  }
  return payload.message || fallback;
}

export function fetchBuildings() {
  return request("/buildings");
}

export function createBuilding(buildingData) {
  return request("/buildings", {
    method: "POST",
    body: JSON.stringify(buildingData),
  });
}

export function updateBuilding(buildingId, buildingData) {
  return request(`/buildings/${buildingId}`, {
    method: "PUT",
    body: JSON.stringify(buildingData),
  });
}

export function deleteBuilding(buildingId) {
  return request(`/buildings/${buildingId}`, {
    method: "DELETE",
  });
}

export function addFloor(buildingId, floorData) {
  return request(`/buildings/${buildingId}/floors`, {
    method: "POST",
    body: JSON.stringify(floorData),
  });
}

export function updateFloor(floorId, floorData) {
  return request(`/floors/${floorId}`, {
    method: "PUT",
    body: JSON.stringify(floorData),
  });
}

export function deleteFloor(floorId) {
  return request(`/floors/${floorId}`, {
    method: "DELETE",
  });
}

export function fetchRooms() {
  return request("/rooms");
}

export function createRoom(roomData) {
  return request("/rooms", {
    method: "POST",
    body: JSON.stringify(roomData),
  });
}

export function updateRoom(roomId, roomData) {
  return request(`/rooms/${roomId}`, {
    method: "PUT",
    body: JSON.stringify(roomData),
  });
}

export function deleteRoom(roomId) {
  return request(`/rooms/${roomId}`, {
    method: "DELETE",
  });
}

export function fetchTickets() {
  return request("/tickets");
}

export function createTicket(ticketData) {
  return request("/tickets", {
    method: "POST",
    body: ticketData,
  });
}

export function updateTicket(ticketId, ticketData) {
  return request(`/tickets/${ticketId}`, {
    method: "PUT",
    body: JSON.stringify(ticketData),
  });
}

export function deleteTicket(ticketId) {
  return request(`/tickets/${ticketId}`, {
    method: "DELETE",
  });
}

export function getRoomsAvailable() {
  return request("/rooms/available");
}

export function createBookingRequest(bookingData, { userId, role }) {
  return bookingRequest("", {
    method: "POST",
    headers: {
      "X-User-Id": String(userId),
      "X-User-Role": role,
    },
    body: JSON.stringify(bookingData),
  });
}

export function fetchMyBookings({ userId, role }) {
  return bookingRequest("/me", {
    method: "GET",
    headers: {
      "X-User-Id": String(userId),
      "X-User-Role": role,
    },
  });
}

export function fetchAllBookingsForAdmin(filters = {}, { role }) {
  const params = new URLSearchParams();
  if (filters.resourceId) {
    params.append("resourceId", String(filters.resourceId));
  }
  if (filters.date) {
    params.append("date", filters.date);
  }
  if (filters.status) {
    params.append("status", filters.status);
  }
  if (filters.requestedByUserId) {
    params.append("requestedByUserId", String(filters.requestedByUserId));
  }

  const query = params.toString();
  return bookingRequest(`/admin${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      "X-User-Role": role,
    },
  });
}

export function approveBooking(bookingId, { role }) {
  return bookingRequest(`/${bookingId}/approve`, {
    method: "PATCH",
    headers: {
      "X-User-Role": role,
    },
  });
}

export function rejectBooking(bookingId, reason, { role }) {
  return bookingRequest(`/${bookingId}/reject`, {
    method: "PATCH",
    headers: {
      "X-User-Role": role,
    },
    body: JSON.stringify({ reason }),
  });
}
