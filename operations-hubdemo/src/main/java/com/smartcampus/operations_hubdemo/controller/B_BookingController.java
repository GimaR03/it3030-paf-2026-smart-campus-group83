package com.smartcampus.operations_hubdemo.controller;

import com.smartcampus.operations_hubdemo.dto.B_CreateBookingRequest;
import com.smartcampus.operations_hubdemo.dto.B_BookingResponse;
import com.smartcampus.operations_hubdemo.dto.B_ApproveBookingRequest;
import com.smartcampus.operations_hubdemo.service.B_BookingService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for booking management
 */
@RestController
@RequestMapping("/api/legacy/bookings")
public class B_BookingController {
    
    @Autowired
    private B_BookingService bookingService;
    
    /**
     * Create a new booking request
     * POST /api/bookings
     */
    @PostMapping
    public ResponseEntity<B_BookingResponse> createBooking(
            @Valid @RequestBody B_CreateBookingRequest request,
            Authentication authentication) {
        try {
            // Get user ID from authentication (you might need to adjust based on your auth setup)
            Long userId = getUserIdFromAuthentication(authentication);
            B_BookingResponse response = bookingService.createBooking(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .build();
        }
    }
    
    /**
     * Get all bookings for the current user
     * GET /api/bookings/my-bookings
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<List<B_BookingResponse>> getMyBookings(
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            List<B_BookingResponse> bookings = bookingService.getUserBookings(userId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .build();
        }
    }
    
    /**
     * Get all bookings for the current user with a specific status
     * GET /api/bookings/my-bookings?status=PENDING
     */
    @GetMapping("/my-bookings/status")
    public ResponseEntity<List<B_BookingResponse>> getMyBookingsByStatus(
            @RequestParam String status,
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            List<B_BookingResponse> bookings = bookingService.getUserBookingsByStatus(userId, status);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .build();
        }
    }
    
    /**
     * Get a specific booking by ID
     * GET /api/bookings/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<B_BookingResponse> getBooking(@PathVariable Long id) {
        try {
            B_BookingResponse booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .build();
        }
    }
    
    /**
     * Get all bookings (ADMIN only)
     * GET /api/bookings/admin/all
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<B_BookingResponse>> getAllBookings() {
        try {
            List<B_BookingResponse> bookings = bookingService.getAllBookings();
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .build();
        }
    }
    
    /**
     * Get all pending bookings (ADMIN only)
     * GET /api/bookings/admin/pending
     */
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<B_BookingResponse>> getPendingBookings() {
        try {
            List<B_BookingResponse> bookings = bookingService.getPendingBookings();
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .build();
        }
    }
    
    /**
     * Approve or reject a booking (ADMIN only)
     * PUT /api/bookings/admin/{id}/review
     */
    @PutMapping("/admin/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<B_BookingResponse> reviewBooking(
            @PathVariable Long id,
            @Valid @RequestBody B_ApproveBookingRequest request) {
        try {
            B_BookingResponse response = bookingService.reviewBooking(
                id, request.getAction(), request.getReason());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .build();
        }
    }
    
    /**
     * Cancel a booking
     * PUT /api/bookings/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<B_BookingResponse> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            B_BookingResponse response = bookingService.cancelBooking(id, userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .build();
        }
    }
    
    /**
     * Helper method to extract user ID from authentication
     */
    private Long getUserIdFromAuthentication(Authentication authentication) {
        // This is a placeholder. Adjust based on how your authentication stores user ID
        // For example, it might be in a custom principal or user details
        return 1L;  // Replace with actual implementation
    }
}
