package com.smartcampus.operations_hubdemo.service;

import com.smartcampus.operations_hubdemo.dto.AuthUserResponse;
import com.smartcampus.operations_hubdemo.dto.LoginRequest;
import com.smartcampus.operations_hubdemo.dto.RegisterRequest;
import com.smartcampus.operations_hubdemo.model.CampusUser;
import com.smartcampus.operations_hubdemo.repository.CampusUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
public class AuthService {

    private static final String STAFF_EMAIL_SUFFIX = "@my.sliit.lk";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_MAINTENANCE = "MAINTENANCE";
    private static final String ROLE_USER = "USER";

    private final CampusUserRepository campusUserRepository;

    public AuthService(CampusUserRepository campusUserRepository) {
        this.campusUserRepository = campusUserRepository;
    }

    public AuthUserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        String phoneNumber = request.phoneNumber().trim();
        String idNumber = request.idNumber().trim().toUpperCase();
        String affiliation = normalizeAffiliation(request.affiliation());
        LocalDate dateOfBirth = request.dateOfBirth();

        if (!email.endsWith(STAFF_EMAIL_SUFFIX)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email must be in this format: username@my.sliit.lk");
        }

        if (!isAllowedAffiliation(affiliation)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Affiliation must be Academic Staff or Administrative Staff");
        }

        if (!dateOfBirth.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date of birth must be in the past");
        }

        if (campusUserRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered. Please login.");
        }

        if (campusUserRepository.existsByPhoneNumber(phoneNumber)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number already registered. Please use another one.");
        }

        if (campusUserRepository.existsByIdNumber(idNumber)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID number already registered. Please use another one.");
        }

        CampusUser user = new CampusUser();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPhoneNumber(phoneNumber);
        user.setIdNumber(idNumber);
        user.setDateOfBirth(dateOfBirth);
        user.setAffiliation(affiliation);
        user.setDepartment(request.department().trim());
        user.setPassword(request.password());
        user.setRole(resolveRoleByEmail(email));

        CampusUser saved = campusUserRepository.save(user);
        return toResponse(saved);
    }

    public AuthUserResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        CampusUser user = campusUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!user.getPassword().equals(request.password())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        String resolvedRole = resolveRoleByEmail(email);
        if (!resolvedRole.equals(user.getRole())) {
            user.setRole(resolvedRole);
            user = campusUserRepository.save(user);
        }

        return toResponse(user);
    }

    private String resolveRoleByEmail(String email) {
        int atIndex = email.indexOf("@");
        String usernamePart = atIndex > 0 ? email.substring(0, atIndex).toLowerCase() : "";

        if (usernamePart.contains("maintance") || usernamePart.contains("maintenance")) {
            return ROLE_MAINTENANCE;
        }

        if (usernamePart.contains("admin")) {
            return ROLE_ADMIN;
        }

        return ROLE_USER;
    }

    private boolean isAllowedAffiliation(String affiliation) {
        return "Academic Staff".equals(affiliation) || "Administrative Staff".equals(affiliation);
    }

    private String normalizeAffiliation(String rawAffiliation) {
        if (rawAffiliation == null) {
            return "";
        }
        return rawAffiliation.trim();
    }

    private AuthUserResponse toResponse(CampusUser user) {
        return new AuthUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getAffiliation(),
                user.getDepartment(),
                user.getRole()
        );
    }
}
