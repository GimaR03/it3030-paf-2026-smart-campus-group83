const API_BASE_URL = "http://localhost:8080/api/campus";

function toJsonHeaders(headers = {}) {
  return {
    "Content-Type": "application/json",
    ...headers,
  };
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: toJsonHeaders(options.headers),
    });
  } catch (error) {
    throw new Error(
      `Cannot connect to backend API (${API_BASE_URL}). Make sure Spring Boot is running on port 8080.`
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
    throw new Error(getErrorMessage(payload, response.statusText));
  }

  return payload;
}

function getErrorMessage(payload, fallback) {
  if (!payload) {
    return fallback || "Request failed";
  }
  if (payload.fieldErrors && typeof payload.fieldErrors === "object") {
    const firstFieldError = Object.values(payload.fieldErrors)[0];
    if (firstFieldError) {
      return firstFieldError;
    }
  }
  return payload.message || fallback || "Request failed";
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
