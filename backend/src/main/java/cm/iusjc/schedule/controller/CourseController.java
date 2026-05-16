package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.request.CourseRequest;
import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.CourseResponse;
import cm.iusjc.schedule.service.CourseService;
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
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class CourseController {
    
    private final CourseService courseService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@Valid @RequestBody CourseRequest request) {
        try {
            CourseResponse response = courseService.createCourse(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Cours créé avec succès", response));
        } catch (Exception e) {
            log.error("❌ Erreur création cours", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("CREATE_COURSE_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAllCourses() {
        try {
            List<CourseResponse> courses = courseService.getAllCourses();
            return ResponseEntity.ok(ApiResponse.success(courses));
        } catch (Exception e) {
            log.error("❌ Erreur récupération cours", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_COURSES_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getPublicCourses() {
        try {
            List<CourseResponse> courses = courseService.getAllCourses();
            return ResponseEntity.ok(ApiResponse.success(courses));
        } catch (Exception e) {
            log.error("❌ Erreur récupération cours publics", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_COURSES_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(@PathVariable UUID id) {
        try {
            CourseResponse response = courseService.getCourseById(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("❌ Erreur récupération cours", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_COURSE_FAILED", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable UUID id,
            @Valid @RequestBody CourseRequest request) {
        try {
            CourseResponse response = courseService.updateCourse(id, request);
            return ResponseEntity.ok(ApiResponse.success("Cours mis à jour avec succès", response));
        } catch (Exception e) {
            log.error("❌ Erreur mise à jour cours", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("UPDATE_COURSE_FAILED", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable UUID id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok(ApiResponse.success("Cours supprimé avec succès", null));
        } catch (Exception e) {
            log.error("❌ Erreur suppression cours", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("DELETE_COURSE_FAILED", e.getMessage()));
        }
    }
}
