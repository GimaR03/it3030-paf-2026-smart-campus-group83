package com.smartcampus.operations_hubdemo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddFloorRequest(
        @NotNull(message = "Floor number is required")
        @Min(value = 1, message = "Floor number must be at least 1")
        @Max(value = 150, message = "Floor number is too high")
        Integer floorNumber,

        @Size(max = 50, message = "Floor label must be 50 characters or less")
        String label
) {
}
