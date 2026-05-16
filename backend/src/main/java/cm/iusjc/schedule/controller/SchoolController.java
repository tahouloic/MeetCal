package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.request.SchoolRequest;
import cm.iusjc.schedule.model.dto.response.SchoolResponse;
import cm.iusjc.schedule.service.SchoolService;
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
@RequestMapping("/api/schools")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class SchoolController {
    
    private final SchoolService schoolService;
    
    @GetMapping
    public ResponseEntity<List<SchoolResponse>> getAllSchools() {
        List<SchoolResponse> schools = schoolService.getAllSchools();
        return ResponseEntity.ok(schools);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SchoolResponse> getSchoolById(@PathVariable UUID id) {
        SchoolResponse school = schoolService.getSchoolById(id);
        return ResponseEntity.ok(school);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolResponse> createSchool(@Valid @RequestBody SchoolRequest request) {
        SchoolResponse school = schoolService.createSchool(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(school);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolResponse> updateSchool(
            @PathVariable UUID id,
            @Valid @RequestBody SchoolRequest request) {
        SchoolResponse school = schoolService.updateSchool(id, request);
        return ResponseEntity.ok(school);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSchool(@PathVariable UUID id) {
        schoolService.deleteSchool(id);
        return ResponseEntity.noContent().build();
    }
}
