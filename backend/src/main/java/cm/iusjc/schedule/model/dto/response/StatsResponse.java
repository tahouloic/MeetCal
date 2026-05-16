package cm.iusjc.schedule.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    
    // Statistiques des enseignants
    private Long totalTeachers;
    private Long activeTeachers;
    private Long pendingTeachers;
    private Long rejectedTeachers;
    
    // Statistiques des utilisateurs
    private Long totalUsers;
    private Long activeUsers;
    
    // Statistiques par école
    private SchoolStats schoolStats;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SchoolStats {
        private Long saintJeanIngenieur;
        private Long saintJeanManagement;
        private Long prepaVogt;
        private Long cpge;
    }
}
