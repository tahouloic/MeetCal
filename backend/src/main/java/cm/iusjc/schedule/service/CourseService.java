package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.request.CourseRequest;
import cm.iusjc.schedule.model.dto.response.CourseResponse;
import cm.iusjc.schedule.model.entity.Course;
import cm.iusjc.schedule.model.entity.FieldOfStudy;
import cm.iusjc.schedule.repository.CourseRepository;
import cm.iusjc.schedule.repository.FieldOfStudyRepository;
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
public class CourseService {
    
    private final CourseRepository courseRepository;
    private final FieldOfStudyRepository fieldOfStudyRepository;
    
    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        log.info("📚 Création d'un nouveau cours: {}", request.getLabel());
        
        // Charger la filière
        FieldOfStudy fieldOfStudy = fieldOfStudyRepository.findById(request.getFieldOfStudyId())
                .orElseThrow(() -> new RuntimeException("Filière non trouvée"));
        
        // Générer le code automatiquement
        String code = generateCourseCode();
        
        Course course = Course.builder()
                .code(code)
                .label(request.getLabel())
                .fieldOfStudy(fieldOfStudy)
                .build();
        
        Course savedCourse = courseRepository.save(course);
        log.info("✅ Cours créé avec succès: {} ({})", savedCourse.getName(), savedCourse.getCode());
        
        return mapToResponse(savedCourse);
    }
    
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        log.info("📚 Récupération de tous les cours");
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(UUID id) {
        log.info("📚 Récupération du cours: {}", id);
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        return mapToResponse(course);
    }
    
    @Transactional
    public CourseResponse updateCourse(UUID id, CourseRequest request) {
        log.info("📝 Mise à jour du cours: {}", id);
        
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        
        // Charger la filière
        FieldOfStudy fieldOfStudy = fieldOfStudyRepository.findById(request.getFieldOfStudyId())
                .orElseThrow(() -> new RuntimeException("Filière non trouvée"));
        
        course.setLabel(request.getLabel());
        course.setFieldOfStudy(fieldOfStudy);
        
        Course updatedCourse = courseRepository.save(course);
        
        log.info("✅ Cours mis à jour: {}", updatedCourse.getName());
        return mapToResponse(updatedCourse);
    }
    
    @Transactional
    public void deleteCourse(UUID id) {
        log.info("🗑️ Suppression du cours: {}", id);
        
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        
        courseRepository.delete(course);
        log.info("✅ Cours supprimé: {}", course.getName());
    }
    
    private String generateCourseCode() {
        Integer maxNumber = courseRepository.findMaxCourseNumber();
        int nextNumber = (maxNumber == null) ? 1 : maxNumber + 1;
        return String.format("CRS-%03d", nextNumber);
    }
    
    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .code(course.getCode())
                .label(course.getLabel())
                .fieldOfStudyId(course.getFieldOfStudy().getId())
                .fieldOfStudyName(course.getFieldOfStudy().getName())
                .name(course.getName())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
