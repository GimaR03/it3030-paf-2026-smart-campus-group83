package com.smartcampus.operations_hubdemo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 120, message = "Full name must be 120 characters or less")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Pattern(regexp = "^[A-Za-z0-9._%+-]+@my\\.sliit\\.lk$", message = "Email must be in this format: username@my.sliit.lk")
        @Size(max = 120, message = "Email must be 120 characters or less")
        String email,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\d{10}$", message = "Phone number must contain exactly 10 digits")
        String phoneNumber,

        @NotBlank(message = "ID number is required")
        @Pattern(regexp = "^[A-Z0-9]{6,15}$", message = "ID number must contain 6 to 15 letters or numbers")
        String idNumber,

        @NotBlank(message = "Affiliation is required")
        @Pattern(regexp = "^(Academic Staff|Administrative Staff)$", message = "Affiliation must be Academic Staff or Administrative Staff")
        String affiliation,

        @NotBlank(message = "Department is required")
        @Size(min = 2, max = 120, message = "Department must be between 2 and 120 characters")
        String department,

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
        String password
) {
}
