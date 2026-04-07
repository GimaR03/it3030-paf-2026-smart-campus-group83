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
    public List<TicketResponse> getTickets() {
        return ticketService.getTickets();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse createTicket(
            @Valid @ModelAttribute CreateTicketRequest request,
            @ModelAttribute("images") List<MultipartFile> images
    ) {
        return ticketService.createTicket(request, images);
    }

    @PutMapping("/{ticketId}")
    public TicketResponse updateTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody CreateTicketRequest request
    ) {
        return ticketService.updateTicket(ticketId, request);
    }

    @DeleteMapping("/{ticketId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTicket(@PathVariable Long ticketId) {
        ticketService.deleteTicket(ticketId);
    }
}
