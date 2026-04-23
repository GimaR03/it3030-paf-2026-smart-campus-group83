package com.smartcampus.operations_hubdemo.repository;

import com.smartcampus.operations_hubdemo.model.Room;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    long countByBuildingId(Long buildingId);

    long countByFloorId(Long floorId);

    @EntityGraph(attributePaths = {"building", "floor"})
    Optional<Room> findWithBuildingAndFloorById(Long id);
}
