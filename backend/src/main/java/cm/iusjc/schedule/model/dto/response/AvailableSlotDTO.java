package cm.iusjc.schedule.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotDTO {
    private String date;        // Format: YYYY-MM-DD
    private String startTime;   // Format: HH:mm
    private String endTime;     // Format: HH:mm
    private Integer dayOfWeek;  // 1=Monday, 7=Sunday
    private Boolean isAvailable;
}
