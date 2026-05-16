package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.ClassSubgroupResponse;
import cm.iusjc.schedule.service.ClassSubgroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/class-subgroups")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class ClassSubgroupController {
    
    private final ClassSubgroupService classSubgroupService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ClassSubgroupResponse>>> getAllSubgroups() {
        try {
            List<ClassSubgroupResponse> subgroups = classSubgroupService.getAllSubgroups();
            return ResponseEntity.ok(ApiResponse.success(subgroups));
        } catch (Exception e) {
            log.error("❌ Erreur récupération sous-groupes", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_SUBGROUPS_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping("/class/{classGroupId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ClassSubgroupResponse>>> getSubgroupsByClass(
            @PathVariable UUID classGroupId) {
        try {
            List<ClassSubgroupResponse> subgroups = classSubgroupService.getSubgroupsByClassGroup(classGroupId);
            return ResponseEntity.ok(ApiResponse.success(subgroups));
        } catch (Exception e) {
            log.error("❌ Erreur récupération sous-groupes par classe", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_SUBGROUPS_BY_CLASS_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ClassSubgroupResponse>>> getSubgroupsByCourse(
            @PathVariable UUID courseId) {
        try {
            List<ClassSubgroupResponse> subgroups = classSubgroupService.getSubgroupsByCourse(courseId);
            return ResponseEntity.ok(ApiResponse.success(subgroups));
        } catch (Exception e) {
            log.error("❌ Erreur récupération sous-groupes par cours", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_SUBGROUPS_BY_COURSE_FAILED", e.getMessage()));
        }
    }
    
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ClassSubgroupResponse>>> createSubgroups(
            @RequestParam UUID classGroupId,
            @RequestParam UUID courseId,
            @RequestParam UUID roomId) {
        try {
            log.info("📊 Création sous-groupes: classe={}, cours={}, salle={}", 
                    classGroupId, courseId, roomId);
            
            List<ClassSubgroupResponse> subgroups = classSubgroupService.createSubgroupsIfNeeded(
                    classGroupId, courseId, roomId);
            
            if (subgroups.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success(
                        "Aucune division nécessaire - la salle peut accueillir toute la classe", 
                        subgroups));
            }
            
            String message = String.format("✅ %d sous-groupes créés avec succès", subgroups.size());
            return ResponseEntity.ok(ApiResponse.success(message, subgroups));
        } catch (Exception e) {
            log.error("❌ Erreur création sous-groupes", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("CREATE_SUBGROUPS_FAILED", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSubgroup(@PathVariable UUID id) {
        try {
            classSubgroupService.deleteSubgroup(id);
            return ResponseEntity.ok(ApiResponse.success("Sous-groupe supprimé avec succès", null));
        } catch (Exception e) {
            log.error("❌ Erreur suppression sous-groupe", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("DELETE_SUBGROUP_FAILED", e.getMessage()));
        }
    }
    
    @DeleteMapping("/class/{classGroupId}/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSubgroupsByClassAndCourse(
            @PathVariable UUID classGroupId,
            @PathVariable UUID courseId) {
        try {
            classSubgroupService.deleteSubgroupsByClassGroupAndCourse(classGroupId, courseId);
            return ResponseEntity.ok(ApiResponse.success(
                    "Tous les sous-groupes de cette classe pour ce cours ont été supprimés", null));
        } catch (Exception e) {
            log.error("❌ Erreur suppression sous-groupes", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("DELETE_SUBGROUPS_FAILED", e.getMessage()));
        }
    }
}
