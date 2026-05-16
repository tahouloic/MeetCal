package cm.iusjc.schedule.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotResponse {
    
    private String date;
    private String startTime;
    private String endTime;
    private Boolean isAvailable;
}
