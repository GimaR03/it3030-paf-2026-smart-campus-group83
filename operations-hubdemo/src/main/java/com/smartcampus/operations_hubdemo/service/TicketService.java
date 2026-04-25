package com.smartcampus.operations_hubdemo.service;

import com.smartcampus.operations_hubdemo.dto.CreateTicketRequest;
import com.smartcampus.operations_hubdemo.dto.TicketResponse;
import com.smartcampus.operations_hubdemo.model.Ticket;
import com.smartcampus.operations_hubdemo.repository.TicketRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {
    private static final Path UPLOAD_ROOT = Paths.get("uploads", "tickets");

    private final TicketRepository ticketRepository;
    private final com.smartcampus.operations_hubdemo.repository.CampusUserRepository userRepository;
    private final com.smartcampus.operations_hubdemo.repository.TicketCommentRepository commentRepository;

    public TicketService(TicketRepository ticketRepository, 
            com.smartcampus.operations_hubdemo.repository.CampusUserRepository userRepository,
            com.smartcampus.operations_hubdemo.repository.TicketCommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
    }

    public List<TicketResponse> getTickets() {
        return ticketRepository.findAll().stream()
                .sorted(Comparator.comparing(Ticket::getCreatedDate).reversed())
                .map(this::toTicketResponse)
                .toList();
    }

    public List<TicketResponse> getTicketsByCreatorId(Long creatorId) {
        return ticketRepository.findByCreatorId(creatorId).stream()
                .sorted(Comparator.comparing(Ticket::getCreatedDate).reversed())
                .map(this::toTicketResponse)
                .toList();
    }

    public List<TicketResponse> getTicketsByAssignedMaintenanceId(Long maintenanceId) {
        return ticketRepository.findByAssignedMaintenanceId(maintenanceId).stream()
                .sorted(Comparator.comparing(Ticket::getCreatedDate).reversed())
                .map(this::toTicketResponse)
                .toList();
    }

    @Transactional
    public TicketResponse assignMaintenance(Long ticketId, Long maintenanceId) {
        Ticket ticket = findTicket(ticketId);
        ticket.setAssignedMaintenanceId(maintenanceId);
        return toTicketResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public com.smartcampus.operations_hubdemo.dto.TicketCommentDto addComment(Long ticketId, Long authorId, String content) {
        findTicket(ticketId); // Validate ticket exists
        com.smartcampus.operations_hubdemo.model.TicketComment comment = new com.smartcampus.operations_hubdemo.model.TicketComment();
        comment.setTicketId(ticketId);
        comment.setAuthorId(authorId);
        comment.setContent(content);
        comment.setCreatedAt(java.time.LocalDateTime.now());
        
        String authorName = userRepository.findById(authorId)
            .map(com.smartcampus.operations_hubdemo.model.CampusUser::getFullName)
            .orElse("Unknown");
        comment.setAuthorName(authorName);
        
        comment = commentRepository.save(comment);
        return new com.smartcampus.operations_hubdemo.dto.TicketCommentDto(
            comment.getId(), comment.getTicketId(), comment.getAuthorId(),
            comment.getAuthorName(), comment.getContent(), comment.getCreatedAt()
        );
    }

    public List<com.smartcampus.operations_hubdemo.dto.TicketCommentDto> getComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
            .map(c -> new com.smartcampus.operations_hubdemo.dto.TicketCommentDto(
                c.getId(), c.getTicketId(), c.getAuthorId(),
                c.getAuthorName(), c.getContent(), c.getCreatedAt()
            )).toList();
    }

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, Long creatorId, List<MultipartFile> images) {
        Ticket ticket = new Ticket();
        applyTicketFields(ticket, request);
        ticket.setCreatorId(creatorId);
        ticket.setImageUrls(storeImages(images));

        Ticket saved = ticketRepository.save(ticket);
        return toTicketResponse(saved);
    }

    @Transactional
    public TicketResponse updateTicket(Long ticketId, CreateTicketRequest request, Long creatorId) {
        Ticket ticket = findTicket(ticketId);
        applyTicketFields(ticket, request);
        ticket.setCreatorId(creatorId != null ? creatorId : ticket.getCreatorId());
        Ticket saved = ticketRepository.save(ticket);
        return toTicketResponse(saved);
    }

    @Transactional
    public void deleteTicket(Long ticketId) {
        Ticket ticket = findTicket(ticketId);
        deleteStoredImages(ticket.getImageUrls());
        ticketRepository.delete(ticket);
    }

    public Ticket findTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    private void applyTicketFields(Ticket ticket, CreateTicketRequest request) {
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(request.getStatus());
        ticket.setResourceId(request.getResourceId());
        ticket.setUserId(request.getUserId());
        ticket.setAssignedTechnicianId(normalizeOptionalText(request.getAssignedTechnicianId()));
        ticket.setCreatedDate(request.getCreatedDate());
    }

    private List<String> storeImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return List.of();
        }

        try {
            Files.createDirectories(UPLOAD_ROOT);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to create uploads directory", exception);
        }

        return images.stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(this::storeSingleImage)
                .toList();
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String storeSingleImage(MultipartFile image) {
        String originalName = image.getOriginalFilename();
        String safeName = originalName == null
                ? "ticket-image"
                : originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storedName = UUID.randomUUID() + "-" + safeName;
        Path destination = UPLOAD_ROOT.resolve(storedName);

        try {
            Files.copy(image.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to store uploaded image", exception);
        }

        return "/uploads/tickets/" + storedName;
    }

    private void deleteStoredImages(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }

        for (String imageUrl : imageUrls) {
            if (imageUrl == null || !imageUrl.startsWith("/uploads/tickets/")) {
                continue;
            }

            String fileName = imageUrl.substring("/uploads/tickets/".length());
            Path filePath = UPLOAD_ROOT.resolve(fileName);
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {
                // Leave orphaned file behind rather than blocking ticket deletion.
            }
        }
    }

    private TicketResponse toTicketResponse(Ticket ticket) {
        String creatorName = "Unknown User";
        if (ticket.getCreatorId() != null) {
            creatorName = userRepository.findById(ticket.getCreatorId())
                    .map(com.smartcampus.operations_hubdemo.model.CampusUser::getFullName)
                    .orElse("Unknown User");
        }
        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getCategory(),
                ticket.getPriority(),
                ticket.getStatus(),
                ticket.getResourceId(),
                ticket.getUserId(),
                ticket.getAssignedTechnicianId(),
                new ArrayList<>(ticket.getImageUrls()),
                ticket.getCreatedDate(),
                creatorName,
                ticket.getCreatorId(),
                ticket.getAssignedMaintenanceId()
        );
    }
}
