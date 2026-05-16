package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.request.RoomReservationRequest;
import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.RoomReservationResponse;
import cm.iusjc.schedule.model.dto.response.RoomResponse;
import cm.iusjc.schedule.model.entity.Room;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.service.RoomAvailabilityService;
import cm.iusjc.schedule.service.RoomReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher/reservations")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('TEACHER')")
public class TeacherReservationController {
    
    private final RoomReservationService reservationService;
    private final RoomAvailabilityService availabilityService;
    
    /**
     * Créer une nouvelle réservation
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RoomReservationResponse>> createReservation(
            @Valid @RequestBody RoomReservationRequest request,
            @AuthenticationPrincipal User teacher
    ) {
        try {
            log.info("📝 Nouvelle demande de réservation de {}", teacher.getEmail());
            
            RoomReservationResponse response = reservationService.createReservation(request, teacher);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Demande de réservation soumise avec succès",
                    response
            ));
        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Validation échouée: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("VALIDATION_ERROR", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création de la réservation: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("CREATE_FAILED", e.getMessage()));
        }
    }
    
    /**
     * Obtenir mes réservations
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomReservationResponse>>> getMyReservations(
            @AuthenticationPrincipal User teacher
    ) {
        try {
            List<RoomReservationResponse> reservations = 
                    reservationService.getTeacherReservations(teacher);
            
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
     * Obtenir les salles disponibles
     */
    @GetMapping("/available-rooms")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAvailableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam Integer capacity
    ) {
        try {
            log.info("🔍 Recherche de salles disponibles pour le {} de {} à {} (capacité: {})",
                    date, startTime, endTime, capacity);
            
            // Valider la plage horaire
            availabilityService.validateTimeRange(startTime, endTime);
            
            List<Room> availableRooms = availabilityService.getAvailableRooms(
                    date, startTime, endTime, capacity
            );
            
            List<RoomResponse> response = availableRooms.stream()
                    .map(this::mapToRoomResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(
                    String.format("Trouvé %d salle(s) disponible(s)", response.size()),
                    response
            ));
        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Validation échouée: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("VALIDATION_ERROR", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la recherche de salles: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("SEARCH_FAILED", e.getMessage()));
        }
    }
    
    private RoomResponse mapToRoomResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .code(room.getCode())
                .building(room.getBuilding())
                .floor(room.getFloor())
                .number(room.getNumber())
                .capacity(room.getCapacity())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }
}
