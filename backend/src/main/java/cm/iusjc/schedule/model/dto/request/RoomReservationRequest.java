package cm.iusjc.schedule.model.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomReservationRequest {
    
    @NotBlank(message = "La description de l'événement est obligatoire")
    @Size(min = 10, max = 500, message = "La description doit contenir entre 10 et 500 caractères")
    private String eventDescription;
    
    @NotNull(message = "La date de l'événement est obligatoire")
    @Future(message = "La date doit être dans le futur")
    private LocalDate eventDate;
    
    @NotNull(message = "L'heure de début est obligatoire")
    private LocalTime startTime;
    
    @NotNull(message = "L'heure de fin est obligatoire")
    private LocalTime endTime;
    
    @NotNull(message = "La capacité requise est obligatoire")
    @Min(value = 1, message = "La capacité doit être d'au moins 1 personne")
    @Max(value = 1000, message = "La capacité ne peut pas dépasser 1000 personnes")
    private Integer requiredCapacity;
    
    @NotNull(message = "L'ID de la salle est obligatoire")
    private UUID roomId;
}
