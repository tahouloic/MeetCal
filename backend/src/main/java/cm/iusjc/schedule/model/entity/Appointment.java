package cm.iusjc.schedule.model.entity;

import cm.iusjc.schedule.model.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requestor_id", nullable = false)
    private User requestor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;
    
    @Column(name = "slot_time", nullable = false)
    private LocalDateTime slotTime;
    
    @Column(name = "slot_time_utc", nullable = false)
    private LocalDateTime slotTimeUtc;
    
    @Column(name = "requestor_timezone", nullable = false, length = 50)
    private String requestorTimezone;
    
    @Column(name = "recipient_timezone", nullable = false, length = 50)
    private String recipientTimezone;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Méthodes utilitaires
    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now()) && status == AppointmentStatus.PENDING;
    }
    
    public boolean canBeModified() {
        return status == AppointmentStatus.PENDING && !isExpired();
    }
}
