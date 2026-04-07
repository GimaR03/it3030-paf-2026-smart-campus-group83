package com.smartcampus.operations_hubdemo.repository;

import com.smartcampus.operations_hubdemo.model.Floor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FloorRepository extends JpaRepository<Floor, Long> {
    List<Floor> findByBuildingIdOrderByFloorNumberAsc(Long buildingId);

    boolean existsByBuildingIdAndFloorNumber(Long buildingId, Integer floorNumber);

    boolean existsByBuildingIdAndFloorNumberAndIdNot(Long buildingId, Integer floorNumber, Long id);

    long countByBuildingId(Long buildingId);
}
