package com.smartcampus.operations_hubdemo.service;

import com.smartcampus.operations_hubdemo.dto.AddFloorRequest;
import com.smartcampus.operations_hubdemo.dto.BuildingResponse;
import com.smartcampus.operations_hubdemo.dto.CreateBuildingRequest;
import com.smartcampus.operations_hubdemo.dto.CreateRoomRequest;
import com.smartcampus.operations_hubdemo.dto.FloorResponse;
import com.smartcampus.operations_hubdemo.dto.RoomResponse;
import com.smartcampus.operations_hubdemo.dto.UpdateBuildingRequest;
import com.smartcampus.operations_hubdemo.model.Building;
import com.smartcampus.operations_hubdemo.model.Floor;
import com.smartcampus.operations_hubdemo.model.Room;
import com.smartcampus.operations_hubdemo.repository.BuildingRepository;
import com.smartcampus.operations_hubdemo.repository.FloorRepository;
import com.smartcampus.operations_hubdemo.repository.RoomRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
public class CampusService {

    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;

    public CampusService(
            BuildingRepository buildingRepository,
            FloorRepository floorRepository,
            RoomRepository roomRepository
    ) {
        this.buildingRepository = buildingRepository;
        this.floorRepository = floorRepository;
        this.roomRepository = roomRepository;
    }

    public List<BuildingResponse> getBuildings() {
        return buildingRepository.findAll().stream()
                .sorted(Comparator.comparing(Building::getBuildingNo))
                .map(this::toBuildingResponse)
                .toList();
    }

    public List<FloorResponse> getFloorsByBuilding(Long buildingId) {
        if (!buildingRepository.existsById(buildingId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Building not found");
        }

        return floorRepository.findByBuildingIdOrderByFloorNumberAsc(buildingId).stream()
                .map(this::toFloorResponse)
                .toList();
    }

    @Transactional
    public BuildingResponse createBuilding(CreateBuildingRequest request) {
        if (buildingRepository.existsByBuildingNo(request.buildingNo().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Building number already exists");
        }

        Building building = new Building(request.buildingNo().trim(), request.name().trim());
        for (int floorNumber = 1; floorNumber <= request.floorCount(); floorNumber++) {
            building.addFloor(new Floor(floorNumber, formatFloorLabel(floorNumber)));
        }

        Building saved = buildingRepository.save(building);
        return toBuildingResponse(saved);
    }

    @Transactional
    public BuildingResponse updateBuilding(Long buildingId, UpdateBuildingRequest request) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Building not found"));

        String buildingNo = request.buildingNo().trim();
        if (buildingRepository.existsByBuildingNoAndIdNot(buildingNo, buildingId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Building number already exists");
        }

        building.setBuildingNo(buildingNo);
        building.setName(request.name().trim());
        Building saved = buildingRepository.save(building);
        return toBuildingResponse(saved);
    }

    @Transactional
    public void deleteBuilding(Long buildingId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Building not found"));

        if (roomRepository.countByBuildingId(buildingId) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot delete building that has rooms. Delete rooms first."
            );
        }

        buildingRepository.delete(building);
    }

    @Transactional
    public FloorResponse addFloor(Long buildingId, AddFloorRequest request) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Building not found"));

        if (floorRepository.existsByBuildingIdAndFloorNumber(buildingId, request.floorNumber())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Floor number already exists for this building"
            );
        }

        String floorLabel = request.label() == null || request.label().isBlank()
                ? formatFloorLabel(request.floorNumber())
                : request.label().trim();

        Floor floor = new Floor(request.floorNumber(), floorLabel);
        floor.setBuilding(building);
        Floor saved = floorRepository.save(floor);
        syncBuildingFloorCount(buildingId);
        return toFloorResponse(saved);
    }

    @Transactional
    public FloorResponse updateFloor(Long floorId, AddFloorRequest request) {
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Floor not found"));

        Long buildingId = floor.getBuilding().getId();
        if (floorRepository.existsByBuildingIdAndFloorNumberAndIdNot(buildingId, request.floorNumber(), floorId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Floor number already exists for this building"
            );
        }

        floor.setFloorNumber(request.floorNumber());
        String floorLabel = request.label() == null || request.label().isBlank()
                ? formatFloorLabel(request.floorNumber())
                : request.label().trim();
        floor.setLabel(floorLabel);

        Floor saved = floorRepository.save(floor);
        return toFloorResponse(saved);
    }

    @Transactional
    public void deleteFloor(Long floorId) {
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Floor not found"));

        if (roomRepository.countByFloorId(floorId) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot delete floor that has rooms. Delete rooms first."
            );
        }

        Long buildingId = floor.getBuilding().getId();
        floorRepository.delete(floor);
        syncBuildingFloorCount(buildingId);
    }

    public List<RoomResponse> getRooms() {
        return roomRepository.findAll().stream()
                .sorted(Comparator.comparing(Room::getId).reversed())
                .map(this::toRoomResponse)
                .toList();
    }

    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request) {
        Room room = new Room();
        applyRoomDetails(room, request);
        Room saved = roomRepository.save(room);
        return toRoomResponse(saved);
    }

    @Transactional
    public RoomResponse updateRoom(Long roomId, CreateRoomRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
        applyRoomDetails(room, request);
        Room saved = roomRepository.save(room);
        return toRoomResponse(saved);
    }

    @Transactional
    public void deleteRoom(Long roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found");
        }
        roomRepository.deleteById(roomId);
    }

    private void applyRoomDetails(Room room, CreateRoomRequest request) {
        Building building = buildingRepository.findById(request.buildingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Building not found"));
        Floor floor = floorRepository.findById(request.floorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Floor not found"));

        if (!floor.getBuilding().getId().equals(building.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected floor does not belong to building");
        }

        if (!request.availabilityStart().isBefore(request.availabilityEnd())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Availability start must be before end");
        }

        room.setName(request.name().trim());
        room.setType(request.type());
        room.setCapacity(request.capacity());
        room.setLocation(request.location().trim());
        room.setAvailabilityStart(request.availabilityStart());
        room.setAvailabilityEnd(request.availabilityEnd());
        room.setStatus(request.status());
        room.setDescription(request.description().trim());
        room.setBuilding(building);
        room.setFloor(floor);
    }

    private BuildingResponse toBuildingResponse(Building building) {
        List<FloorResponse> floors = building.getFloors().stream()
                .sorted(Comparator.comparing(Floor::getFloorNumber))
                .map(this::toFloorResponse)
                .toList();

        return new BuildingResponse(
                building.getId(),
                building.getBuildingNo(),
                building.getName(),
                floors
        );
    }

    private FloorResponse toFloorResponse(Floor floor) {
        return new FloorResponse(floor.getId(), floor.getFloorNumber(), floor.getLabel());
    }

    private RoomResponse toRoomResponse(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getName(),
                room.getType(),
                room.getCapacity(),
                room.getLocation(),
                room.getAvailabilityStart(),
                room.getAvailabilityEnd(),
                room.getStatus(),
                room.getDescription(),
                room.getBuilding().getId(),
                room.getBuilding().getBuildingNo(),
                room.getBuilding().getName(),
                room.getFloor().getId(),
                room.getFloor().getFloorNumber(),
                room.getFloor().getLabel()
        );
    }

    private void syncBuildingFloorCount(Long buildingId) {
        buildingRepository.findById(buildingId).ifPresent(building -> {
            building.setFloorCount((int) floorRepository.countByBuildingId(buildingId));
            buildingRepository.save(building);
        });
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
