package cm.iusjc.schedule.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    
    private UUID id;
    private String building;
    private Integer floor;
    private String number;
    private String code; // Généré: A201, B103, etc.
    private Integer capacity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
