import React, { useState } from 'react';
import { cancelBooking } from '../api/bookingApi';
import './B_BookingList.css';

/**
 * Booking List Component
 * Displays user's bookings in a table format
 */
const B_BookingList = ({ bookings, onBookingCancelled, isAdmin = false, onApprove = null }) => {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  // Handle cancel booking
  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setLoading(bookingId);
    setError(null);

    try {
      await cancelBooking(bookingId);
      if (onBookingCancelled) {
        onBookingCancelled(bookingId);
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'badge-warning';
      case 'APPROVED':
        return 'badge-success';
      case 'REJECTED':
        return 'badge-danger';
      case 'CANCELLED':
        return 'badge-secondary';
      default:
        return 'badge-default';
    }
  };

  // Format time
  const formatTime = (time) => {
    return time ? time.substring(0, 5) : '';
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="booking-list-empty">
        <p>No bookings found</p>
      </div>
    );
  }

  return (
    <div className="booking-list-container">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="booking-list-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Date</th>
              <th>Time</th>
              <th>Purpose</th>
              <th>Attendees</th>
              <th>Status</th>
              {isAdmin && <th>User</th>}
              {isAdmin && <th>Reason</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id} className={`booking-row status-${booking.status.toLowerCase()}`}>
                <td>{booking.roomName}</td>
                <td>{formatDate(booking.bookingDate)}</td>
                <td>
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </td>
                <td className="purpose-text">{booking.purpose}</td>
                <td className="text-center">{booking.attendees || '-'}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                {isAdmin && <td>{booking.userName}</td>}
                {isAdmin && <td className="reason-text">{booking.reason || '-'}</td>}
                <td className="actions-cell">
                  {!isAdmin && booking.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={loading === booking.id}
                      className="btn-action btn-cancel"
                      title="Cancel booking"
                    >
                      {loading === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                  {isAdmin && booking.status === 'PENDING' && onApprove && (
                    <>
                      <button
                        onClick={() => onApprove(booking.id, 'APPROVE')}
                        className="btn-action btn-approve"
                        title="Approve booking"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onApprove(booking.id, 'REJECT')}
                        className="btn-action btn-reject"
                        title="Reject booking"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'CANCELLED' && <span className="text-muted">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default B_BookingList;
