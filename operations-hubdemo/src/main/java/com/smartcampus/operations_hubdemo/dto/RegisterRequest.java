package com.smartcampus.operations_hubdemo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 120, message = "Full name must be 120 characters or less")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Pattern(
                regexp = "^[A-Za-z0-9._%+-]+@my\\.sliit\\.lk$",
                message = "Only @my.sliit.lk email addresses are allowed"
        )
        @Size(max = 120, message = "Email must be 120 characters or less")
        String email,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
        @Size(max = 10, message = "Phone number must be 10 characters or less")
        String phoneNumber,

        @NotBlank(message = "ID number is required")
        @Size(max = 15, message = "ID number must be 15 characters or less")
        String idNumber,

        @NotBlank(message = "Affiliation is required")
        @Pattern(
                regexp = "^(Academic Staff|Non Academic Staff)$",
                message = "Affiliation must be Academic Staff or Non Academic Staff"
        )
        @Size(max = 30, message = "Affiliation must be 30 characters or less")
        String affiliation,

        @NotBlank(message = "Department is required")
        @Size(max = 120, message = "Department must be 120 characters or less")
        String department,

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 255, message = "Password must be between 6 and 255 characters")
        String password,

        @NotBlank(message = "Role is required")
        @Size(max = 30, message = "Role must be 30 characters or less")
        String role,

        @NotNull(message = "Date of birth is required")
        LocalDate dateOfBirth
) {
}
