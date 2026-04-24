package com.smartcampus.operations_hubdemo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AddTicketCommentRequest {
    @NotBlank(message = "Comment cannot be empty")
    @Size(max = 1000, message = "Comment must be 1000 characters or less")
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
