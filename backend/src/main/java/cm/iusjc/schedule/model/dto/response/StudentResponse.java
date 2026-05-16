package cm.iusjc.schedule.model.dto.response;

import cm.iusjc.schedule.model.enums.Gender;
import cm.iusjc.schedule.model.enums.School;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    
    private UUID id;
    private String matricule;
    private String firstName;
    private String lastName;
    private Gender gender;
    private LocalDate dateOfBirth;
    private School school;
    private ClassGroupResponse classGroup;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
