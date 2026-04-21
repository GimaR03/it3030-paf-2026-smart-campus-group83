import React, { useState, useEffect } from 'react';
import { getRoomsAvailable } from '../api/campusApi';
import { createBooking } from '../api/bookingApi';
import './B_BookingForm.css';

/**
 * Booking Form Component
 * Allows users to create a booking request
 */
const B_BookingForm = ({ onBookingSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    roomId: '',
    bookingDate: '',
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
    attendees: 1,
  });

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch available rooms
  useEffect(() => {
    const fetchRoomsData = async () => {
      try {
        const data = await fetchRooms();
        setRooms(data);
      } catch (err) {
        setError('Failed to load rooms');
        console.error(err);
      }
    };
    fetchRoomsData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roomId' || name === 'attendees' ? parseInt(value) : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.roomId) {
      setError('Please select a room');
      setLoading(false);
      return;
    }

    if (!formData.bookingDate) {
      setError('Please select a booking date');
      setLoading(false);
      return;
    }

    if (!formData.purpose.trim()) {
      setError('Please enter a purpose');
      setLoading(false);
      return;
    }

    if (formData.attendees < 1) {
      setError('Number of attendees must be at least 1');
      setLoading(false);
      return;
    }

    // Check if end time is after start time
    if (formData.endTime <= formData.startTime) {
      setError('End time must be after start time');
      setLoading(false);
      return;
    }

    try {
      await createBooking(formData);
      setSuccess(true);
      setFormData({
        roomId: '',
        bookingDate: '',
        startTime: '09:00',
        endTime: '10:00',
        purpose: '',
        attendees: 1,
      });

      // Call callback if provided
      if (onBookingSuccess) {
        setTimeout(() => {
          onBookingSuccess();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to create booking');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-form-container">
      <h2>Create Booking Request</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Booking request created successfully!</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        {/* Room Selection */}
        <div className="form-group">
          <label htmlFor="roomId">Select Room *</label>
          <select
            id="roomId"
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">-- Choose a room --</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.roomName} ({room.roomType}) - Capacity: {room.capacity}
              </option>
            ))}
          </select>
        </div>

        {/* Booking Date */}
        <div className="form-group">
          <label htmlFor="bookingDate">Booking Date *</label>
          <input
            type="date"
            id="bookingDate"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            min={today}
            required
            className="form-control"
          />
        </div>

        {/* Time Range */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startTime">Start Time *</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time *</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
        </div>

        {/* Purpose */}
        <div className="form-group">
          <label htmlFor="purpose">Purpose of Booking *</label>
          <textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            placeholder="Enter the purpose of the booking"
            required
            rows="3"
            className="form-control"
          />
        </div>

        {/* Attendees */}
        <div className="form-group">
          <label htmlFor="attendees">Expected Number of Attendees</label>
          <input
            type="number"
            id="attendees"
            name="attendees"
            value={formData.attendees}
            onChange={handleChange}
            min="1"
            max="500"
            className="form-control"
          />
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating Booking...' : 'Create Booking'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>

      <div className="booking-info">
        <p><strong>Note:</strong> Your booking request will be reviewed by an administrator.</p>
      </div>
    </div>
  );
};

export default B_BookingForm;
