package cm.iusjc.schedule.model.dto.response;

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
public class TimeSlotResponse {
    
    private UUID id;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    
    private UUID courseId;
    private String courseName;
    private String courseCode;
    
    private UUID teacherId;
    private String teacherName;
    private String teacherEmail;
    
    private UUID roomId;
    private String roomCode;
    private Integer roomCapacity;
    
    private Boolean isManuallySet;
}
