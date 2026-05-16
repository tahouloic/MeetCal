package cm.iusjc.schedule.model.dto.response;

import cm.iusjc.schedule.model.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomReservationResponse {
    
    private UUID id;
    private TeacherSummary teacher;
    private RoomSummary room;
    private String eventDescription;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer requiredCapacity;
    private ReservationStatus status;
    private String rejectionReason;
    private UserSummary reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
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
        private String name;
        private String building;
        private Integer capacity;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
    }
}
