package com.smartcampus.operations_hubdemo.controller;

import com.smartcampus.operations_hubdemo.dto.AddFloorRequest;
import com.smartcampus.operations_hubdemo.dto.BuildingResponse;
import com.smartcampus.operations_hubdemo.dto.CreateBuildingRequest;
import com.smartcampus.operations_hubdemo.dto.CreateRoomRequest;
import com.smartcampus.operations_hubdemo.dto.FloorResponse;
import com.smartcampus.operations_hubdemo.dto.RoomResponse;
import com.smartcampus.operations_hubdemo.dto.UpdateBuildingRequest;
import com.smartcampus.operations_hubdemo.service.CampusService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campus")
public class CampusController {

    private final CampusService campusService;

    public CampusController(CampusService campusService) {
        this.campusService = campusService;
    }

    // Root endpoint to check API status
    @GetMapping
    public Map<String, Object> getCampusRoot() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Campus API is running successfully");
        response.put("availableEndpoints", Map.ofEntries(
                Map.entry("GET /api/campus/buildings", "Get all buildings"),
                Map.entry("GET /api/campus/buildings/{buildingId}/floors", "Get floors by building ID"),
                Map.entry("POST /api/campus/buildings", "Create new building"),
                Map.entry("PUT /api/campus/buildings/{buildingId}", "Update building"),
                Map.entry("DELETE /api/campus/buildings/{buildingId}", "Delete building"),
                Map.entry("POST /api/campus/buildings/{buildingId}/floors", "Add floor to building"),
                Map.entry("PUT /api/campus/floors/{floorId}", "Update floor"),
                Map.entry("DELETE /api/campus/floors/{floorId}", "Delete floor"),
                Map.entry("GET /api/campus/rooms", "Get all rooms"),
                Map.entry("POST /api/campus/rooms", "Create new room"),
                Map.entry("PUT /api/campus/rooms/{roomId}", "Update room"),
                Map.entry("DELETE /api/campus/rooms/{roomId}", "Delete room")
        ));
        return response;
    }

    @GetMapping("/buildings")
    public List<BuildingResponse> getBuildings() {
        return campusService.getBuildings();
    }

    @GetMapping("/buildings/{buildingId}/floors")
    public List<FloorResponse> getFloorsByBuilding(@PathVariable Long buildingId) {
        return campusService.getFloorsByBuilding(buildingId);
    }

    @PostMapping("/buildings")
    @ResponseStatus(HttpStatus.CREATED)
    public BuildingResponse createBuilding(@Valid @RequestBody CreateBuildingRequest request) {
        return campusService.createBuilding(request);
    }

    @PutMapping("/buildings/{buildingId}")
    public BuildingResponse updateBuilding(
            @PathVariable Long buildingId,
            @Valid @RequestBody UpdateBuildingRequest request
    ) {
        return campusService.updateBuilding(buildingId, request);
    }

    @DeleteMapping("/buildings/{buildingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBuilding(@PathVariable Long buildingId) {
        campusService.deleteBuilding(buildingId);
    }

    @PostMapping("/buildings/{buildingId}/floors")
    @ResponseStatus(HttpStatus.CREATED)
    public FloorResponse addFloor(@PathVariable Long buildingId, @Valid @RequestBody AddFloorRequest request) {
        return campusService.addFloor(buildingId, request);
    }

    @PutMapping("/floors/{floorId}")
    public FloorResponse updateFloor(@PathVariable Long floorId, @Valid @RequestBody AddFloorRequest request) {
        return campusService.updateFloor(floorId, request);
    }

    @DeleteMapping("/floors/{floorId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFloor(@PathVariable Long floorId) {
        campusService.deleteFloor(floorId);
    }

    @GetMapping("/rooms")
    public List<RoomResponse> getRooms() {
        return campusService.getRooms();
    }

    @PostMapping("/rooms")
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse createRoom(@Valid @RequestBody CreateRoomRequest request) {
        return campusService.createRoom(request);
    }

    @PutMapping("/rooms/{roomId}")
    public RoomResponse updateRoom(@PathVariable Long roomId, @Valid @RequestBody CreateRoomRequest request) {
        return campusService.updateRoom(roomId, request);
    }

    @DeleteMapping("/rooms/{roomId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoom(@PathVariable Long roomId) {
        campusService.deleteRoom(roomId);
    }
}
