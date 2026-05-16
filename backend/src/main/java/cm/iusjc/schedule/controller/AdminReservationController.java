package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.request.RejectReservationRequest;
import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.RoomReservationResponse;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.model.enums.ReservationStatus;
import cm.iusjc.schedule.service.RoomReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/reservations")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminReservationController {
    
    private final RoomReservationService reservationService;
    
    /**
     * Obtenir toutes les réservations
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomReservationResponse>>> getAllReservations(
            @RequestParam(required = false) ReservationStatus status
    ) {
        try {
            log.info("📋 Récupération des réservations (statut: {})", status);
            
            List<RoomReservationResponse> reservations = 
                    reservationService.getAllReservations(status);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Réservations récupérées avec succès",
                    reservations
            ));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des réservations: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("FETCH_FAILED", e.getMessage()));
        }
    }
    
    /**
     * Compter les réservations en attente
     */
    @GetMapping("/pending/count")
    public ResponseEntity<ApiResponse<Long>> countPendingReservations() {
        try {
            long count = reservationService.countPendingReservations();
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Nombre de réservations en attente",
                    count
            ));
        } catch (Exception e) {
            log.error("❌ Erreur lors du comptage: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("COUNT_FAILED", e.getMessage()));
        }
    }
    
    /**
     * Approuver une réservation
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<RoomReservationResponse>> approveReservation(
            @PathVariable UUID id,
            @AuthenticationPrincipal User admin
    ) {
        try {
            log.info("✅ Approbation de la réservation {} par {}", id, admin.getEmail());
            
            RoomReservationResponse response = reservationService.approveReservation(id, admin);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Réservation approuvée avec succès",
                    response
            ));
        } catch (RuntimeException e) {
            log.warn("⚠️ Erreur lors de l'approbation: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("APPROVAL_FAILED", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'approbation: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("APPROVAL_FAILED", e.getMessage()));
        }
    }
    
    /**
     * Rejeter une réservation
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<RoomReservationResponse>> rejectReservation(
            @PathVariable UUID id,
            @Valid @RequestBody RejectReservationRequest request,
            @AuthenticationPrincipal User admin
    ) {
        try {
            log.info("❌ Rejet de la réservation {} par {}", id, admin.getEmail());
            
            RoomReservationResponse response = reservationService.rejectReservation(id, request, admin);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Réservation rejetée",
                    response
            ));
        } catch (RuntimeException e) {
            log.warn("⚠️ Erreur lors du rejet: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("REJECTION_FAILED", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur lors du rejet: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("REJECTION_FAILED", e.getMessage()));
        }
    }
}
