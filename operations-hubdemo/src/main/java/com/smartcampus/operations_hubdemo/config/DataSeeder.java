package com.smartcampus.operations_hubdemo.config;

import com.smartcampus.operations_hubdemo.model.Building;
import com.smartcampus.operations_hubdemo.model.Floor;
import com.smartcampus.operations_hubdemo.model.Room;
import com.smartcampus.operations_hubdemo.model.RoomStatus;
import com.smartcampus.operations_hubdemo.model.RoomType;
import com.smartcampus.operations_hubdemo.repository.BuildingRepository;
import com.smartcampus.operations_hubdemo.repository.FloorRepository;
import com.smartcampus.operations_hubdemo.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DataSeeder {

    @Bean
    CommandLineRunner seedCampusData(BuildingRepository buildingRepository, FloorRepository floorRepository, RoomRepository roomRepository) {
        return args -> {
            ensureBuildingWithFloors(buildingRepository, floorRepository, "1", "Building 1", 14);
            ensureBuildingWithFloors(buildingRepository, floorRepository, "2", "Building 2", 14);

            if (roomRepository.count() > 0) {
                return;
            }

            buildingRepository.findByBuildingNo("1")
                    .ifPresent(building -> seedRoomsForBuilding(building, floorRepository, roomRepository, "B1"));
            buildingRepository.findByBuildingNo("2")
                    .ifPresent(building -> seedRoomsForBuilding(building, floorRepository, roomRepository, "B2"));
        };
    }

    private void ensureBuildingWithFloors(
            BuildingRepository buildingRepository,
            FloorRepository floorRepository,
            String buildingNo,
            String buildingName,
            int floorCount
    ) {
        Building building = buildingRepository.findByBuildingNo(buildingNo)
                .orElseGet(() -> buildingRepository.save(new Building(buildingNo, buildingName)));

        Set<Integer> existingFloors = floorRepository.findByBuildingIdOrderByFloorNumberAsc(building.getId())
                .stream()
                .map(Floor::getFloorNumber)
                .collect(Collectors.toSet());

        for (int floor = 1; floor <= floorCount; floor++) {
            if (existingFloors.contains(floor)) {
                continue;
            }
            Floor newFloor = new Floor(floor, formatFloorLabel(floor));
            newFloor.setBuilding(building);
            floorRepository.save(newFloor);
        }
    }

    private void seedRoomsForBuilding(
            Building building,
            FloorRepository floorRepository,
            RoomRepository roomRepository,
            String code
    ) {
        List<Floor> floors = floorRepository.findByBuildingIdOrderByFloorNumberAsc(building.getId());
        if (floors.isEmpty()) {
            return;
        }

        Floor firstFloor = floors.get(0);
        roomRepository.save(createRoom(building, firstFloor, code + "-101", RoomType.CLASSROOM, 60));
        roomRepository.save(createRoom(building, firstFloor, code + "-102", RoomType.LAB, 40));
    }

    private Room createRoom(Building building, Floor floor, String name, RoomType type, int capacity) {
        Room room = new Room();
        room.setName(name);
        room.setType(type);
        room.setCapacity(capacity);
        room.setLocation("Campus");
        room.setAvailabilityStart(LocalTime.of(8, 0));
        room.setAvailabilityEnd(LocalTime.of(18, 0));
        room.setStatus(RoomStatus.ACTIVE);
        room.setDescription("Seeded room");
        room.setBuilding(building);
        room.setFloor(floor);
        return room;
    }

    private String formatFloorLabel(int floorNumber) {
        int mod100 = floorNumber % 100;
        int mod10 = floorNumber % 10;
        String suffix;
        if (mod100 >= 11 && mod100 <= 13) {
            suffix = "th";
        } else if (mod10 == 1) {
            suffix = "st";
        } else if (mod10 == 2) {
            suffix = "nd";
        } else if (mod10 == 3) {
            suffix = "rd";
        } else {
            suffix = "th";
        }
        return floorNumber + suffix + " floor";
    }
}
