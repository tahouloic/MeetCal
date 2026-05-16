package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.request.SchoolRequest;
import cm.iusjc.schedule.model.dto.response.SchoolResponse;
import cm.iusjc.schedule.model.entity.School;
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
public class SchoolService {
    
    private final SchoolRepository schoolRepository;
    
    @Transactional(readOnly = true)
    public List<SchoolResponse> getAllSchools() {
        return schoolRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public SchoolResponse getSchoolById(UUID id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("École non trouvée avec l'ID: " + id));
        return mapToResponse(school);
    }
    
    @Transactional
    public SchoolResponse createSchool(SchoolRequest request) {
        // Vérifier si le code existe déjà
        if (schoolRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Une école avec ce code existe déjà: " + request.getCode());
        }
        
        // Vérifier si le nom existe déjà
        if (schoolRepository.existsByName(request.getName())) {
            throw new RuntimeException("Une école avec ce nom existe déjà: " + request.getName());
        }
        
        School school = School.builder()
                .code(request.getCode())
                .name(request.getName())
                .abbreviation(request.getAbbreviation())
                .build();
        
        school = schoolRepository.save(school);
        log.info("École créée: {} ({})", school.getName(), school.getCode());
        
        return mapToResponse(school);
    }
    
    @Transactional
    public SchoolResponse updateSchool(UUID id, SchoolRequest request) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("École non trouvée avec l'ID: " + id));
        
        // Vérifier si le code existe déjà (sauf pour cette école)
        if (!school.getCode().equals(request.getCode()) && schoolRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Une école avec ce code existe déjà: " + request.getCode());
        }
        
        // Vérifier si le nom existe déjà (sauf pour cette école)
        if (!school.getName().equals(request.getName()) && schoolRepository.existsByName(request.getName())) {
            throw new RuntimeException("Une école avec ce nom existe déjà: " + request.getName());
        }
        
        school.setCode(request.getCode());
        school.setName(request.getName());
        school.setAbbreviation(request.getAbbreviation());
        
        school = schoolRepository.save(school);
        log.info("École mise à jour: {} ({})", school.getName(), school.getCode());
        
        return mapToResponse(school);
    }
    
    @Transactional
    public void deleteSchool(UUID id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("École non trouvée avec l'ID: " + id));
        
        schoolRepository.delete(school);
        log.info("École supprimée: {} ({})", school.getName(), school.getCode());
    }
    
    private SchoolResponse mapToResponse(School school) {
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
