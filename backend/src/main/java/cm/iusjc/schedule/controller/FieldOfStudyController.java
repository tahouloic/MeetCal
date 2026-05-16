package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.request.FieldOfStudyRequest;
import cm.iusjc.schedule.model.dto.response.FieldOfStudyResponse;
import cm.iusjc.schedule.service.FieldOfStudyService;
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
@RequestMapping("/api/fields-of-study")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class FieldOfStudyController {
    
    private final FieldOfStudyService fieldOfStudyService;
    
    @GetMapping
    public ResponseEntity<List<FieldOfStudyResponse>> getAllFieldsOfStudy() {
        List<FieldOfStudyResponse> fieldsOfStudy = fieldOfStudyService.getAllFieldsOfStudy();
        return ResponseEntity.ok(fieldsOfStudy);
    }
    
    @GetMapping("/by-school/{schoolId}")
    public ResponseEntity<List<FieldOfStudyResponse>> getFieldsOfStudyBySchool(@PathVariable UUID schoolId) {
        List<FieldOfStudyResponse> fieldsOfStudy = fieldOfStudyService.getFieldsOfStudyBySchool(schoolId);
        return ResponseEntity.ok(fieldsOfStudy);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FieldOfStudyResponse> getFieldOfStudyById(@PathVariable UUID id) {
        FieldOfStudyResponse fieldOfStudy = fieldOfStudyService.getFieldOfStudyById(id);
        return ResponseEntity.ok(fieldOfStudy);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FieldOfStudyResponse> createFieldOfStudy(@Valid @RequestBody FieldOfStudyRequest request) {
        FieldOfStudyResponse fieldOfStudy = fieldOfStudyService.createFieldOfStudy(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(fieldOfStudy);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FieldOfStudyResponse> updateFieldOfStudy(
            @PathVariable UUID id,
            @Valid @RequestBody FieldOfStudyRequest request) {
        FieldOfStudyResponse fieldOfStudy = fieldOfStudyService.updateFieldOfStudy(id, request);
        return ResponseEntity.ok(fieldOfStudy);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFieldOfStudy(@PathVariable UUID id) {
        fieldOfStudyService.deleteFieldOfStudy(id);
        return ResponseEntity.noContent().build();
    }
}
