package cm.iusjc.schedule.model.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {
    
    @NotBlank(message = "Le bâtiment est obligatoire")
    @Pattern(regexp = "[ABC]", message = "Le bâtiment doit être A, B ou C")
    private String building;
    
    @NotNull(message = "L'étage est obligatoire")
    @Min(value = 0, message = "L'étage doit être entre 0 et 3")
    private Integer floor;
    
    @NotBlank(message = "Le numéro est obligatoire")
    @Pattern(regexp = "\\d{1,3}", message = "Le numéro doit être composé de 1 à 3 chiffres")
    private String number;
    
    @NotNull(message = "La capacité est obligatoire")
    @Min(value = 1, message = "La capacité doit être au moins 1")
    private Integer capacity;
}
