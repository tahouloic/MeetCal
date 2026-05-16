package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.request.StudentCsvImportRequest;
import cm.iusjc.schedule.model.dto.request.StudentRequest;
import cm.iusjc.schedule.model.dto.response.StudentImportResponse;
import cm.iusjc.schedule.model.dto.response.StudentResponse;
import cm.iusjc.schedule.model.entity.ClassGroup;
import cm.iusjc.schedule.model.entity.Student;
import cm.iusjc.schedule.model.enums.Gender;
import cm.iusjc.schedule.repository.ClassGroupRepository;
import cm.iusjc.schedule.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {
    
    private final StudentRepository studentRepository;
    private final ClassGroupRepository classGroupRepository;
    private final ClassGroupService classGroupService;
    
    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        log.info("👨‍🎓 Création d'un nouvel étudiant: {} {}", request.getFirstName(), request.getLastName());
        
        ClassGroup classGroup = classGroupRepository.findById(request.getClassGroupId())
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));
        
        cm.iusjc.schedule.model.enums.School schoolEnum = convertSchoolEntityToEnum(classGroup.getFieldOfStudy().getSchool());
        String matricule = generateStudentMatricule(schoolEnum);
        
        Student student = Student.builder()
                .matricule(matricule)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .classGroup(classGroup)
                .school(schoolEnum)
                .build();
        
        Student savedStudent = studentRepository.save(student);
        
        // Mettre à jour l'effectif de la classe
        classGroupService.updateStudentCount(classGroup.getId());
        
        log.info("✅ Étudiant créé: {} ({})", savedStudent.getMatricule(), savedStudent.getFirstName());
        
        return mapToResponse(savedStudent);
    }
    
    @Transactional(readOnly = true)
    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public StudentResponse getStudentById(UUID id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
        return mapToResponse(student);
    }
    
    @Transactional
    public StudentResponse updateStudent(UUID id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
        
        UUID oldClassGroupId = student.getClassGroup().getId();
        
        ClassGroup newClassGroup = classGroupRepository.findById(request.getClassGroupId())
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));
        
        cm.iusjc.schedule.model.enums.School newSchoolEnum = convertSchoolEntityToEnum(newClassGroup.getFieldOfStudy().getSchool());
        
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setGender(request.getGender());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setClassGroup(newClassGroup);
        student.setSchool(newSchoolEnum);
        
        Student updatedStudent = studentRepository.save(student);
        
        // Mettre à jour les effectifs
        classGroupService.updateStudentCount(oldClassGroupId);
        if (!oldClassGroupId.equals(newClassGroup.getId())) {
            classGroupService.updateStudentCount(newClassGroup.getId());
        }
        
        return mapToResponse(updatedStudent);
    }
    
    @Transactional
    public void deleteStudent(UUID id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
        
        UUID classGroupId = student.getClassGroup().getId();
        
        studentRepository.delete(student);
        
        // Mettre à jour l'effectif de la classe
        classGroupService.updateStudentCount(classGroupId);
    }
    
    @Transactional
    public StudentImportResponse importStudentsFromCsv(MultipartFile file) {
        log.info("📥 Import CSV d'étudiants: {}", file.getOriginalFilename());
        
        StudentImportResponse response = StudentImportResponse.builder()
                .totalRows(0)
                .successCount(0)
                .errorCount(0)
                .build();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            int lineNumber = 0;
            boolean isHeader = true;
            
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                
                // Ignorer la ligne d'en-tête
                if (isHeader) {
                    isHeader = false;
                    continue;
                }
                
                response.setTotalRows(response.getTotalRows() + 1);
                
                try {
                    StudentCsvImportRequest csvRequest = parseCsvLine(line);
                    StudentResponse importedStudent = createStudentFromCsv(csvRequest);
                    response.getImportedStudents().add(importedStudent);
                    response.setSuccessCount(response.getSuccessCount() + 1);
                } catch (Exception e) {
                    response.setErrorCount(response.getErrorCount() + 1);
                    response.getErrors().add(String.format("Ligne %d: %s", lineNumber, e.getMessage()));
                    log.error("❌ Erreur ligne {}: {}", lineNumber, e.getMessage());
                }
            }
            
            log.info("✅ Import terminé: {} succès, {} erreurs", response.getSuccessCount(), response.getErrorCount());
            
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'import CSV", e);
            throw new RuntimeException("Erreur lors de la lecture du fichier CSV: " + e.getMessage());
        }
        
        return response;
    }
    
    private StudentCsvImportRequest parseCsvLine(String line) {
        String[] fields = line.split(",");
        
        if (fields.length < 5) {
            throw new RuntimeException("Format CSV invalide: nombre de colonnes insuffisant");
        }
        
        return StudentCsvImportRequest.builder()
                .firstName(fields[0].trim())
                .lastName(fields[1].trim())
                .gender(Gender.valueOf(fields[2].trim().toUpperCase()))
                .dateOfBirth(LocalDate.parse(fields[3].trim()))
                .classCode(fields[4].trim())
                .build();
    }
    
    private StudentResponse createStudentFromCsv(StudentCsvImportRequest csvRequest) {
        ClassGroup classGroup = classGroupRepository.findByCode(csvRequest.getClassCode())
                .orElseThrow(() -> new RuntimeException("Classe non trouvée: " + csvRequest.getClassCode()));
        
        cm.iusjc.schedule.model.enums.School schoolEnum = convertSchoolEntityToEnum(classGroup.getFieldOfStudy().getSchool());
        String matricule = generateStudentMatricule(schoolEnum);
        
        Student student = Student.builder()
                .matricule(matricule)
                .firstName(csvRequest.getFirstName())
                .lastName(csvRequest.getLastName())
                .gender(csvRequest.getGender())
                .dateOfBirth(csvRequest.getDateOfBirth())
                .classGroup(classGroup)
                .school(schoolEnum)
                .build();
        
        Student savedStudent = studentRepository.save(student);
        classGroupService.updateStudentCount(classGroup.getId());
        
        return mapToResponse(savedStudent);
    }
    
    private String generateStudentMatricule(cm.iusjc.schedule.model.enums.School school) {
        int currentYear = Year.now().getValue();
        String schoolPrefix;
        
        switch (school) {
            case SJI:
                schoolPrefix = "SJI";
                break;
            case SJM:
                schoolPrefix = "SJM";
                break;
            case PREPA_VOGT:
                schoolPrefix = "PV";
                break;
            case CPGE:
                schoolPrefix = "CPGE";
                break;
            default:
                throw new RuntimeException("École non reconnue");
        }
        
        String pattern = String.format("%s-%d-%%", schoolPrefix, currentYear);
        Integer maxNumber = studentRepository.findMaxStudentNumber(pattern);
        int nextNumber = (maxNumber == null) ? 1 : maxNumber + 1;
        
        return String.format("%s-%d-%03d", schoolPrefix, currentYear, nextNumber);
    }
    
    private cm.iusjc.schedule.model.enums.School convertSchoolEntityToEnum(cm.iusjc.schedule.model.entity.School schoolEntity) {
        if (schoolEntity == null) {
            throw new RuntimeException("École non définie");
        }
        return cm.iusjc.schedule.model.enums.School.valueOf(schoolEntity.getCode());
    }
    
    private StudentResponse mapToResponse(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .matricule(student.getMatricule())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .gender(student.getGender())
                .dateOfBirth(student.getDateOfBirth())
                .school(student.getSchool())
                .classGroup(mapClassGroupToResponse(student.getClassGroup()))
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
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
}
