package cm.iusjc.schedule.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveAvailabilitiesRequest {
    
    @NotEmpty(message = "Au moins un créneau de disponibilité est requis")
    @Valid
    private List<AvailabilitySlot> availabilities;
}
