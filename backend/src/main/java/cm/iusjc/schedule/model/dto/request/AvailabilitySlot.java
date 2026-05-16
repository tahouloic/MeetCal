package cm.iusjc.schedule.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySlot {
    
    @NotBlank(message = "Le jour est obligatoire")
    private String dayOfWeek; // MONDAY, TUESDAY, etc.
    
    @NotBlank(message = "L'heure de début est obligatoire")
    private String startTime; // Format: "08:00"
    
    @NotBlank(message = "L'heure de fin est obligatoire")
    private String endTime; // Format: "09:00"
    
    @NotNull(message = "Le statut de disponibilité est obligatoire")
    private Boolean isAvailable;
}
