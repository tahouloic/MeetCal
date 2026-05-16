package cm.iusjc.schedule.model.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateScheduleRequest {
    
    @NotNull(message = "L'ID de la classe est requis")
    private UUID classGroupId;
    
    @NotNull(message = "Le numéro de semaine est requis")
    @Min(value = 1, message = "Le numéro de semaine doit être entre 1 et 52")
    @Max(value = 52, message = "Le numéro de semaine doit être entre 1 et 52")
    private Integer weekNumber;
    
    @NotNull(message = "L'année est requise")
    @Min(value = 2020, message = "L'année doit être >= 2020")
    @Max(value = 2100, message = "L'année doit être <= 2100")
    private Integer year;
}
