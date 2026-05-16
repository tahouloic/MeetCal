package cm.iusjc.schedule.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentImportResponse {
    
    private Integer totalRows;
    private Integer successCount;
    private Integer errorCount;
    
    @Builder.Default
    private List<String> errors = new ArrayList<>();
    
    @Builder.Default
    private List<StudentResponse> importedStudents = new ArrayList<>();
}
