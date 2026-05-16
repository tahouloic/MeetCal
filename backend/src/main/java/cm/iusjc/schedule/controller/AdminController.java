package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.UserResponse;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        try {
            Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") 
                ? Sort.Direction.ASC 
                : Sort.Direction.DESC;
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            Page<UserResponse> users = adminService.getAllUsers(search, pageable);
            
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des utilisateurs: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("FETCH_USERS_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping("/users/recent")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getRecentUsers(
            @RequestParam(defaultValue = "3") int limit
    ) {
        try {
            List<UserResponse> users = adminService.getRecentUsers(limit);
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des utilisateurs récents: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("FETCH_RECENT_USERS_FAILED", e.getMessage()));
        }
    }
    
    @PutMapping("/users/{userId}/block")
    public ResponseEntity<ApiResponse<Void>> blockUser(
            @PathVariable UUID userId,
            @AuthenticationPrincipal User admin
    ) {
        try {
            adminService.blockUser(userId, admin);
            return ResponseEntity.ok(ApiResponse.success(
                    "Utilisateur bloqué avec succès",
                    null
            ));
        } catch (Exception e) {
            log.error("Erreur lors du blocage de l'utilisateur: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("BLOCK_USER_FAILED", e.getMessage()));
        }
    }
    
    @PutMapping("/users/{userId}/unblock")
    public ResponseEntity<ApiResponse<Void>> unblockUser(
            @PathVariable UUID userId,
            @AuthenticationPrincipal User admin
    ) {
        try {
            adminService.unblockUser(userId, admin);
            return ResponseEntity.ok(ApiResponse.success(
                    "Utilisateur débloqué avec succès",
                    null
            ));
        } catch (Exception e) {
            log.error("Erreur lors du déblocage de l'utilisateur: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("UNBLOCK_USER_FAILED", e.getMessage()));
        }
    }
}
