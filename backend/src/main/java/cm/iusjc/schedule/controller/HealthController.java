package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "healthy");
        healthData.put("timestamp", LocalDateTime.now());
        healthData.put("service", "IUSJC Schedule Management API");
        healthData.put("version", "1.0.0");
        
        Map<String, Object> services = new HashMap<>();
        services.put("server", Map.of(
                "status", "running",
                "uptime", ManagementFactory.getRuntimeMXBean().getUptime()
        ));
        services.put("database", Map.of("status", "connected", "type", "PostgreSQL"));
        
        healthData.put("services", services);
        
        return ResponseEntity.ok(ApiResponse.success(healthData));
    }
}
