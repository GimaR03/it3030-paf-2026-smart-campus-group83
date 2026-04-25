package com.smartcampus.operations_hubdemo.service;

import com.smartcampus.operations_hubdemo.dto.BookingApproveRequest;
import com.smartcampus.operations_hubdemo.dto.BookingCreateRequest;
import com.smartcampus.operations_hubdemo.dto.BookingCancelRequest;
import com.smartcampus.operations_hubdemo.dto.BookingRejectRequest;
import com.smartcampus.operations_hubdemo.dto.BookingResponse;
import com.smartcampus.operations_hubdemo.model.Booking;
import com.smartcampus.operations_hubdemo.model.BookingStatus;
import com.smartcampus.operations_hubdemo.model.Room;
import com.smartcampus.operations_hubdemo.model.RoomStatus;
import com.smartcampus.operations_hubdemo.repository.BookingRepository;
import com.smartcampus.operations_hubdemo.repository.RoomRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    public BookingResponse create(Long userId, BookingCreateRequest request) {
        if (!request.startTime().isBefore(request.endTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
        }

        Room room = roomRepository.findWithBuildingAndFloorById(request.resourceId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected room ID was not found. Please refresh and choose a valid room."
                ));

        if (room.getStatus() != RoomStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected room is not available for booking."
            );
        }

        if (request.startTime().isBefore(room.getAvailabilityStart()) || request.endTime().isAfter(room.getAvailabilityEnd())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected time is outside the room availability window."
            );
        }

        boolean overlaps = bookingRepository
                .findByResourceIdAndDateAndStatusIn(
                        request.resourceId(),
                        request.date(),
                        List.of(BookingStatus.PENDING, BookingStatus.APPROVED)
                )
                .stream()
                .anyMatch(existing -> overlaps(
                        existing.getStartTime(),
                        existing.getEndTime(),
                        request.startTime(),
                        request.endTime()
                ));

        if (overlaps) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Selected room has a conflicting booking");
        }

        Booking created = new Booking();
        created.setResourceId(request.resourceId());
        created.setResourceName(room.getName());
        created.setBuildingName(room.getBuilding().getName());
        created.setFloorLabel(room.getFloor().getLabel());
        created.setDate(request.date());
        created.setStartTime(request.startTime());
        created.setEndTime(request.endTime());
        created.setPurpose(request.purpose().trim());
        created.setExpectedAttendees(request.expectedAttendees());
        created.setRequestedByUserId(userId);
        created.setStatus(BookingStatus.PENDING);
        created.setAdminReason(null);
        created.setCancellationReason(null);
        created.setCancelledByUserId(null);

        return toResponse(bookingRepository.save(created));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> myBookings(Long userId) {
        return bookingRepository.findByRequestedByUserIdOrderByDateDescStartTimeDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> adminBookings(Long resourceId, String date, String status, Long requestedByUserId) {
        return bookingRepository.findAll(Sort.by(
                        Sort.Order.desc("date"),
                        Sort.Order.desc("startTime")
                )).stream()
                .filter(item -> resourceId == null || item.getResourceId().equals(resourceId))
                .filter(item -> date == null || date.isBlank() || item.getDate().toString().equals(date))
                .filter(item -> status == null || status.isBlank() || item.getStatus().name().equalsIgnoreCase(status))
                .filter(item -> requestedByUserId == null || item.getRequestedByUserId().equals(requestedByUserId))
                .map(this::toResponse)
                .toList();
    }

    public BookingResponse approve(Long bookingId, BookingApproveRequest request) {
        Booking record = find(bookingId);
        if (record.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING bookings can be approved");
        }
        record.setStatus(BookingStatus.APPROVED);
        record.setAdminReason(request.reason().trim());
        return toResponse(bookingRepository.save(record));
    }

    public BookingResponse reject(Long bookingId, BookingRejectRequest request) {
        Booking record = find(bookingId);
        if (record.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING bookings can be rejected");
        }
        record.setStatus(BookingStatus.REJECTED);
        record.setAdminReason(request.reason().trim());
        return toResponse(bookingRepository.save(record));
    }

    public BookingResponse cancel(Long bookingId, Long userId, boolean isAdmin, BookingCancelRequest request) {
        Booking record = find(bookingId);
        if (record.getStatus() != BookingStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only APPROVED bookings can be cancelled");
        }
        if (!isAdmin && !record.getRequestedByUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the requester (or ADMIN) can cancel this booking");
        }
        record.setStatus(BookingStatus.CANCELLED);
        record.setCancellationReason(request == null || request.reason() == null ? null : request.reason().trim());
        record.setCancelledByUserId(userId);
        return toResponse(bookingRepository.save(record));
    }

    @Transactional(readOnly = true)
    private Booking find(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private boolean overlaps(java.time.LocalTime aStart, java.time.LocalTime aEnd, java.time.LocalTime bStart, java.time.LocalTime bEnd) {
        return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
    }

    private BookingResponse toResponse(Booking record) {
        return new BookingResponse(
                record.getId(),
                record.getResourceId(),
                record.getResourceName(),
                record.getBuildingName(),
                record.getFloorLabel(),
                record.getDate(),
                record.getStartTime(),
                record.getEndTime(),
                record.getPurpose(),
                record.getExpectedAttendees(),
                record.getRequestedByUserId(),
                record.getStatus(),
                record.getAdminReason(),
                record.getCancellationReason(),
                record.getCancelledByUserId()
        );
    }
}
