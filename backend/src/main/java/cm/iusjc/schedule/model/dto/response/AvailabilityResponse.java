package cm.iusjc.schedule.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityResponse {
    
    private UUID teacherId;
    private String teacherName;
    private List<AvailabilitySlotResponse> availabilities;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilitySlotResponse {
        private UUID id;
        private String dayOfWeek;
        private String startTime;
        private String endTime;
        private Boolean isAvailable;
    }
}
