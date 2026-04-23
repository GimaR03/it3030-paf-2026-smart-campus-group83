package com.smartcampus.operations_hubdemo.repository;

import com.smartcampus.operations_hubdemo.model.CampusUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CampusUserRepository extends JpaRepository<CampusUser, Long> {
    Optional<CampusUser> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByIdNumber(String idNumber);
}
