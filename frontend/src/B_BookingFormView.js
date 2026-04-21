import React, { useState } from 'react';
import B_BookingForm from './components/B_BookingForm';
import B_BookingDashboard from './B_BookingDashboard';
import './B_BookingFormView.css';

/**
 * Booking Form View
 * Main view that handles booking creation and dashboard
 * Navigated from A_PortalView when user clicks "Book"
 */
const B_BookingFormView = ({ onBack }) => {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'form'

  const handleCreateNew = () => {
    setCurrentView('form');
  };

  const handleBookingSuccess = () => {
    setCurrentView('dashboard');
  };

  const handleCancel = () => {
    setCurrentView('dashboard');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="booking-form-view">
      {/* Header with Back Button */}
      <div className="view-header">
        <button onClick={handleBack} className="btn-back">
          ← Back to Portal
        </button>
        <h1>Smart Campus - Booking System</h1>
      </div>

      {/* Main Content */}
      <div className="view-content">
        {currentView === 'dashboard' && (
          <B_BookingDashboard onCreateNew={handleCreateNew} />
        )}

        {currentView === 'form' && (
          <B_BookingForm 
            onBookingSuccess={handleBookingSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default B_BookingFormView;
