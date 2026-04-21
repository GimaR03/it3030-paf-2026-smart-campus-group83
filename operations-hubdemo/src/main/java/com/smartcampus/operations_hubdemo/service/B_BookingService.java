package com.smartcampus.operations_hubdemo.service;

import com.smartcampus.operations_hubdemo.model.B_Booking;
import com.smartcampus.operations_hubdemo.model.B_BookingStatus;
import com.smartcampus.operations_hubdemo.repository.B_BookingRepository;
import com.smartcampus.operations_hubdemo.dto.B_CreateBookingRequest;
import com.smartcampus.operations_hubdemo.dto.B_BookingResponse;
import com.smartcampus.operations_hubdemo.dto.B_ApproveBookingRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for handling booking operations
 */
@Service
@Transactional
public class B_BookingService {
    
    @Autowired
    private B_BookingRepository bookingRepository;
    
    /**
     * Create a new booking request
     */
    public B_BookingResponse createBooking(B_CreateBookingRequest request, Long userId) {
        // Validate room exists (simplified - you might want to add actual validation)
        // For now, we'll assume the roomId is valid
        
        // Check for time conflicts
        if (hasConflict(request.getRoomId(), request.getBookingDate(), 
                        request.getStartTime(), request.getEndTime())) {
            throw new RuntimeException("Scheduling conflict: Room is already booked for the requested time");
        }
        
        // Validate that end time is after start time
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }
        
        // Validate that booking date is not in the past
        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Booking date cannot be in the past");
        }
        
        // Create new booking
        B_Booking booking = new B_Booking();
        booking.setUserId(userId);
        booking.setRoomId(request.getRoomId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setAttendees(request.getAttendees());
        booking.setStatus(B_BookingStatus.PENDING);
        
        // Save booking
        B_Booking savedBooking = bookingRepository.save(booking);
        
        // Convert to response DTO
        return convertToResponse(savedBooking);
    }
    
    /**
     * Check if there are conflicting bookings
     */
    private boolean hasConflict(Long roomId, LocalDate bookingDate, LocalTime startTime, LocalTime endTime) {
        return bookingRepository.existsConflictingBooking(roomId, bookingDate, startTime, endTime);
    }
    
    /**
     * Get all bookings for a user
     */
    public List<B_BookingResponse> getUserBookings(Long userId) {
        List<B_Booking> bookings = bookingRepository.findByUserId(userId);
        return bookings.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all bookings for a user with a specific status
     */
    public List<B_BookingResponse> getUserBookingsByStatus(Long userId, String status) {
        B_BookingStatus bookingStatus = B_BookingStatus.valueOf(status.toUpperCase());
        List<B_Booking> bookings = bookingRepository.findByUserIdAndStatus(userId, bookingStatus);
        return bookings.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all bookings (ADMIN only)
     */
    public List<B_BookingResponse> getAllBookings() {
        List<B_Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all pending bookings
     */
    public List<B_BookingResponse> getPendingBookings() {
        List<B_Booking> bookings = bookingRepository.findByStatusOrderByCreatedAtAsc(B_BookingStatus.PENDING);
        return bookings.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Approve or reject a booking
     */
    public B_BookingResponse reviewBooking(Long bookingId, String action, String reason) {
        B_Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if ("APPROVE".equalsIgnoreCase(action)) {
            booking.setStatus(B_BookingStatus.APPROVED);
            booking.setReason(reason);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            booking.setStatus(B_BookingStatus.REJECTED);
            booking.setReason(reason);
        } else {
            throw new RuntimeException("Invalid action. Use APPROVE or REJECT");
        }
        
        B_Booking updatedBooking = bookingRepository.save(booking);
        return convertToResponse(updatedBooking);
    }
    
    /**
     * Cancel a booking
     */
    public B_BookingResponse cancelBooking(Long bookingId, Long userId) {
        B_Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Check if user is the owner of the booking
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }
        
        // Only allow cancellation of pending or approved bookings
        if (booking.getStatus() == B_BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }
        
        booking.setStatus(B_BookingStatus.CANCELLED);
        B_Booking updatedBooking = bookingRepository.save(booking);
        return convertToResponse(updatedBooking);
    }
    
    /**
     * Get a specific booking by ID
     */
    public B_BookingResponse getBookingById(Long bookingId) {
        B_Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        return convertToResponse(booking);
    }
    
    /**
     * Convert booking entity to response DTO
     */
    private B_BookingResponse convertToResponse(B_Booking booking) {
        return new B_BookingResponse(
            booking.getId(),
            booking.getRoomId(),
            "Room " + booking.getRoomId(),  // Placeholder - you might want to fetch actual room name
            booking.getUserId(),
            "User " + booking.getUserId(),  // Placeholder - you might want to fetch actual user name
            booking.getBookingDate(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getPurpose(),
            booking.getAttendees(),
            booking.getStatus().toString(),
            booking.getReason(),
            booking.getCreatedAt(),
            booking.getUpdatedAt()
        );
    }
}
