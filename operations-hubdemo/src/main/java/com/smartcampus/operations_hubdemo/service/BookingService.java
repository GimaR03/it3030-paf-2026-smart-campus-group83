package com.smartcampus.operations_hubdemo.service;

import com.smartcampus.operations_hubdemo.dto.BookingApproveRequest;
import com.smartcampus.operations_hubdemo.dto.BookingCreateRequest;
import com.smartcampus.operations_hubdemo.dto.BookingCancelRequest;
import com.smartcampus.operations_hubdemo.dto.BookingRejectRequest;
import com.smartcampus.operations_hubdemo.dto.BookingResponse;
import com.smartcampus.operations_hubdemo.model.BookingStatus;
import com.smartcampus.operations_hubdemo.model.Room;
import com.smartcampus.operations_hubdemo.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class BookingService {

    private final AtomicLong sequence = new AtomicLong(1);
    private final List<BookingRecord> bookings = new ArrayList<>();
    private final RoomRepository roomRepository;

    public BookingService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public synchronized BookingResponse create(Long userId, BookingCreateRequest request) {
        if (!request.startTime().isBefore(request.endTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
        }

        Room room = roomRepository.findWithBuildingAndFloorById(request.resourceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid resourceId (room not found)"));

        boolean overlaps = bookings.stream().anyMatch(existing ->
                existing.resourceId.equals(request.resourceId())
                        && existing.date.equals(request.date())
                        && (existing.status == BookingStatus.PENDING || existing.status == BookingStatus.APPROVED)
                        && overlaps(existing.startTime, existing.endTime, request.startTime(), request.endTime())
        );

        if (overlaps) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Selected room has a conflicting booking");
        }

        BookingRecord created = new BookingRecord();
        created.id = sequence.getAndIncrement();
        created.resourceId = request.resourceId();
        created.resourceName = room.getName();
        created.buildingName = room.getBuilding().getName();
        created.floorLabel = room.getFloor().getLabel();
        created.date = request.date();
        created.startTime = request.startTime();
        created.endTime = request.endTime();
        created.purpose = request.purpose().trim();
        created.expectedAttendees = request.expectedAttendees();
        created.requestedByUserId = userId;
        created.status = BookingStatus.PENDING;
        created.adminReason = null;
        created.cancellationReason = null;
        created.cancelledByUserId = null;
        bookings.add(created);

        return toResponse(created);
    }

    public synchronized List<BookingResponse> myBookings(Long userId) {
        return bookings.stream()
                .filter(item -> item.requestedByUserId.equals(userId))
                .sorted(Comparator.comparing((BookingRecord item) -> item.date).reversed()
                        .thenComparing(item -> item.startTime, Comparator.reverseOrder()))
                .map(this::toResponse)
                .toList();
    }

    public synchronized List<BookingResponse> adminBookings(Long resourceId, String date, String status, Long requestedByUserId) {
        return bookings.stream()
                .filter(item -> resourceId == null || item.resourceId.equals(resourceId))
                .filter(item -> date == null || date.isBlank() || item.date.toString().equals(date))
                .filter(item -> status == null || status.isBlank() || item.status.name().equalsIgnoreCase(status))
                .filter(item -> requestedByUserId == null || item.requestedByUserId.equals(requestedByUserId))
                .sorted(Comparator.comparing((BookingRecord item) -> item.date).reversed()
                        .thenComparing(item -> item.startTime, Comparator.reverseOrder()))
                .map(this::toResponse)
                .toList();
    }

    public synchronized BookingResponse approve(Long bookingId, BookingApproveRequest request) {
        BookingRecord record = find(bookingId);
        if (record.status != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING bookings can be approved");
        }
        record.status = BookingStatus.APPROVED;
        record.adminReason = request.reason().trim();
        return toResponse(record);
    }

    public synchronized BookingResponse reject(Long bookingId, BookingRejectRequest request) {
        BookingRecord record = find(bookingId);
        if (record.status != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING bookings can be rejected");
        }
        record.status = BookingStatus.REJECTED;
        record.adminReason = request.reason().trim();
        return toResponse(record);
    }

    public synchronized BookingResponse cancel(Long bookingId, Long userId, boolean isAdmin, BookingCancelRequest request) {
        BookingRecord record = find(bookingId);
        if (record.status != BookingStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only APPROVED bookings can be cancelled");
        }
        if (!isAdmin && !record.requestedByUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the requester (or ADMIN) can cancel this booking");
        }
        record.status = BookingStatus.CANCELLED;
        record.cancellationReason = request == null || request.reason() == null ? null : request.reason().trim();
        record.cancelledByUserId = userId;
        return toResponse(record);
    }

    private BookingRecord find(Long bookingId) {
        return bookings.stream()
                .filter(item -> item.id.equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private boolean overlaps(java.time.LocalTime aStart, java.time.LocalTime aEnd, java.time.LocalTime bStart, java.time.LocalTime bEnd) {
        return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
    }

    private BookingResponse toResponse(BookingRecord record) {
        return new BookingResponse(
                record.id,
                record.resourceId,
                record.resourceName,
                record.buildingName,
                record.floorLabel,
                record.date,
                record.startTime,
                record.endTime,
                record.purpose,
                record.expectedAttendees,
                record.requestedByUserId,
                record.status,
                record.adminReason,
                record.cancellationReason,
                record.cancelledByUserId
        );
    }

    private static class BookingRecord {
        private Long id;
        private Long resourceId;
        private String resourceName;
        private String buildingName;
        private String floorLabel;
        private java.time.LocalDate date;
        private java.time.LocalTime startTime;
        private java.time.LocalTime endTime;
        private String purpose;
        private Integer expectedAttendees;
        private Long requestedByUserId;
        private BookingStatus status;
        private String adminReason;
        private String cancellationReason;
        private Long cancelledByUserId;
    }
}
