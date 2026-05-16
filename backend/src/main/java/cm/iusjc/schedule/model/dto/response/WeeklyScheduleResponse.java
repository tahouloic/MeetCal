package cm.iusjc.schedule.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyScheduleResponse {
    
    private UUID id;
    private ClassGroupSummary classGroup;
    private Integer weekNumber;
    private Integer year;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private List<TimeSlotResponse> timeSlots;
    private Boolean isGenerated;
    private String generationAlgorithm;
    private String generationNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Classes imbriquées
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassGroupSummary {
        private UUID id;
        private String name;
        private String level;
        private FieldOfStudySummary fieldOfStudy;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldOfStudySummary {
        private UUID id;
        private String name;
        private String code;
        private SchoolSummary school;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SchoolSummary {
        private UUID id;
        private String name;
        private String code;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSlotResponse {
        private UUID id;
        private DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private CourseSummary course;
        private TeacherSummary teacher;
        private RoomSummary room;
        private Boolean isManuallySet;
        private String notes;
        private String conflictResolutionNote;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseSummary {
        private UUID id;
        private String name;
        private String code;
        private Integer weeklyHours;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherSummary {
        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
        private String specialty;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomSummary {
        private UUID id;
        private String code;
        private String building;
        private Integer capacity;
    }
}
