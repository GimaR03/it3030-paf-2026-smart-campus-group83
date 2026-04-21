package com.smartcampus.operations_hubdemo.repository;

import com.smartcampus.operations_hubdemo.model.B_Booking;
import com.smartcampus.operations_hubdemo.model.B_BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for B_Booking entity
 */
@Repository
public interface B_BookingRepository extends JpaRepository<B_Booking, Long> {
    
    /**
     * Find all bookings for a specific user
     */
    List<B_Booking> findByUserId(Long userId);
    
    /**
     * Find all bookings for a specific user with a particular status
     */
    List<B_Booking> findByUserIdAndStatus(Long userId, B_BookingStatus status);
    
    /**
     * Find all bookings for a specific room on a specific date
     */
    List<B_Booking> findByRoomIdAndBookingDate(Long roomId, LocalDate bookingDate);
    
    /**
     * Find all bookings with a specific status
     */
    List<B_Booking> findByStatus(B_BookingStatus status);
    
    /**
     * Find all bookings for a room that are not cancelled
     */
    @Query("SELECT b FROM B_Booking b WHERE b.roomId = :roomId AND b.status <> com.smartcampus.operations_hubdemo.model.B_BookingStatus.CANCELLED")
    List<B_Booking> findActiveBookingsByRoom(@Param("roomId") Long roomId);
    
    /**
     * Check for overlapping bookings
     */
    @Query("SELECT COUNT(b) > 0 FROM B_Booking b " +
           "WHERE b.roomId = :roomId " +
           "AND b.bookingDate = :bookingDate " +
           "AND b.status IN (com.smartcampus.operations_hubdemo.model.B_BookingStatus.PENDING, com.smartcampus.operations_hubdemo.model.B_BookingStatus.APPROVED) " +
           "AND NOT (b.endTime <= :startTime OR b.startTime >= :endTime)")
    boolean existsConflictingBooking(@Param("roomId") Long roomId,
                                     @Param("bookingDate") LocalDate bookingDate,
                                     @Param("startTime") LocalTime startTime,
                                     @Param("endTime") LocalTime endTime);
    
    /**
     * Find all pending bookings
     */
    List<B_Booking> findByStatusOrderByCreatedAtAsc(B_BookingStatus status);
}
