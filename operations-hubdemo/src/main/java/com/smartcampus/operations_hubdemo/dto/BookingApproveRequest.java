package com.smartcampus.operations_hubdemo.dto;

import jakarta.validation.constraints.NotBlank;

public record BookingApproveRequest(
        @NotBlank(message = "Reason is required")
        String reason
) {
}
