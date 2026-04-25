package com.smartcampus.operations_hubdemo.service;

import com.smartcampus.operations_hubdemo.dto.AuthUserResponse;
import com.smartcampus.operations_hubdemo.dto.CreateAdminRequest;
import com.smartcampus.operations_hubdemo.dto.GoogleLoginRequest;
import com.smartcampus.operations_hubdemo.dto.LoginRequest;
import com.smartcampus.operations_hubdemo.dto.RegisterRequest;
import com.smartcampus.operations_hubdemo.model.CampusUser;
import com.smartcampus.operations_hubdemo.repository.CampusUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AuthService {

    public static final String CAMPUS_EMAIL_SUFFIX = "@my.sliit.lk";
    public static final String DEMO_ADMIN_EMAIL = "admin@my.sliit.lk";
    public static final String DEMO_ADMIN_PASSWORD = "Admin@123";
    public static final String DEMO_MAINTENANCE_EMAIL = "maintenance@my.sliit.lk";
    public static final String DEMO_MAINTENANCE_PASSWORD = "Maintenance@123";

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_MAINTENANCE = "MAINTENANCE";
    private static final String ROLE_USER = "USER";
    private static final LocalDate DEFAULT_DATE_OF_BIRTH = LocalDate.of(2000, 1, 1);
    private static final String DEFAULT_AFFILIATION = "Campus User";
    private static final String DEFAULT_DEPARTMENT = "Smart Campus";

    private final CampusUserRepository campusUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(CampusUserRepository campusUserRepository, PasswordEncoder passwordEncoder) {
        this.campusUserRepository = campusUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthUserResponse register(RegisterRequest request) {
        String email = normalizeCampusEmail(request.email());
        ensureAllowedCampusEmail(email);
        String phoneNumber = normalizeValue(request.phoneNumber());
        String idNumber = normalizeValue(request.idNumber());

        if (isReservedSystemEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This account is managed by the system. Use the provided admin or maintenance credentials."
            );
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

        String role = resolveRegistrationRole(request.role());
        CampusUser user = buildUser(
                email,
                request.fullName(),
                request.password(),
                role,
                phoneNumber,
                idNumber,
                request.dateOfBirth(),
                request.affiliation(),
                request.department()
        );
        return toResponse(campusUserRepository.save(user));
    }

    public AuthUserResponse login(LoginRequest request) {
        String email = normalizeCampusEmail(request.email());
        CampusUser user = campusUserRepository.findByEmail(email)
                .orElseThrow(() -> invalidCredentials());

        if (!matchesPassword(request.password(), user)) {
            throw invalidCredentials();
        }

        CampusUser synced = syncRole(user);
        return toResponse(synced);
    }

    public AuthUserResponse googleLogin(GoogleLoginRequest request) {
        String email = normalizeCampusEmail(request.email());
        ensureAllowedCampusEmail(email);

        CampusUser user = campusUserRepository.findByEmail(email)
                .map(this::syncRole)
                .orElseGet(() -> campusUserRepository.save(
                buildUser(
                    email,
                    request.fullName(),
                    UUID.randomUUID().toString(),
                    reservedOrDefaultRole(email),
                    generateUniquePhoneNumber(),
                    generateUniqueIdNumber(),
                    DEFAULT_DATE_OF_BIRTH,
                    DEFAULT_AFFILIATION,
                    DEFAULT_DEPARTMENT
                )
                ));

        return toResponse(user);
    }

    public AuthUserResponse createAdmin(String actingAdminEmail, CreateAdminRequest request) {
        ensureActingAdmin(actingAdminEmail);
        String email = normalizeCampusEmail(request.email());
        ensureAllowedCampusEmail(email);

        if (DEMO_MAINTENANCE_EMAIL.equals(email)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "maintenance@my.sliit.lk is reserved for the maintenance staff account."
            );
        }

        if (campusUserRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists.");
        }

        CampusUser admin = buildUser(
            email,
            request.fullName(),
            request.password(),
            ROLE_ADMIN,
            generateUniquePhoneNumber(),
            generateUniqueIdNumber(),
            DEFAULT_DATE_OF_BIRTH,
            DEFAULT_AFFILIATION,
            DEFAULT_DEPARTMENT
        );
        return toResponse(campusUserRepository.save(admin));
    }

    public AuthUserResponse createMaintenance(String actingAdminEmail, CreateAdminRequest request) {
        ensureActingAdmin(actingAdminEmail);
        String email = normalizeCampusEmail(request.email());
        ensureAllowedCampusEmail(email);

        if (DEMO_ADMIN_EMAIL.equals(email)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "admin@my.sliit.lk is reserved for the system admin account."
            );
        }

        if (campusUserRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists.");
        }

        CampusUser maintenance = buildUser(
            email,
            request.fullName(),
            request.password(),
            ROLE_MAINTENANCE,
            generateUniquePhoneNumber(),
            generateUniqueIdNumber(),
            DEFAULT_DATE_OF_BIRTH,
            DEFAULT_AFFILIATION,
            DEFAULT_DEPARTMENT
        );
        return toResponse(campusUserRepository.save(maintenance));
    }

    public java.util.List<AuthUserResponse> getAllAdmins(String actingAdminEmail) {
        ensureActingAdmin(actingAdminEmail);
        return campusUserRepository.findAllByRole(ROLE_ADMIN).stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public java.util.List<AuthUserResponse> getAllMaintenance(String actingAdminEmail) {
        ensureActingAdmin(actingAdminEmail);
        return campusUserRepository.findAllByRole(ROLE_MAINTENANCE).stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public java.util.List<AuthUserResponse> getAllUsers(String actingAdminEmail) {
        ensureActingAdmin(actingAdminEmail);
        return campusUserRepository.findAll().stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(String actingAdminEmail, Long userId) {
        ensureActingAdmin(actingAdminEmail);
        
        CampusUser userToDelete = campusUserRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Prevent self-deletion via this specific admin tool if needed, 
        // but usually admins can manage everyone.
        
        campusUserRepository.delete(userToDelete);
    }

    private void ensureActingAdmin(String actingAdminEmail) {
        CampusUser actingAdmin = campusUserRepository.findByEmail(normalizeCampusEmail(actingAdminEmail))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access is required"));

        if (!ROLE_ADMIN.equals(actingAdmin.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access is required");
        }
    }

    public void ensureSystemAccounts() {
        ensureAccount(DEMO_ADMIN_EMAIL, "Demo Admin", DEMO_ADMIN_PASSWORD, ROLE_ADMIN);
        ensureAccount(DEMO_MAINTENANCE_EMAIL, "Maintenance Staff", DEMO_MAINTENANCE_PASSWORD, ROLE_MAINTENANCE);
    }

    private void ensureAccount(String email, String fullName, String rawPassword, String role) {
        CampusUser user = campusUserRepository.findByEmail(email)
            .orElseGet(() -> buildUser(
                email,
                fullName,
                rawPassword,
                role,
                generateUniquePhoneNumber(),
                generateUniqueIdNumber(),
                DEFAULT_DATE_OF_BIRTH,
                DEFAULT_AFFILIATION,
                DEFAULT_DEPARTMENT
            ));

        boolean changed = false;
        if (!matchesPassword(rawPassword, user)) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            changed = true;
        }
        if (!role.equals(user.getRole())) {
            user.setRole(role);
            changed = true;
        }
        if (user.getFullName() == null || user.getFullName().isBlank()) {
            user.setFullName(fullName);
            changed = true;
        }

        if (user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) {
            user.setPhoneNumber(generateUniquePhoneNumber());
            changed = true;
        }
        if (user.getIdNumber() == null || user.getIdNumber().isBlank()) {
            user.setIdNumber(generateUniqueIdNumber());
            changed = true;
        }
        if (user.getDateOfBirth() == null) {
            user.setDateOfBirth(DEFAULT_DATE_OF_BIRTH);
            changed = true;
        }
        if (user.getAffiliation() == null || user.getAffiliation().isBlank()) {
            user.setAffiliation(DEFAULT_AFFILIATION);
            changed = true;
        }
        if (user.getDepartment() == null || user.getDepartment().isBlank()) {
            user.setDepartment(DEFAULT_DEPARTMENT);
            changed = true;
        }

        if (user.getId() == null || changed) {
            campusUserRepository.save(user);
        }
    }

    private CampusUser buildUser(
            String email,
            String requestedFullName,
            String rawPassword,
            String role,
            String phoneNumber,
            String idNumber,
            LocalDate dateOfBirth,
            String affiliation,
            String department
    ) {
        CampusUser user = new CampusUser();
        user.setEmail(email);
        user.setFullName(resolveDisplayName(requestedFullName, email));
        user.setPhoneNumber(normalizeValue(phoneNumber));
        user.setIdNumber(normalizeValue(idNumber));
        user.setDateOfBirth(dateOfBirth);
        user.setAffiliation(normalizeValue(affiliation));
        user.setDepartment(normalizeValue(department));
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        return user;
    }

    private String resolveRegistrationRole(String role) {
        String normalizedRole = normalizeValue(role).toUpperCase(Locale.ROOT);
        if (normalizedRole.isBlank()) {
            return ROLE_USER;
        }
        if (!ROLE_USER.equals(normalizedRole)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Public registration only supports USER role. Admin and maintenance roles are created by admins."
            );
        }
        return normalizedRole;
    }

    private CampusUser syncRole(CampusUser user) {
        String expectedRole = reservedOrPersistedRole(user);
        if (!expectedRole.equals(user.getRole())) {
            user.setRole(expectedRole);
            return campusUserRepository.save(user);
        }
        return user;
    }

    private String reservedOrPersistedRole(CampusUser user) {
        String reservedRole = reservedRole(user.getEmail());
        if (reservedRole != null) {
            return reservedRole;
        }

        String currentRole = user.getRole();
        if (ROLE_ADMIN.equals(currentRole) || ROLE_MAINTENANCE.equals(currentRole)) {
            return currentRole;
        }
        return ROLE_USER;
    }

    private String reservedOrDefaultRole(String email) {
        String reservedRole = reservedRole(email);
        return reservedRole != null ? reservedRole : ROLE_USER;
    }

    private String reservedRole(String email) {
        String localPart = email.substring(0, email.indexOf('@')).toLowerCase(Locale.ROOT);
        if ("admin".equals(localPart)) {
            return ROLE_ADMIN;
        }
        if ("maintenance".equals(localPart)) {
            return ROLE_MAINTENANCE;
        }
        return null;
    }

    private boolean isReservedSystemEmail(String email) {
        return reservedRole(email) != null;
    }

    private boolean matchesPassword(String rawPassword, CampusUser user) {
        String stored = user.getPassword();
        if (stored == null || stored.isBlank()) {
            return false;
        }

        if (passwordEncoder.matches(rawPassword, stored)) {
            return true;
        }

        // Migrate legacy plain-text passwords on successful login.
        if (stored.equals(rawPassword)) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            campusUserRepository.save(user);
            return true;
        }

        return false;
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
    }

    private void ensureAllowedCampusEmail(String email) {
        if (!email.endsWith(CAMPUS_EMAIL_SUFFIX)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only @my.sliit.lk email addresses are allowed"
            );
        }
    }

    private String normalizeCampusEmail(String email) {
        return String.valueOf(email).trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeValue(String value) {
        return value == null ? "" : value.trim();
    }

    private String resolveDisplayName(String requestedFullName, String email) {
        if (requestedFullName != null && !requestedFullName.isBlank()) {
            return requestedFullName.trim();
        }

        String localPart = email.substring(0, email.indexOf('@')).replace('.', ' ').replace('_', ' ');
        String[] words = localPart.split("\\s+");
        StringBuilder builder = new StringBuilder();
        for (String word : words) {
            if (word.isBlank()) {
                continue;
            }
            if (!builder.isEmpty()) {
                builder.append(' ');
            }
            builder.append(Character.toUpperCase(word.charAt(0)));
            if (word.length() > 1) {
                builder.append(word.substring(1));
            }
        }
        return builder.isEmpty() ? "Campus User" : builder.toString();
    }

    private String generateUniquePhoneNumber() {
        String candidate;
        do {
            long value = ThreadLocalRandom.current().nextLong(1_000_000_000L, 10_000_000_000L);
            candidate = Long.toString(value);
        } while (campusUserRepository.existsByPhoneNumber(candidate));
        return candidate;
    }

    private String generateUniqueIdNumber() {
        String candidate;
        do {
            String randomPart = Long.toUnsignedString(ThreadLocalRandom.current().nextLong() & Long.MAX_VALUE, 36)
                    .toUpperCase(Locale.ROOT);
            candidate = "AUTO" + (randomPart.length() > 8 ? randomPart.substring(0, 8) : randomPart);
        } while (campusUserRepository.existsByIdNumber(candidate));
        return candidate;
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
