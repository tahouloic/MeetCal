package cm.iusjc.schedule.model.dto.request;

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
public class UpdateTimeSlotRequest {
    
    @NotNull(message = "L'ID du cours est requis")
    private UUID courseId;
    
    @NotNull(message = "L'ID de l'enseignant est requis")
    private UUID teacherId;
    
    @NotNull(message = "L'ID de la salle est requise")
    private UUID roomId;
}
