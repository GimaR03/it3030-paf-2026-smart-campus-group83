package com.smartcampus.operations_hubdemo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateBuildingRequest(
        @NotBlank(message = "Building number is required")
        @Size(max = 30, message = "Building number must be 30 characters or less")
        String buildingNo,

        @NotBlank(message = "Building name is required")
        @Size(max = 100, message = "Building name must be 100 characters or less")
        String name
) {
}
