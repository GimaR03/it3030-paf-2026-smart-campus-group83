package com.smartcampus.operations_hubdemo.config;

import com.smartcampus.operations_hubdemo.model.CampusUser;
import com.smartcampus.operations_hubdemo.repository.CampusUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
public class ReservedStaffAccountSeeder {

    @Bean
    CommandLineRunner seedReservedStaffAccounts(CampusUserRepository campusUserRepository) {
        return args -> {
            ensureAccount(
                    campusUserRepository,
                    "Campus Admin",
                    "admin@my.sliit.lk",
                    "0710000002",
                    "ADMIN002",
                    "Administrative Staff",
                    "Campus Administration",
                    "admin123",
                    "ADMIN"
            );

            ensureAccount(
                    campusUserRepository,
                    "Maintenance Staff",
                    "maintance@my.sliit.lk",
                    "0710000003",
                    "MAIN001",
                    "Administrative Staff",
                    "Facilities Maintenance",
                    "maint123",
                    "MAINTENANCE"
            );
        };
    }

    private void ensureAccount(
            CampusUserRepository campusUserRepository,
            String fullName,
            String email,
            String phoneNumber,
            String idNumber,
            String affiliation,
            String department,
            String password,
            String role
    ) {
        if (campusUserRepository.existsByEmail(email)) {
            return;
        }

        CampusUser user = new CampusUser();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPhoneNumber(phoneNumber);
        user.setIdNumber(idNumber);
        user.setDateOfBirth(LocalDate.of(2000, 1, 1));
        user.setAffiliation(affiliation);
        user.setDepartment(department);
        user.setPassword(password);
        user.setRole(role);
        campusUserRepository.save(user);
    }
}