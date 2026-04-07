package com.smartcampus.operations_hubdemo.config;

import com.smartcampus.operations_hubdemo.model.Building;
import com.smartcampus.operations_hubdemo.model.Floor;
import com.smartcampus.operations_hubdemo.repository.BuildingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DataSeeder {

    @Bean
    CommandLineRunner seedCampusData(BuildingRepository buildingRepository) {
        return args -> {
            if (buildingRepository.count() > 0) {
                return;
            }

            Building building1 = new Building("1", "Building 1");
            for (int floor = 1; floor <= 7; floor++) {
                building1.addFloor(new Floor(floor, formatFloorLabel(floor)));
            }

            Building building2 = new Building("2", "Building 2");
            for (int floor = 1; floor <= 13; floor++) {
                building2.addFloor(new Floor(floor, formatFloorLabel(floor)));
            }

            buildingRepository.save(building1);
            buildingRepository.save(building2);
        };
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
