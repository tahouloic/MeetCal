package cm.iusjc.schedule.model.dto.request;

import cm.iusjc.schedule.model.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentCsvImportRequest {
    
    private String firstName;
    private String lastName;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String classCode; // Code de la classe (ex: CLS-SJI-4-FR-001)
}
