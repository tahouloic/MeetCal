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
public class FieldOfStudyResponse {
    
    private UUID id;
    private String code;
    private String label;
    private String name; // Nom généré: label (école)
    private SchoolResponse school;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
