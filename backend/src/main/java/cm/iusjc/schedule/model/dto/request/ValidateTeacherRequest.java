package cm.iusjc.schedule.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateTeacherRequest {
    
    @NotBlank(message = "L'action est obligatoire")
    @Pattern(regexp = "^(approve|reject)$", message = "L'action doit être 'approve' ou 'reject'")
    private String action;
    
    private String rejectionReason; // Obligatoire si action = reject
}
