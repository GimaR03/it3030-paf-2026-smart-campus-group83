package com.smartcampus.operations_hubdemo.dto;

public record AuthUserResponse(
        Long userId,
        String fullName,
        String email,
        String affiliation,
        String department,
        String role
) {
}
