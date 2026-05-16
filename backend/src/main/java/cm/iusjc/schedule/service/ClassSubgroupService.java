package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.response.ClassSubgroupResponse;
import cm.iusjc.schedule.model.entity.ClassGroup;
import cm.iusjc.schedule.model.entity.ClassSubgroup;
import cm.iusjc.schedule.model.entity.Course;
import cm.iusjc.schedule.model.entity.Room;
import cm.iusjc.schedule.repository.ClassGroupRepository;
import cm.iusjc.schedule.repository.ClassSubgroupRepository;
import cm.iusjc.schedule.repository.CourseRepository;
import cm.iusjc.schedule.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassSubgroupService {
    
    private final ClassSubgroupRepository classSubgroupRepository;
    private final ClassGroupRepository classGroupRepository;
    private final CourseRepository courseRepository;
    private final RoomRepository roomRepository;
    
    @Transactional(readOnly = true)
    public List<ClassSubgroupResponse> getAllSubgroups() {
        return classSubgroupRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ClassSubgroupResponse> getSubgroupsByClassGroup(UUID classGroupId) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));
        
        return classSubgroupRepository.findByClassGroup(classGroup).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ClassSubgroupResponse> getSubgroupsByCourse(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        
        return classSubgroupRepository.findByCourse(course).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Crée automatiquement des sous-groupes si la salle est trop petite
     * @param classGroupId ID de la classe
     * @param courseId ID du cours
     * @param roomId ID de la salle
     * @return Liste des sous-groupes créés (vide si pas de division nécessaire)
     */
    @Transactional
    public List<ClassSubgroupResponse> createSubgroupsIfNeeded(UUID classGroupId, UUID courseId, UUID roomId) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Salle non trouvée"));
        
        List<ClassSubgroupResponse> subgroups = new ArrayList<>();
        
        // Vérifier si la salle peut accueillir toute la classe
        if (classGroup.getStudentCount() <= room.getCapacity()) {
            log.info("✅ La salle {} peut accueillir toute la classe {} ({} étudiants)", 
                    room.getCode(), classGroup.getName(), classGroup.getStudentCount());
            return subgroups; // Pas besoin de diviser
        }
        
        // Calculer le nombre de groupes nécessaires
        int numberOfGroups = (int) Math.ceil((double) classGroup.getStudentCount() / room.getCapacity());
        int studentsPerGroup = (int) Math.ceil((double) classGroup.getStudentCount() / numberOfGroups);
        
        log.info("📊 Division nécessaire: {} étudiants, capacité {}, {} groupes de ~{} étudiants",
                classGroup.getStudentCount(), room.getCapacity(), numberOfGroups, studentsPerGroup);
        
        // Créer les sous-groupes
        for (int i = 1; i <= numberOfGroups; i++) {
            String code = generateSubgroupCode(classGroup, course, i);
            String name = generateSubgroupName(classGroup, course, i);
            
            // Calculer l'effectif de ce groupe
            int groupStudentCount;
            if (i == numberOfGroups) {
                // Dernier groupe: prend les étudiants restants
                groupStudentCount = classGroup.getStudentCount() - (studentsPerGroup * (numberOfGroups - 1));
            } else {
                groupStudentCount = studentsPerGroup;
            }
            
            ClassSubgroup subgroup = ClassSubgroup.builder()
                    .code(code)
                    .name(name)
                    .classGroup(classGroup)
                    .course(course)
                    .groupNumber(i)
                    .studentCount(groupStudentCount)
                    .build();
            
            ClassSubgroup savedSubgroup = classSubgroupRepository.save(subgroup);
            subgroups.add(mapToResponse(savedSubgroup));
            
            log.info("✅ Sous-groupe créé: {} ({} étudiants)", savedSubgroup.getCode(), savedSubgroup.getStudentCount());
        }
        
        return subgroups;
    }
    
    @Transactional
    public void deleteSubgroup(UUID id) {
        ClassSubgroup subgroup = classSubgroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sous-groupe non trouvé"));
        
        classSubgroupRepository.delete(subgroup);
        log.info("✅ Sous-groupe supprimé: {}", subgroup.getCode());
    }
    
    @Transactional
    public void deleteSubgroupsByClassGroupAndCourse(UUID classGroupId, UUID courseId) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        
        List<ClassSubgroup> subgroups = classSubgroupRepository.findByClassGroupAndCourse(classGroup, course);
        classSubgroupRepository.deleteAll(subgroups);
        
        log.info("✅ {} sous-groupes supprimés pour {} - {}", 
                subgroups.size(), classGroup.getName(), course.getName());
    }
    
    private String generateSubgroupCode(ClassGroup classGroup, Course course, int groupNumber) {
        String classAbbr = abbreviateClassName(classGroup.getName(), classGroup.getLevel());
        String courseAbbr = abbreviateCourseName(course.getName());
        return String.format("%s-%s-G%d", classAbbr, courseAbbr, groupNumber);
    }
    
    private String generateSubgroupName(ClassGroup classGroup, Course course, int groupNumber) {
        return String.format("%s %s - %s - Groupe %d", 
                classGroup.getName(), classGroup.getLevel(), course.getName(), groupNumber);
    }
    
    private String abbreviateClassName(String name, String level) {
        // Extraire les initiales et le niveau
        String[] words = name.split(" ");
        StringBuilder abbr = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                abbr.append(word.charAt(0));
            }
        }
        String levelNum = level.replaceAll("[^0-9]", "");
        return abbr.toString().toUpperCase() + levelNum;
    }
    
    private String abbreviateCourseName(String name) {
        // Prendre les 4 premières lettres ou les initiales
        if (name.length() <= 4) {
            return name.toUpperCase();
        }
        
        String[] words = name.split(" ");
        if (words.length > 1) {
            StringBuilder abbr = new StringBuilder();
            for (String word : words) {
                if (!word.isEmpty()) {
                    abbr.append(word.charAt(0));
                }
            }
            return abbr.toString().toUpperCase();
        }
        
        return name.substring(0, 4).toUpperCase();
    }
    
    private ClassSubgroupResponse mapToResponse(ClassSubgroup subgroup) {
        return ClassSubgroupResponse.builder()
                .id(subgroup.getId())
                .code(subgroup.getCode())
                .name(subgroup.getName())
                .groupNumber(subgroup.getGroupNumber())
                .studentCount(subgroup.getStudentCount())
                .classGroup(mapClassGroupToResponse(subgroup.getClassGroup()))
                .course(mapCourseToResponse(subgroup.getCourse()))
                .createdAt(subgroup.getCreatedAt())
                .updatedAt(subgroup.getUpdatedAt())
                .build();
    }
    
    private cm.iusjc.schedule.model.dto.response.ClassGroupResponse mapClassGroupToResponse(ClassGroup classGroup) {
        return cm.iusjc.schedule.model.dto.response.ClassGroupResponse.builder()
                .id(classGroup.getId())
                .code(classGroup.getCode())
                .name(classGroup.getName())
                .level(classGroup.getLevel())
                .language(classGroup.getLanguage())
                .fieldOfStudyId(classGroup.getFieldOfStudy().getId())
                .fieldOfStudyName(classGroup.getFieldOfStudy().getName())
                .studentCount(classGroup.getStudentCount())
                .build();
    }
    
    private cm.iusjc.schedule.model.dto.response.CourseResponse mapCourseToResponse(Course course) {
        return cm.iusjc.schedule.model.dto.response.CourseResponse.builder()
                .id(course.getId())
                .code(course.getCode())
                .name(course.getName())
                .build();
    }
}
