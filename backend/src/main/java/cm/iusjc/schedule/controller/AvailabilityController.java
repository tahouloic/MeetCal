package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.request.SaveAvailabilitiesRequest;
import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.AvailabilityResponse;
import cm.iusjc.schedule.model.dto.response.AvailableSlotDTO;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.service.AvailabilityService;
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
@RequestMapping("/api/availabilities")
@RequiredArgsConstructor
@Slf4j
public class AvailabilityController {
    
    private final AvailabilityService availabilityService;
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> saveAvailabilities(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody SaveAvailabilitiesRequest request
    ) {
        try {
            log.info("📅 Requête de sauvegarde des disponibilités pour: {}", user.getEmail());
            AvailabilityResponse response = availabilityService.saveAvailabilities(user, request);
            return ResponseEntity.ok(ApiResponse.success(
                    "Disponibilités enregistrées avec succès",
                    response
            ));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la sauvegarde des disponibilités: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("SAVE_AVAILABILITIES_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> getMyAvailabilities(
            @AuthenticationPrincipal User user
    ) {
        try {
            log.info("📅 Requête de récupération des disponibilités pour: {}", user.getEmail());
            AvailabilityResponse response = availabilityService.getAvailabilities(user);
            log.info("✅ Disponibilités récupérées: {} créneaux", 
                    response.getAvailabilities() != null ? response.getAvailabilities().size() : 0);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des disponibilités: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_AVAILABILITIES_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> getTeacherAvailabilities(
            @PathVariable UUID teacherId
    ) {
        try {
            log.info("📅 Requête admin de récupération des disponibilités pour l'utilisateur: {}", teacherId);
            AvailabilityResponse response = availabilityService.getUserAvailabilities(teacherId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des disponibilités: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_TEACHER_AVAILABILITIES_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping("/slots/{userId}")
    public ResponseEntity<ApiResponse<List<AvailableSlotDTO>>> getUserAvailabilitySlots(
            @PathVariable UUID userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        try {
            log.info("📅 Requête publique de récupération des disponibilités pour l'utilisateur: {}", userId);
            List<AvailableSlotDTO> slots = availabilityService.getUserAvailabilitySlots(userId, startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success(slots));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des disponibilités: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_USER_AVAILABILITIES_FAILED", e.getMessage()));
        }
    }
}
