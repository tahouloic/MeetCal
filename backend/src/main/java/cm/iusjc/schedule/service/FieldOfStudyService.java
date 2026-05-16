package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.request.FieldOfStudyRequest;
import cm.iusjc.schedule.model.dto.response.FieldOfStudyResponse;
import cm.iusjc.schedule.model.dto.response.SchoolResponse;
import cm.iusjc.schedule.model.entity.FieldOfStudy;
import cm.iusjc.schedule.model.entity.School;
import cm.iusjc.schedule.repository.FieldOfStudyRepository;
import cm.iusjc.schedule.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FieldOfStudyService {
    
    private final FieldOfStudyRepository fieldOfStudyRepository;
    private final SchoolRepository schoolRepository;
    
    @Transactional(readOnly = true)
    public List<FieldOfStudyResponse> getAllFieldsOfStudy() {
        return fieldOfStudyRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<FieldOfStudyResponse> getFieldsOfStudyBySchool(UUID schoolId) {
        return fieldOfStudyRepository.findBySchoolId(schoolId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public FieldOfStudyResponse getFieldOfStudyById(UUID id) {
        FieldOfStudy fieldOfStudy = fieldOfStudyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Filière non trouvée avec l'ID: " + id));
        return mapToResponse(fieldOfStudy);
    }
    
    @Transactional
    public FieldOfStudyResponse createFieldOfStudy(FieldOfStudyRequest request) {
        School school = schoolRepository.findById(request.getSchoolId())
                .orElseThrow(() -> new RuntimeException("École non trouvée avec l'ID: " + request.getSchoolId()));
        
        // Vérifier si la filière existe déjà pour cette école
        if (fieldOfStudyRepository.existsByLabelAndSchool(request.getLabel(), school)) {
            throw new RuntimeException("Une filière avec ce libellé existe déjà pour cette école");
        }
        
        // Générer le code automatiquement
        String code = generateCode();
        
        FieldOfStudy fieldOfStudy = FieldOfStudy.builder()
                .code(code)
                .label(request.getLabel())
                .school(school)
                .build();
        
        // Le nom sera généré automatiquement par @PrePersist
        fieldOfStudy = fieldOfStudyRepository.save(fieldOfStudy);
        log.info("Filière créée: {} ({})", fieldOfStudy.getName(), fieldOfStudy.getCode());
        
        return mapToResponse(fieldOfStudy);
    }
    
    @Transactional
    public FieldOfStudyResponse updateFieldOfStudy(UUID id, FieldOfStudyRequest request) {
        FieldOfStudy fieldOfStudy = fieldOfStudyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Filière non trouvée avec l'ID: " + id));
        
        School school = schoolRepository.findById(request.getSchoolId())
                .orElseThrow(() -> new RuntimeException("École non trouvée avec l'ID: " + request.getSchoolId()));
        
        // Vérifier si la filière existe déjà pour cette école (sauf pour cette filière)
        if (!fieldOfStudy.getLabel().equals(request.getLabel()) || !fieldOfStudy.getSchool().getId().equals(school.getId())) {
            if (fieldOfStudyRepository.existsByLabelAndSchool(request.getLabel(), school)) {
                throw new RuntimeException("Une filière avec ce libellé existe déjà pour cette école");
            }
        }
        
        fieldOfStudy.setLabel(request.getLabel());
        fieldOfStudy.setSchool(school);
        
        // Le nom sera régénéré automatiquement par @PreUpdate
        fieldOfStudy = fieldOfStudyRepository.save(fieldOfStudy);
        log.info("Filière mise à jour: {} ({})", fieldOfStudy.getName(), fieldOfStudy.getCode());
        
        return mapToResponse(fieldOfStudy);
    }
    
    @Transactional
    public void deleteFieldOfStudy(UUID id) {
        FieldOfStudy fieldOfStudy = fieldOfStudyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Filière non trouvée avec l'ID: " + id));
        
        fieldOfStudyRepository.delete(fieldOfStudy);
        log.info("Filière supprimée: {} ({})", fieldOfStudy.getName(), fieldOfStudy.getCode());
    }
    
    private String generateCode() {
        long count = fieldOfStudyRepository.count();
        return String.format("FOS-%03d", count + 1);
    }
    
    private FieldOfStudyResponse mapToResponse(FieldOfStudy fieldOfStudy) {
        return FieldOfStudyResponse.builder()
                .id(fieldOfStudy.getId())
                .code(fieldOfStudy.getCode())
                .label(fieldOfStudy.getLabel())
                .name(fieldOfStudy.getName())
                .school(mapSchoolToResponse(fieldOfStudy.getSchool()))
                .createdAt(fieldOfStudy.getCreatedAt())
                .updatedAt(fieldOfStudy.getUpdatedAt())
                .build();
    }
    
    private SchoolResponse mapSchoolToResponse(School school) {
        return SchoolResponse.builder()
                .id(school.getId())
                .code(school.getCode())
                .name(school.getName())
                .abbreviation(school.getAbbreviation())
                .createdAt(school.getCreatedAt())
                .updatedAt(school.getUpdatedAt())
                .build();
    }
}
