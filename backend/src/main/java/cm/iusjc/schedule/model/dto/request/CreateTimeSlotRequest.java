package cm.iusjc.schedule.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTimeSlotRequest {
    
    @NotNull(message = "L'ID de l'emploi du temps est obligatoire")
    private UUID scheduleId;
    
    @NotNull(message = "Le jour est obligatoire")
    private DayOfWeek dayOfWeek;
    
    @NotNull(message = "L'heure de début est obligatoire")
    private LocalTime startTime;
    
    @NotNull(message = "L'heure de fin est obligatoire")
    private LocalTime endTime;
    
    @NotNull(message = "Le cours est obligatoire")
    private UUID courseId;
    
    @NotNull(message = "L'enseignant est obligatoire")
    private UUID teacherId;
    
    @NotNull(message = "La salle est obligatoire")
    private UUID roomId;
}
