package cm.iusjc.schedule.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequest {
    
    @NotBlank(message = "Le libellé du cours est obligatoire")
    @Size(min = 3, max = 200, message = "Le libellé doit contenir entre 3 et 200 caractères")
    private String label;
    
    @NotNull(message = "La filière est obligatoire")
    private UUID fieldOfStudyId;
}
