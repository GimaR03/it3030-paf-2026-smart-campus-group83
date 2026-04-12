package com.smartcampus.operations_hubdemo.dto;

import com.smartcampus.operations_hubdemo.model.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingResponse(
        Long id,
        Long resourceId,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String purpose,
        Integer expectedAttendees,
        Long requestedByUserId,
        BookingStatus status,
        String adminReason
) {
}
