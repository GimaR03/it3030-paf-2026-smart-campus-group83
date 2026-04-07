package com.smartcampus.operations_hubdemo.dto;

import com.smartcampus.operations_hubdemo.model.RoomStatus;
import com.smartcampus.operations_hubdemo.model.RoomType;

import java.time.LocalTime;

public record RoomResponse(
        Long id,
        String name,
        RoomType type,
        Integer capacity,
        String location,
        LocalTime availabilityStart,
        LocalTime availabilityEnd,
        RoomStatus status,
        String description,
        Long buildingId,
        String buildingNo,
        String buildingName,
        Long floorId,
        Integer floorNumber,
        String floorLabel
) {
}
