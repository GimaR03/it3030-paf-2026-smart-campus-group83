package com.smartcampus.operations_hubdemo.repository;

import com.smartcampus.operations_hubdemo.model.Building;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BuildingRepository extends JpaRepository<Building, Long> {
    boolean existsByBuildingNo(String buildingNo);

    boolean existsByBuildingNoAndIdNot(String buildingNo, Long id);

    Optional<Building> findByBuildingNo(String buildingNo);
}
