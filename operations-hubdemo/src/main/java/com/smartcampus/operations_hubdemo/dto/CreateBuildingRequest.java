package com.smartcampus.operations_hubdemo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateBuildingRequest(
        @NotBlank(message = "Building number is required")
        @Size(max = 30, message = "Building number must be 30 characters or less")
        String buildingNo,

        @NotBlank(message = "Building name is required")
        @Size(max = 100, message = "Building name must be 100 characters or less")
        String name,

        @NotNull(message = "Floor count is required")
        @Min(value = 1, message = "A building must have at least one floor")
        @Max(value = 150, message = "Floor count is too high")
        Integer floorCount
) {
}
