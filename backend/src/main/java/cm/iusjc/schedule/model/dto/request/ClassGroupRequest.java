package cm.iusjc.schedule.model.dto.request;

import cm.iusjc.schedule.model.enums.Language;
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
public class ClassGroupRequest {
    
    @NotNull(message = "La filière est obligatoire")
    private UUID fieldOfStudyId;
    
    @NotBlank(message = "Le niveau est obligatoire")
    @Size(min = 1, max = 50, message = "Le niveau doit contenir entre 1 et 50 caractères")
    private String level;
    
    @NotNull(message = "La langue est obligatoire")
    private Language language;
}
