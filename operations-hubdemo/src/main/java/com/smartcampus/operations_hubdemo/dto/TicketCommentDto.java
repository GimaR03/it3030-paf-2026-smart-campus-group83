package com.smartcampus.operations_hubdemo.dto;

import java.time.LocalDateTime;

public record TicketCommentDto(
        Long id,
        Long ticketId,
        Long authorId,
        String authorName,
        String content,
        LocalDateTime createdAt
) {
}
