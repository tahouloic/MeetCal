package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.request.ClassGroupRequest;
import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.ClassGroupResponse;
import cm.iusjc.schedule.service.ClassGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/class-groups")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class ClassGroupController {
    
    private final ClassGroupService classGroupService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ClassGroupResponse>> createClassGroup(@Valid @RequestBody ClassGroupRequest request) {
        try {
            ClassGroupResponse response = classGroupService.createClassGroup(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Classe créée avec succès", response));
        } catch (Exception e) {
            log.error("❌ Erreur création classe", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("CREATE_CLASS_GROUP_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<ClassGroupResponse>>> getAllClassGroups() {
        try {
            List<ClassGroupResponse> classGroups = classGroupService.getAllClassGroups();
            return ResponseEntity.ok(ApiResponse.success(classGroups));
        } catch (Exception e) {
            log.error("❌ Erreur récupération classes", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_CLASS_GROUPS_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ClassGroupResponse>> getClassGroupById(@PathVariable UUID id) {
        try {
            ClassGroupResponse response = classGroupService.getClassGroupById(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("❌ Erreur récupération classe", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_CLASS_GROUP_FAILED", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ClassGroupResponse>> updateClassGroup(
            @PathVariable UUID id,
            @Valid @RequestBody ClassGroupRequest request) {
        try {
            ClassGroupResponse response = classGroupService.updateClassGroup(id, request);
            return ResponseEntity.ok(ApiResponse.success("Classe mise à jour avec succès", response));
        } catch (Exception e) {
            log.error("❌ Erreur mise à jour classe", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("UPDATE_CLASS_GROUP_FAILED", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteClassGroup(@PathVariable UUID id) {
        try {
            classGroupService.deleteClassGroup(id);
            return ResponseEntity.ok(ApiResponse.success("Classe supprimée avec succès", null));
        } catch (Exception e) {
            log.error("❌ Erreur suppression classe", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("DELETE_CLASS_GROUP_FAILED", e.getMessage()));
        }
    }
}
