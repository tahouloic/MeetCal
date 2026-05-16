package cm.iusjc.schedule.model.dto.response;

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
public class CourseResponse {
    
    private UUID id;
    private String code;
    private String label;
    private UUID fieldOfStudyId;
    private String fieldOfStudyName;
    private String name; // Généré: label (fieldOfStudyName)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
