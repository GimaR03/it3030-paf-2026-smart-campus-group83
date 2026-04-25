package com.smartcampus.operations_hubdemo;

import com.smartcampus.operations_hubdemo.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.smartcampus.operations_hubdemo.model.Building;
import com.smartcampus.operations_hubdemo.model.Floor;
import com.smartcampus.operations_hubdemo.model.Room;
import com.smartcampus.operations_hubdemo.model.RoomStatus;
import com.smartcampus.operations_hubdemo.model.RoomType;
import com.smartcampus.operations_hubdemo.repository.BuildingRepository;
import com.smartcampus.operations_hubdemo.repository.FloorRepository;
import com.smartcampus.operations_hubdemo.repository.RoomRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookingManagementTests {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    BuildingRepository buildingRepository;

    @Autowired
    FloorRepository floorRepository;

    @Autowired
    RoomRepository roomRepository;

    @Autowired
    BookingRepository bookingRepository;

    @BeforeEach
    void cleanBookings() {
        bookingRepository.deleteAll();
    }

    @Test
    void preventsOverlappingBookingsForSameResource() throws Exception {
        long roomId = createRoom().getId();
        String payload1 = """
                {
                  "resourceId": %d,
                  "date": "2026-04-23",
                  "startTime": "10:00:00",
                  "endTime": "11:00:00",
                  "purpose": "Lecture",
                  "expectedAttendees": 10
                }
                """.formatted(roomId);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Id", "10")
                        .content(payload1))
                .andExpect(status().isCreated());

        String payload2 = """
                {
                  "resourceId": %d,
                  "date": "2026-04-23",
                  "startTime": "10:30:00",
                  "endTime": "12:00:00",
                  "purpose": "Seminar",
                  "expectedAttendees": 15
                }
                """.formatted(roomId);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Id", "11")
                        .content(payload2))
                .andExpect(status().isConflict());
    }

    @Test
    void adminRejectRequiresReason() throws Exception {
        long bookingId = createBooking(20);

        mockMvc.perform(patch("/api/bookings/{id}/reject", bookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Role", "ADMIN")
                        .content("{\"reason\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.reason").exists());
    }

    @Test
    void approvedBookingsCanBeCancelledByRequester() throws Exception {
        long bookingId = createBooking(30);

        mockMvc.perform(patch("/api/bookings/{id}/approve", bookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Role", "ADMIN")
                        .content("{\"reason\":\"Approved by admin\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        mockMvc.perform(patch("/api/bookings/{id}/cancel", bookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Id", "30")
                        .content("{\"reason\":\"Change of plans\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.cancelledByUserId").value(30))
                .andExpect(jsonPath("$.cancellationReason").value("Change of plans"));
    }

    @Test
    void cancellingRequiresApprovedStatusAndOwnership() throws Exception {
        long bookingId = createBooking(40);

        mockMvc.perform(patch("/api/bookings/{id}/cancel", bookingId)
                        .header("X-User-Id", "40"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(patch("/api/bookings/{id}/approve", bookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Role", "ADMIN")
                        .content("{\"reason\":\"Approved\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/bookings/{id}/cancel", bookingId)
                        .header("X-User-Id", "41"))
                .andExpect(status().isForbidden());
    }

    @Test
    void invalidResourceIdReturnsClearMessage() throws Exception {
        String payload = """
                {
                  "resourceId": 999999,
                  "date": "2026-04-23",
                  "startTime": "10:00:00",
                  "endTime": "11:00:00",
                  "purpose": "Lecture",
                  "expectedAttendees": 10
                }
                """;

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Id", "10")
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Selected room ID was not found. Please refresh and choose a valid room."));
    }

    @Test
    void myBookingsReturnsOnlyCurrentUsersHistory() throws Exception {
        createBooking(100);
        createBooking(100);
        createBooking(101);

        mockMvc.perform(get("/api/bookings/me")
                        .header("X-User-Id", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].requestedByUserId").value(100))
                .andExpect(jsonPath("$[1].requestedByUserId").value(100));
    }

    private long createBooking(long userId) throws Exception {
        long resourceId = createRoom().getId();
        String payload = """
                {
                  "resourceId": %d,
                  "date": "2026-04-23",
                  "startTime": "14:00:00",
                  "endTime": "15:00:00",
                  "purpose": "Group work",
                  "expectedAttendees": 5
                }
                """.formatted(resourceId);

        MvcResult result = mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Id", String.valueOf(userId))
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("id").asLong();
    }

    private Room createRoom() {
        Building building = buildingRepository.findByBuildingNo("1").orElseGet(() ->
                buildingRepository.save(new Building("1", "Building 1"))
        );

        List<Floor> floors = floorRepository.findByBuildingIdOrderByFloorNumberAsc(building.getId());
        Floor floor = floors.isEmpty()
                ? floorRepository.save(createFloor(building, 1))
                : floors.get(0);

        Room room = new Room();
        room.setName("Test Room " + UUID.randomUUID());
        room.setType(RoomType.CLASSROOM);
        room.setCapacity(50);
        room.setLocation("Test Location");
        room.setAvailabilityStart(LocalTime.of(8, 0));
        room.setAvailabilityEnd(LocalTime.of(18, 0));
        room.setStatus(RoomStatus.ACTIVE);
        room.setDescription("Test room");
        room.setBuilding(building);
        room.setFloor(floor);
        return roomRepository.save(room);
    }

    private Floor createFloor(Building building, int floorNumber) {
        Floor floor = new Floor();
        floor.setFloorNumber(floorNumber);
        floor.setLabel(floorNumber + " floor");
        floor.setBuilding(building);
        return floor;
    }
}
