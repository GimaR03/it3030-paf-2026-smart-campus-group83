package com.smartcampus.operations_hubdemo.dto;

/**
 * Request DTO for approving or rejecting a booking
 */
public class B_ApproveBookingRequest {
    private Long bookingId;
    private String action;  // "APPROVE" or "REJECT"
    private String reason;  // Reason for rejection or approval
    
    // Constructors
    public B_ApproveBookingRequest() {
    }
    
    public B_ApproveBookingRequest(Long bookingId, String action, String reason) {
        this.bookingId = bookingId;
        this.action = action;
        this.reason = reason;
    }
    
    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}
