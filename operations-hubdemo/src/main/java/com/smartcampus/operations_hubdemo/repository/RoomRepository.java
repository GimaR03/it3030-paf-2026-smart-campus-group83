package com.smartcampus.operations_hubdemo.repository;

import com.smartcampus.operations_hubdemo.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
    long countByBuildingId(Long buildingId);

    long countByFloorId(Long floorId);
}
