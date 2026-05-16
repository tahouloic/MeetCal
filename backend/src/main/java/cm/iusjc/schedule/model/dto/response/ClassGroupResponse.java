package cm.iusjc.schedule.model.dto.response;

import cm.iusjc.schedule.model.enums.Language;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassGroupResponse {
    
    private UUID id;
    private String code;
    private UUID fieldOfStudyId;
    private String fieldOfStudyName;
    private String name; // Généré: fieldOfStudyName - level - language
    private String level;
    private Language language;
    private Integer studentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
