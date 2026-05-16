package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.request.ValidateTeacherRequest;
import cm.iusjc.schedule.model.dto.response.TeacherResponse;
import cm.iusjc.schedule.model.dto.response.UserResponse;
import cm.iusjc.schedule.model.entity.Teacher;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.model.enums.UserStatus;
import cm.iusjc.schedule.repository.TeacherRepository;
import cm.iusjc.schedule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    public List<TeacherResponse> getPendingTeachers() {
        List<Teacher> pendingTeachers = teacherRepository.findPendingTeachers();
        return pendingTeachers.stream()
                .map(this::mapToTeacherResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public TeacherResponse validateTeacher(UUID teacherId, ValidateTeacherRequest request, User admin) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
        
        User teacherUser = teacher.getUser();
        
        if ("approve".equals(request.getAction())) {
            // Générer un mot de passe temporaire
            String temporaryPassword = generateTemporaryPassword();
            
            // Approuver l'enseignant
            teacherUser.setStatus(UserStatus.ACTIVE);
            teacherUser.setPassword(passwordEncoder.encode(temporaryPassword));
            teacher.setApprovedBy(admin);
            teacher.setApprovedAt(LocalDateTime.now());
            teacher.setIsActive(true);
            teacher.setRejectionReason(null);
            
            // Envoyer email d'approbation avec le mot de passe (ne pas bloquer si échec)
            try {
                emailService.sendTeacherApprovalEmail(
                        teacherUser.getEmail(),
                        teacherUser.getFirstName(),
                        temporaryPassword
                );
                log.info("✅ Email d'approbation envoyé à: {}", teacherUser.getEmail());
            } catch (Exception e) {
                log.warn("⚠️ Impossible d'envoyer l'email d'approbation: {}", e.getMessage());
            }
            
            // Envoyer email de bienvenue (ne pas bloquer si échec)
            try {
                emailService.sendWelcomeEmail(
                        teacherUser.getEmail(),
                        teacherUser.getFirstName()
                );
                log.info("✅ Email de bienvenue envoyé à: {}", teacherUser.getEmail());
            } catch (Exception e) {
                log.warn("⚠️ Impossible d'envoyer l'email de bienvenue: {}", e.getMessage());
            }
            
            log.info("Enseignant approuvé: {} par {}", teacherUser.getEmail(), admin.getEmail());
            
        } else if ("reject".equals(request.getAction())) {
            // Rejeter l'enseignant
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new RuntimeException("La raison du rejet est obligatoire");
            }
            
            teacherUser.setStatus(UserStatus.REJECTED);
            teacher.setRejectionReason(request.getRejectionReason());
            teacher.setIsActive(false);
            
            // Envoyer email de rejet (ne pas bloquer si échec)
            try {
                emailService.sendTeacherRejectionEmail(
                        teacherUser.getEmail(),
                        teacherUser.getFirstName(),
                        request.getRejectionReason()
                );
                log.info("✅ Email de rejet envoyé à: {}", teacherUser.getEmail());
            } catch (Exception e) {
                log.warn("⚠️ Impossible d'envoyer l'email de rejet: {}", e.getMessage());
            }
            
            log.info("Enseignant rejeté: {} par {}", teacherUser.getEmail(), admin.getEmail());
            
        } else {
            throw new RuntimeException("Action invalide. Utilisez 'approve' ou 'reject'");
        }
        
        userRepository.save(teacherUser);
        teacherRepository.save(teacher);
        
        return mapToTeacherResponse(teacher);
    }
    
    public List<TeacherResponse> getAllTeachers() {
        List<Teacher> teachers = teacherRepository.findAll();
        return teachers.stream()
                .map(this::mapToTeacherResponse)
                .collect(Collectors.toList());
    }
    
    public TeacherResponse getTeacherById(UUID teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
        return mapToTeacherResponse(teacher);
    }
    
    private TeacherResponse mapToTeacherResponse(Teacher teacher) {
        return TeacherResponse.builder()
                .id(teacher.getId())
                .user(mapToUserResponse(teacher.getUser()))
                .specialty(teacher.getSpecialty())
                .schools(mapSchoolsToResponse(teacher.getSchools()))
                .isActive(teacher.getIsActive())
                .isApproved(teacher.isApproved())
                .rejectionReason(teacher.getRejectionReason())
                .approvedAt(teacher.getApprovedAt())
                .createdAt(teacher.getCreatedAt())
                .updatedAt(teacher.getUpdatedAt())
                .build();
    }
    
    private java.util.Set<cm.iusjc.schedule.model.dto.response.SchoolResponse> mapSchoolsToResponse(java.util.Set<cm.iusjc.schedule.model.entity.School> schools) {
        if (schools == null) {
            return new java.util.HashSet<>();
        }
        return schools.stream()
                .map(school -> cm.iusjc.schedule.model.dto.response.SchoolResponse.builder()
                        .id(school.getId())
                        .code(school.getCode())
                        .name(school.getName())
                        .abbreviation(school.getAbbreviation())
                        .createdAt(school.getCreatedAt())
                        .updatedAt(school.getUpdatedAt())
                        .build())
                .collect(Collectors.toSet());
    }
    
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .gender(user.getGender())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .status(user.getStatus())
                .lastConnection(user.getLastConnection())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
    
    private String generateTemporaryPassword() {
        // Générer un mot de passe temporaire sécurisé
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&#";
        Random random = new Random();
        StringBuilder password = new StringBuilder();
        
        // Au moins 12 caractères avec majuscule, minuscule, chiffre et caractère spécial
        password.append((char) ('A' + random.nextInt(26))); // Majuscule
        password.append((char) ('a' + random.nextInt(26))); // Minuscule
        password.append(random.nextInt(10)); // Chiffre
        password.append("@$!%*?&#".charAt(random.nextInt(8))); // Caractère spécial
        
        // Compléter avec des caractères aléatoires
        for (int i = 0; i < 8; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        // Mélanger les caractères
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }
        
        return new String(passwordArray);
    }
    
    @Transactional
    public void deleteTeacher(UUID teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
        
        User teacherUser = teacher.getUser();
        
        log.info("🗑️ Suppression de l'enseignant: {} ({})", 
                teacherUser.getEmail(), teacherId);
        
        try {
            // Supprimer les relations many-to-many (courses) manuellement
            // car @ManyToMany ne supporte pas CASCADE automatique
            if (teacher.getCourses() != null && !teacher.getCourses().isEmpty()) {
                log.info("Suppression des relations avec les cours...");
                teacher.getCourses().clear();
                teacherRepository.saveAndFlush(teacher);
            }
            
            // Supprimer l'enseignant
            // CASCADE supprimera automatiquement:
            // - availabilities (via FK teacher_id)
            // - teacher_courses (via FK teacher_id)
            log.info("Suppression de l'enseignant...");
            teacherRepository.delete(teacher);
            teacherRepository.flush();
            
            // Supprimer l'utilisateur
            // CASCADE supprimera automatiquement:
            // - refresh_tokens (via FK user_id)
            // - two_factor_codes (via FK user_id)
            log.info("Suppression de l'utilisateur associé...");
            userRepository.delete(teacherUser);
            userRepository.flush();
            
            log.info("✅ Enseignant et utilisateur supprimés avec succès");
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression: {}", e.getMessage(), e);
            throw new RuntimeException("Impossible de supprimer l'enseignant: " + e.getMessage());
        }
    }
    
    // ========== GESTION DES COMPTES UTILISATEURS ==========
    
    public Page<UserResponse> getAllUsers(String search, Pageable pageable) {
        Page<User> users;
        
        if (search != null && !search.isBlank()) {
            // Recherche par email, nom, prénom ou nom d'entreprise
            String searchPattern = "%" + search.toLowerCase() + "%";
            users = userRepository.findAll(pageable);
            
            // Filtrer manuellement car nous n'avons pas de méthode de recherche dans le repository
            List<User> filteredUsers = users.getContent().stream()
                    .filter(user -> {
                        String email = user.getEmail() != null ? user.getEmail().toLowerCase() : "";
                        String firstName = user.getFirstName() != null ? user.getFirstName().toLowerCase() : "";
                        String lastName = user.getLastName() != null ? user.getLastName().toLowerCase() : "";
                        String companyName = user.getCompanyName() != null ? user.getCompanyName().toLowerCase() : "";
                        String searchLower = search.toLowerCase();
                        
                        return email.contains(searchLower) || 
                               firstName.contains(searchLower) || 
                               lastName.contains(searchLower) ||
                               companyName.contains(searchLower);
                    })
                    .collect(Collectors.toList());
            
            // Créer une nouvelle page avec les résultats filtrés
            users = new org.springframework.data.domain.PageImpl<>(
                filteredUsers, 
                pageable, 
                filteredUsers.size()
            );
        } else {
            users = userRepository.findAll(pageable);
        }
        
        return users.map(this::mapToUserResponse);
    }
    
    public List<UserResponse> getRecentUsers(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> users = userRepository.findAll(pageable);
        return users.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void blockUser(UUID userId, User admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Ne pas bloquer un admin
        if (user.getRole() == cm.iusjc.schedule.model.enums.UserRole.ADMIN) {
            throw new RuntimeException("Impossible de bloquer un administrateur");
        }
        
        // Ne pas se bloquer soi-même
        if (user.getId().equals(admin.getId())) {
            throw new RuntimeException("Vous ne pouvez pas vous bloquer vous-même");
        }
        
        user.setStatus(UserStatus.BLOCKED);
        userRepository.save(user);
        
        log.info("🚫 Utilisateur bloqué: {} par {}", user.getEmail(), admin.getEmail());
    }
    
    @Transactional
    public void unblockUser(UUID userId, User admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        user.setStatus(UserStatus.ACTIVE);
        user.setLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        
        log.info("✅ Utilisateur débloqué: {} par {}", user.getEmail(), admin.getEmail());
    }
}
