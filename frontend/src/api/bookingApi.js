import { API_BASE_URL } from '../A_constants';

const BOOKING_API_BASE = `${API_BASE_URL}/bookings`;

/**
 * Create a new booking
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await fetch(`${BOOKING_API_BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Get all bookings for the current user
 */
export const getMyBookings = async () => {
  try {
    const response = await fetch(`${BOOKING_API_BASE}/my-bookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    throw error;
  }
};

/**
 * Get bookings by status
 */
export const getMyBookingsByStatus = async (status) => {
  try {
    const response = await fetch(`${BOOKING_API_BASE}/my-bookings/status?status=${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching bookings by status:', error);
    throw error;
  }
};

/**
 * Get a specific booking by ID
 */
export const getBookingById = async (bookingId) => {
  try {
    const response = await fetch(`${BOOKING_API_BASE}/${bookingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await fetch(`${BOOKING_API_BASE}/${bookingId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

/**
 * Get all bookings (ADMIN only)
 */
export const getAllBookings = async () => {
  try {
    const response = await fetch(`${BOOKING_API_BASE}/admin/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

/**
 * Get pending bookings (ADMIN only)
 */
export const getPendingBookings = async () => {
  try {
    const response = await fetch(`${BOOKING_API_BASE}/admin/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    throw error;
  }
};

/**
 * Approve or reject a booking (ADMIN only)
 */
export const reviewBooking = async (bookingId, action, reason) => {
  try {
    const response = await fetch(`${BOOKING_API_BASE}/admin/${bookingId}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        bookingId,
        action,
        reason,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error reviewing booking:', error);
    throw error;
  }
};
