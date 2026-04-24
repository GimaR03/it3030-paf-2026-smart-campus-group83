package com.smartcampus.operations_hubdemo.dto;

import com.smartcampus.operations_hubdemo.model.TicketCategory;
import com.smartcampus.operations_hubdemo.model.TicketPriority;
import com.smartcampus.operations_hubdemo.model.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

public record TicketResponse(
        Long id,
        String title,
        String description,
        TicketCategory category,
        TicketPriority priority,
        TicketStatus status,
        Long resourceId,
        Long userId,
        String assignedTechnicianId,
        List<String> imageUrls,
        LocalDateTime createdDate,
        String creatorName,
        Long creatorId,
        Long assignedMaintenanceId
) {
}
