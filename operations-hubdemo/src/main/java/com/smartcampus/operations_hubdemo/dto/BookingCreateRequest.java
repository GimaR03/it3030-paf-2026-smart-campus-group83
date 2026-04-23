package com.smartcampus.operations_hubdemo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingCreateRequest(
        @NotNull(message = "Resource ID is required")
        @Min(value = 1, message = "Resource ID must be positive")
        Long resourceId,

        @NotNull(message = "Date is required")
        LocalDate date,

        @NotNull(message = "Start time is required")
        LocalTime startTime,

        @NotNull(message = "End time is required")
        LocalTime endTime,

        @NotBlank(message = "Purpose is required")
        String purpose,

        @Min(value = 1, message = "Expected attendees must be positive")
        Integer expectedAttendees
) {
}
