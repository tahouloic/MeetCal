package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.TeacherResponse;
import cm.iusjc.schedule.model.dto.response.UserResponse;
import cm.iusjc.schedule.model.entity.Teacher;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.model.enums.UserRole;
import cm.iusjc.schedule.model.enums.UserStatus;
import cm.iusjc.schedule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeacherController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTeachers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        try {
            log.info("📚 Récupération des enseignants - Page: {}, Limit: {}", page, limit);
            
            // Spring Data JPA pages start at 0
            Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
            
            Page<User> teachersPage = userRepository.findByRoleAndStatus(
                UserRole.TEACHER, 
                UserStatus.ACTIVE, 
                pageable
            );
            
            List<TeacherResponse> teachers = teachersPage.getContent().stream()
                    .map(this::mapToTeacherResponse)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", teachers);
            response.put("pagination", Map.of(
                "currentPage", page,
                "totalPages", teachersPage.getTotalPages(),
                "totalItems", teachersPage.getTotalElements(),
                "itemsPerPage", limit
            ));
            
            log.info("✅ {} enseignants trouvés", teachers.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des enseignants", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la récupération des enseignants: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeacherResponse>> getTeacherById(@PathVariable String id) {
        try {
            log.info("🔍 Récupération de l'enseignant: {}", id);
            
            User teacher = userRepository.findById(UUID.fromString(id))
                    .filter(u -> u.getRole() == UserRole.TEACHER)
                    .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
            
            TeacherResponse response = mapToTeacherResponse(teacher);
            
            return ResponseEntity.ok(ApiResponse.success("Enseignant récupéré avec succès", response));
            
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de l'enseignant", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Erreur lors de la récupération de l'enseignant: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<TeacherResponse>> getTeacherByUserId(@PathVariable UUID userId) {
        try {
            log.info("🔍 Récupération de l'enseignant par userId: {}", userId);
            
            User user = userRepository.findById(userId)
                    .filter(u -> u.getRole() == UserRole.TEACHER)
                    .orElseThrow(() -> new RuntimeException("Enseignant non trouvé pour cet utilisateur"));
            
            TeacherResponse response = mapToTeacherResponse(user);
            
            log.info("✅ Enseignant trouvé: {}", user.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Enseignant récupéré avec succès", response));
            
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de l'enseignant par userId", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Erreur: " + e.getMessage()));
        }
    }

    private TeacherResponse mapToTeacherResponse(User user) {
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
        
        // Get teacher-specific data if available
        if (user.getTeacher() != null) {
            Teacher teacher = user.getTeacher();
            
            TeacherResponse response = TeacherResponse.builder()
                    .id(teacher.getId()) // ID du Teacher, pas du User!
                    .user(userResponse)
                    .specialty(teacher.getSpecialty())
                    .schools(mapSchoolsToResponse(teacher.getSchools()))
                    .isActive(teacher.getIsActive())
                    .isApproved(teacher.isApproved())
                    .createdAt(teacher.getCreatedAt())
                    .updatedAt(teacher.getUpdatedAt())
                    .build();
            
            return response;
        } else {
            // Si pas de Teacher associé, utiliser l'ID du User
            TeacherResponse response = TeacherResponse.builder()
                    .id(user.getId())
                    .user(userResponse)
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();
            
            return response;
        }
    }
    
    private java.util.Set<cm.iusjc.schedule.model.dto.response.SchoolResponse> mapSchoolsToResponse(java.util.Set<cm.iusjc.schedule.model.entity.School> schools) {
        if (schools == null) {
            return new java.util.HashSet<>();
        }
        return schools.stream()
                .map(school -> cm.iusjc.schedule.model.dto.response.SchoolResponse.builder()
                        .id(school.getId())
                        .code(school.getCode())
                        .name(school.getName())
                        .abbreviation(school.getAbbreviation())
                        .createdAt(school.getCreatedAt())
                        .updatedAt(school.getUpdatedAt())
                        .build())
                .collect(Collectors.toSet());
    }
}
