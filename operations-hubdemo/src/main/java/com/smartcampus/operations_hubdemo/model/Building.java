package com.smartcampus.operations_hubdemo.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "buildings1")
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "building_no", nullable = false, unique = true, length = 30)
    private String buildingNo;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "floor_count", nullable = false)
    private Integer floorCount = 0;

    @OneToMany(mappedBy = "building", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Floor> floors = new ArrayList<>();

    public Building() {
    }

    public Building(String buildingNo, String name) {
        this.buildingNo = buildingNo;
        this.name = name;
        this.floorCount = 0;
    }

    public Building(String buildingNo, String name, Integer floorCount) {
        this.buildingNo = buildingNo;
        this.name = name;
        this.floorCount = floorCount;
    }

    public Long getId() {
        return id;
    }

    public String getBuildingNo() {
        return buildingNo;
    }

    public void setBuildingNo(String buildingNo) {
        this.buildingNo = buildingNo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getFloorCount() {
        return floorCount;
    }

    public void setFloorCount(Integer floorCount) {
        this.floorCount = floorCount;
    }

    public List<Floor> getFloors() {
        return floors;
    }

    public void addFloor(Floor floor) {
        floor.setBuilding(this);
        floors.add(floor);
        if (floorCount == null) {
            floorCount = 0;
        }
        floorCount = floorCount + 1;
    }
}
