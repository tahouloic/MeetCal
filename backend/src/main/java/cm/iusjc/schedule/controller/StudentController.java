package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.request.StudentRequest;
import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.StudentImportResponse;
import cm.iusjc.schedule.model.dto.response.StudentResponse;
import cm.iusjc.schedule.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class StudentController {
    
    private final StudentService studentService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(@Valid @RequestBody StudentRequest request) {
        try {
            StudentResponse response = studentService.createStudent(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Étudiant créé avec succès", response));
        } catch (Exception e) {
            log.error("❌ Erreur création étudiant", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("CREATE_STUDENT_FAILED", e.getMessage()));
        }
    }
    
    @PostMapping(value = "/import-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentImportResponse>> importStudentsFromCsv(
            @RequestParam("file") MultipartFile file) {
        try {
            log.info("📥 Réception fichier CSV: {}", file.getOriginalFilename());
            
            // Vérifier le type de fichier
            if (!file.getOriginalFilename().endsWith(".csv")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("INVALID_FILE_TYPE", "Le fichier doit être au format CSV"));
            }
            
            StudentImportResponse response = studentService.importStudentsFromCsv(file);
            
            String message = String.format("Import terminé: %d succès, %d erreurs", 
                    response.getSuccessCount(), response.getErrorCount());
            
            return ResponseEntity.ok(ApiResponse.success(message, response));
        } catch (Exception e) {
            log.error("❌ Erreur import CSV", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("IMPORT_CSV_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getAllStudents() {
        try {
            List<StudentResponse> students = studentService.getAllStudents();
            return ResponseEntity.ok(ApiResponse.success(students));
        } catch (Exception e) {
            log.error("❌ Erreur récupération étudiants", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_STUDENTS_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentById(@PathVariable UUID id) {
        try {
            StudentResponse response = studentService.getStudentById(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("❌ Erreur récupération étudiant", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_STUDENT_FAILED", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(
            @PathVariable UUID id,
            @Valid @RequestBody StudentRequest request) {
        try {
            StudentResponse response = studentService.updateStudent(id, request);
            return ResponseEntity.ok(ApiResponse.success("Étudiant mis à jour avec succès", response));
        } catch (Exception e) {
            log.error("❌ Erreur mise à jour étudiant", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("UPDATE_STUDENT_FAILED", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable UUID id) {
        try {
            studentService.deleteStudent(id);
            return ResponseEntity.ok(ApiResponse.success("Étudiant supprimé avec succès", null));
        } catch (Exception e) {
            log.error("❌ Erreur suppression étudiant", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("DELETE_STUDENT_FAILED", e.getMessage()));
        }
    }
}
