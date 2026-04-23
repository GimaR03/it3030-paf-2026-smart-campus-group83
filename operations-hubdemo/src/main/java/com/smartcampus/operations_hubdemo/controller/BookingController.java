package com.smartcampus.operations_hubdemo.controller;

import com.smartcampus.operations_hubdemo.dto.BookingApproveRequest;
import com.smartcampus.operations_hubdemo.dto.BookingCancelRequest;
import com.smartcampus.operations_hubdemo.dto.BookingCreateRequest;
import com.smartcampus.operations_hubdemo.dto.BookingRejectRequest;
import com.smartcampus.operations_hubdemo.dto.BookingResponse;
import com.smartcampus.operations_hubdemo.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody BookingCreateRequest request
    ) {
        return bookingService.create(userId, request);
    }

    @GetMapping("/me")
    public List<BookingResponse> myBookings(@RequestHeader("X-User-Id") Long userId) {
        return bookingService.myBookings(userId);
    }

    @GetMapping("/admin")
    public List<BookingResponse> adminBookings(
            @RequestHeader("X-User-Role") String role,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long requestedByUserId
    ) {
        ensureAdmin(role);
        return bookingService.adminBookings(resourceId, date, status, requestedByUserId);
    }

    @PatchMapping("/{bookingId}/approve")
    public BookingResponse approve(
            @PathVariable Long bookingId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody BookingApproveRequest request
    ) {
        ensureAdmin(role);
        return bookingService.approve(bookingId, request);
    }

    @PatchMapping("/{bookingId}/reject")
    public BookingResponse reject(
            @PathVariable Long bookingId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody BookingRejectRequest request
    ) {
        ensureAdmin(role);
        return bookingService.reject(bookingId, request);
    }

    @PatchMapping("/{bookingId}/cancel")
    public BookingResponse cancel(
            @PathVariable Long bookingId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestBody(required = false) BookingCancelRequest request
    ) {
        boolean isAdmin = role != null && "ADMIN".equalsIgnoreCase(role.trim());
        return bookingService.cancel(bookingId, userId, isAdmin, request);
    }

    private void ensureAdmin(String role) {
        if (role == null || !"ADMIN".equalsIgnoreCase(role.trim())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "ADMIN role is required");
        }
    }
}
