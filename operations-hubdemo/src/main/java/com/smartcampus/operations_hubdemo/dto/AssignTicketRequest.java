package com.smartcampus.operations_hubdemo.dto;

import jakarta.validation.constraints.NotNull;

public class AssignTicketRequest {
    @NotNull(message = "Maintenance User ID is required")
    private Long maintenanceUserId;

    public Long getMaintenanceUserId() {
        return maintenanceUserId;
    }

    public void setMaintenanceUserId(Long maintenanceUserId) {
        this.maintenanceUserId = maintenanceUserId;
    }
}
