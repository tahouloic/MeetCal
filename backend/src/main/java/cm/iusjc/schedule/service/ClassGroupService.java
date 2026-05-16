package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.request.ClassGroupRequest;
import cm.iusjc.schedule.model.dto.response.ClassGroupResponse;
import cm.iusjc.schedule.model.entity.ClassGroup;
import cm.iusjc.schedule.model.entity.FieldOfStudy;
import cm.iusjc.schedule.repository.ClassGroupRepository;
import cm.iusjc.schedule.repository.FieldOfStudyRepository;
import cm.iusjc.schedule.repository.StudentRepository;
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
public class ClassGroupService {
    
    private final ClassGroupRepository classGroupRepository;
    private final FieldOfStudyRepository fieldOfStudyRepository;
    private final StudentRepository studentRepository;
    
    @Transactional
    public ClassGroupResponse createClassGroup(ClassGroupRequest request) {
        log.info("🎓 Création d'une nouvelle classe: {} - {}", request.getFieldOfStudyId(), request.getLevel());
        
        // Charger la filière
        FieldOfStudy fieldOfStudy = fieldOfStudyRepository.findById(request.getFieldOfStudyId())
                .orElseThrow(() -> new RuntimeException("Filière non trouvée"));
        
        String code = generateClassGroupCode(request);
        
        ClassGroup classGroup = ClassGroup.builder()
                .code(code)
                .fieldOfStudy(fieldOfStudy)
                .level(request.getLevel())
                .language(request.getLanguage())
                .studentCount(0)
                .build();
        
        ClassGroup savedClassGroup = classGroupRepository.save(classGroup);
        log.info("✅ Classe créée: {} ({})", savedClassGroup.getName(), savedClassGroup.getCode());
        
        return mapToResponse(savedClassGroup);
    }
    
    @Transactional(readOnly = true)
    public List<ClassGroupResponse> getAllClassGroups() {
        return classGroupRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public ClassGroupResponse getClassGroupById(UUID id) {
        ClassGroup classGroup = classGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));
        return mapToResponse(classGroup);
    }
    
    @Transactional
    public ClassGroupResponse updateClassGroup(UUID id, ClassGroupRequest request) {
        ClassGroup classGroup = classGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));
        
        // Charger la filière
        FieldOfStudy fieldOfStudy = fieldOfStudyRepository.findById(request.getFieldOfStudyId())
                .orElseThrow(() -> new RuntimeException("Filière non trouvée"));
        
        classGroup.setFieldOfStudy(fieldOfStudy);
        classGroup.setLevel(request.getLevel());
        classGroup.setLanguage(request.getLanguage());
        
        ClassGroup updatedClassGroup = classGroupRepository.save(classGroup);
        return mapToResponse(updatedClassGroup);
    }
    
    @Transactional
    public void deleteClassGroup(UUID id) {
        ClassGroup classGroup = classGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));
        
        long studentCount = studentRepository.countByClassGroup(classGroup);
        if (studentCount > 0) {
            throw new RuntimeException("Impossible de supprimer une classe contenant des étudiants");
        }
        
        classGroupRepository.delete(classGroup);
    }
    
    @Transactional
    public void updateStudentCount(UUID classGroupId) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));
        
        long count = studentRepository.countByClassGroup(classGroup);
        classGroup.setStudentCount((int) count);
        classGroupRepository.save(classGroup);
    }
    
    private String generateClassGroupCode(ClassGroupRequest request) {
        String levelNum = extractLevelNumber(request.getLevel());
        String langCode = request.getLanguage().name();
        
        String pattern = String.format("CLS-%s-%s-%%", levelNum, langCode);
        Integer maxNumber = classGroupRepository.findMaxClassNumber(pattern);
        int nextNumber = (maxNumber == null) ? 1 : maxNumber + 1;
        
        return String.format("CLS-%s-%s-%03d", levelNum, langCode, nextNumber);
    }
    
    private String extractLevelNumber(String level) {
        return level.replaceAll("[^0-9]", "");
    }
    
    private ClassGroupResponse mapToResponse(ClassGroup classGroup) {
        return ClassGroupResponse.builder()
                .id(classGroup.getId())
                .code(classGroup.getCode())
                .fieldOfStudyId(classGroup.getFieldOfStudy().getId())
                .fieldOfStudyName(classGroup.getFieldOfStudy().getName())
                .name(classGroup.getName())
                .level(classGroup.getLevel())
                .language(classGroup.getLanguage())
                .studentCount(classGroup.getStudentCount())
                .createdAt(classGroup.getCreatedAt())
                .updatedAt(classGroup.getUpdatedAt())
                .build();
    }
}
