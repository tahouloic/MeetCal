package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.response.StatsResponse;
import cm.iusjc.schedule.model.enums.UserRole;
import cm.iusjc.schedule.model.enums.UserStatus;
import cm.iusjc.schedule.repository.TeacherRepository;
import cm.iusjc.schedule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatsService {
    
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    
    public StatsResponse getStats() {
        log.info("📊 Calcul des statistiques");
        
        // Statistiques des enseignants
        Long totalTeachers = userRepository.countByRole(UserRole.TEACHER);
        Long activeTeachers = userRepository.countByRoleAndStatus(UserRole.TEACHER, UserStatus.ACTIVE);
        Long pendingTeachers = userRepository.countByRoleAndStatus(UserRole.TEACHER, UserStatus.PENDING);
        Long rejectedTeachers = userRepository.countByRoleAndStatus(UserRole.TEACHER, UserStatus.REJECTED);
        
        // Statistiques des utilisateurs
        Long totalUsers = userRepository.count();
        Long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        
        // Statistiques par école (à implémenter si nécessaire)
        StatsResponse.SchoolStats schoolStats = StatsResponse.SchoolStats.builder()
                .saintJeanIngenieur(0L)
                .saintJeanManagement(0L)
                .prepaVogt(0L)
                .cpge(0L)
                .build();
        
        log.info("✅ Statistiques calculées: {} enseignants total, {} actifs", totalTeachers, activeTeachers);
        
        return StatsResponse.builder()
                .totalTeachers(totalTeachers)
                .activeTeachers(activeTeachers)
                .pendingTeachers(pendingTeachers)
                .rejectedTeachers(rejectedTeachers)
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .schoolStats(schoolStats)
                .build();
    }
}
