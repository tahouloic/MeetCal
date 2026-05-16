package cm.iusjc.schedule.model.dto;

import cm.iusjc.schedule.model.enums.AppointmentStatus;
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
public class AppointmentResponse {
    
    private UUID id;
    private UUID requestorId;
    private UUID recipientId;
    private LocalDateTime slotTime;
    private LocalDateTime slotTimeUtc;
    private String requestorTimezone;
    private String recipientTimezone;
    private String message;
    private AppointmentStatus status;
    private LocalDateTime expiresAt;
    private LocalDateTime respondedAt;
    private LocalDateTime createdAt;
    
    // Données dénormalisées pour affichage
    private String requestorName;
    private String requestorEmail;
    private String recipientName;
    private String recipientEmail;
}
