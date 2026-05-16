package cm.iusjc.schedule.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectReservationRequest {
    
    @NotBlank(message = "La raison du rejet est obligatoire")
    @Size(min = 10, max = 500, message = "La raison doit contenir entre 10 et 500 caractères")
    private String rejectionReason;
}
