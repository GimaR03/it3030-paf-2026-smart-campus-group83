package com.smartcampus.operations_hubdemo.controller;

import com.smartcampus.operations_hubdemo.dto.ApiErrorResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        return ResponseEntity.badRequest().body(buildValidationErrorResponse(ex.getBindingResult().getFieldErrors()));
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiErrorResponse> handleBindException(BindException ex) {
        return ResponseEntity.badRequest().body(buildValidationErrorResponse(ex.getBindingResult().getFieldErrors()));
    }

    private ApiErrorResponse buildValidationErrorResponse(Iterable<FieldError> errors) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : errors) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return new ApiErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Validation failed",
                fieldErrors
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        ApiErrorResponse response = new ApiErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                ex.getReason(),
                Map.of()
        );
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = resolveConstraintMessage(ex);
        ApiErrorResponse response = new ApiErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message,
                Map.of()
        );
        return ResponseEntity.badRequest().body(response);
    }

    private String resolveConstraintMessage(DataIntegrityViolationException ex) {
        String details = "";
        if (ex.getMostSpecificCause() != null && ex.getMostSpecificCause().getMessage() != null) {
            details = ex.getMostSpecificCause().getMessage().toLowerCase();
        }

        // Registration-related uniqueness constraints.
        if (details.contains("campus_users")) {
            if (details.contains("doesn't have a default value")
                    || details.contains("unknown column")
                    || details.contains("doesn't exist")
                    || details.contains("column count doesn't match")) {
                return "Registration failed because user table schema is outdated. Run the latest campus_users SQL script and try again.";
            }
            if (details.contains("email")) {
                return "Email already registered. Please login.";
            }
            if (details.contains("phone_number")) {
                return "Phone number already registered. Please use another one.";
            }
            if (details.contains("id_number")) {
                return "ID number already registered. Please use another one.";
            }
            return "Registration data conflicts with existing user records.";
        }

        // Existing building/floor/room relational constraint guidance.
        if (details.contains("floors") || details.contains("rooms") || details.contains("buildings1")) {
            return "Database constraint error. Ensure floors/rooms foreign keys reference buildings1(id).";
        }

        return "Database constraint error. Ensure referenced records exist and unique values are not duplicated.";
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        ApiErrorResponse response = new ApiErrorResponse(
                LocalDateTime.now(),
                HttpStatus.PAYLOAD_TOO_LARGE.value(),
                HttpStatus.PAYLOAD_TOO_LARGE.getReasonPhrase(),
                "Uploaded image is too large. Each file must be 25MB or smaller and the total upload must stay under 50MB.",
                Map.of()
        );
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(Exception ex) {
        String message = "Unexpected server error";
        if (ex.getMessage() != null && !ex.getMessage().isBlank()) {
            message = ex.getMessage();
        } else if (ex.getCause() != null && ex.getCause().getMessage() != null && !ex.getCause().getMessage().isBlank()) {
            message = ex.getCause().getMessage();
        }

        ApiErrorResponse response = new ApiErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                message,
                Map.of()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
