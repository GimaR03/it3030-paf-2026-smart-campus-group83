package com.smartcampus.operations_hubdemo.dto;

import java.util.List;

public record BuildingResponse(
        Long id,
        String buildingNo,
        String name,
        List<FloorResponse> floors
) {
}
