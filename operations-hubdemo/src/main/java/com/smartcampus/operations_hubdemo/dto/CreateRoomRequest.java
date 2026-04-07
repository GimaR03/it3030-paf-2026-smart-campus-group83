package com.smartcampus.operations_hubdemo.dto;

import com.smartcampus.operations_hubdemo.model.RoomStatus;
import com.smartcampus.operations_hubdemo.model.RoomType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public record CreateRoomRequest(
        @NotNull(message = "Building is required")
        Long buildingId,

        @NotNull(message = "Floor is required")
        Long floorId,

        @NotBlank(message = "Room name is required")
        @Size(max = 120, message = "Room name must be 120 characters or less")
        String name,

        @NotNull(message = "Room type is required")
        RoomType type,

        @NotNull(message = "Capacity is required")
        @Min(value = 1, message = "Capacity must be at least 1")
        Integer capacity,

        @NotBlank(message = "Location is required")
        @Size(max = 120, message = "Location must be 120 characters or less")
        String location,

        @NotNull(message = "Availability start time is required")
        LocalTime availabilityStart,

        @NotNull(message = "Availability end time is required")
        LocalTime availabilityEnd,

        @NotNull(message = "Status is required")
        RoomStatus status,

        @NotBlank(message = "Description is required")
        @Size(max = 255, message = "Description must be 255 characters or less")
        String description
) {
}
