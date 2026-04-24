package com.smartcampus.operations_hubdemo.controller;

import com.smartcampus.operations_hubdemo.dto.CreateTicketRequest;
import com.smartcampus.operations_hubdemo.dto.TicketResponse;
import com.smartcampus.operations_hubdemo.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/campus/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<TicketResponse> getTickets(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return ticketService.getTickets();
        }
        if ("MAINTENANCE".equalsIgnoreCase(role)) {
            if (headerUserId != null) {
                return ticketService.getTicketsByAssignedMaintenanceId(headerUserId);
            }
            return List.of();
        }
        if (headerUserId != null) {
            return ticketService.getTicketsByCreatorId(headerUserId);
        }
        return List.of();
    }

    @PostMapping("/{ticketId}/assign")
    public TicketResponse assignMaintenance(
            @PathVariable Long ticketId,
            @Valid @RequestBody com.smartcampus.operations_hubdemo.dto.AssignTicketRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can assign tickets");
        }
        return ticketService.assignMaintenance(ticketId, request.getMaintenanceUserId());
    }

    @GetMapping("/{ticketId}/comments")
    public List<com.smartcampus.operations_hubdemo.dto.TicketCommentDto> getComments(@PathVariable Long ticketId) {
        return ticketService.getComments(ticketId);
    }

    @PostMapping("/{ticketId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public com.smartcampus.operations_hubdemo.dto.TicketCommentDto addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody com.smartcampus.operations_hubdemo.dto.AddTicketCommentRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (headerUserId == null) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "User ID required");
        }
        // Verify access rights
        com.smartcampus.operations_hubdemo.model.Ticket ticket = ticketService.findTicket(ticketId);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        boolean isMaintenance = "MAINTENANCE".equalsIgnoreCase(role);
        boolean isCreator = headerUserId.equals(ticket.getCreatorId());
        boolean isAssigned = headerUserId.equals(ticket.getAssignedMaintenanceId());

        if (!isAdmin && !isCreator && !(isMaintenance && isAssigned)) {
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.FORBIDDEN, "You can only comment on your own tickets or tickets assigned to you");
        }
        return ticketService.addComment(ticketId, headerUserId, request.getContent());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse createTicket(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @Valid @ModelAttribute CreateTicketRequest request,
            @ModelAttribute("images") List<MultipartFile> images
    ) {
        return ticketService.createTicket(request, headerUserId, images);
    }

    @PutMapping("/{ticketId}")
    public TicketResponse updateTicket(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @PathVariable Long ticketId,
            @Valid @RequestBody CreateTicketRequest request
    ) {
        return ticketService.updateTicket(ticketId, request, headerUserId);
    }

    @DeleteMapping("/{ticketId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTicket(@PathVariable Long ticketId) {
        ticketService.deleteTicket(ticketId);
    }
}
