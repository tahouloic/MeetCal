package cm.iusjc.schedule.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {
    
    private UUID id;
    private Integer weekNumber;
    private Integer year;
    private LocalDate weekStartDate;
    
    private UUID classGroupId;
    private String classGroupName;
    
    private List<TimeSlotResponse> timeSlots;
    
    private Boolean isGenerated;
    private Boolean isPublished;
}
