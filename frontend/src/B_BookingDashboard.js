import React, { useState, useEffect, useCallback } from 'react';
import { getMyBookings } from './api/bookingApi';
import B_BookingList from './components/B_BookingList';
import './B_BookingDashboard.css';

/**
 * Booking Dashboard Component
 * Shows user's bookings with filtering options
 */
const B_BookingDashboard = ({ onCreateNew }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply status filter
  const applyFilter = useCallback(() => {
    if (statusFilter === 'ALL') {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(b => b.status === statusFilter);
      setFilteredBookings(filtered);
    }
  }, [statusFilter, bookings]);

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Apply filter when status changes
  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  // Fetch user's bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle booking cancelled
  const handleBookingCancelled = (bookingId) => {
    setBookings(prev => 
      prev.map(b => 
        b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
      )
    );
  };

  // Get statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    approved: bookings.filter(b => b.status === 'APPROVED').length,
    rejected: bookings.filter(b => b.status === 'REJECTED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  return (
    <div className="booking-dashboard">
      <div className="dashboard-header">
        <h1>My Bookings</h1>
        <button onClick={onCreateNew} className="btn btn-primary">
          + Create New Booking
        </button>
      </div>

      {/* Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-number pending">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number approved">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number rejected">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
        <div className="stat-card">
          <div className="stat-number cancelled">{stats.cancelled}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      )}

      {/* Filter Tabs */}
      {!loading && (
        <>
          <div className="filter-tabs">
            <button
              className={`tab ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({stats.total})
            </button>
            <button
              className={`tab ${statusFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending ({stats.pending})
            </button>
            <button
              className={`tab ${statusFilter === 'APPROVED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('APPROVED')}
            >
              Approved ({stats.approved})
            </button>
            <button
              className={`tab ${statusFilter === 'REJECTED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('REJECTED')}
            >
              Rejected ({stats.rejected})
            </button>
            <button
              className={`tab ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('CANCELLED')}
            >
              Cancelled ({stats.cancelled})
            </button>
          </div>

          {/* Bookings List */}
          <B_BookingList
            bookings={filteredBookings}
            onBookingCancelled={handleBookingCancelled}
            isAdmin={false}
          />
        </>
      )}
    </div>
  );
};

export default B_BookingDashboard;
