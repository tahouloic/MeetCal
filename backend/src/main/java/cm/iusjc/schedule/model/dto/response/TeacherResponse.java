package cm.iusjc.schedule.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherResponse {
    private UUID id;
    private UserResponse user;
    private String specialty;
    private Set<SchoolResponse> schools; // Changé de School enum à SchoolResponse
    private Boolean isActive;
    private Boolean isApproved;
    private String rejectionReason;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
