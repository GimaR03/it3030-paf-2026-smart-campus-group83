package com.smartcampus.operations_hubdemo.model;

/**
 * Enum representing the status of a booking in the system
 */
public enum B_BookingStatus {
    PENDING,    // Waiting for admin approval
    APPROVED,   // Approved by admin
    REJECTED,   // Rejected by admin
    CANCELLED   // Cancelled by user
}
