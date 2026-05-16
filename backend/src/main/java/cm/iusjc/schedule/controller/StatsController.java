package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.StatsResponse;
import cm.iusjc.schedule.service.StatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Slf4j
public class StatsController {
    
    private final StatsService statsService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StatsResponse>> getStats() {
        try {
            log.info("📊 Requête de statistiques reçue");
            StatsResponse stats = statsService.getStats();
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des statistiques: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("STATS_ERROR", "Erreur lors de la récupération des statistiques"));
        }
    }
}
