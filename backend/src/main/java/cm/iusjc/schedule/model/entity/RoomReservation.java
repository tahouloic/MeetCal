package cm.iusjc.schedule.model.entity;

import cm.iusjc.schedule.model.enums.ReservationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "room_reservations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomReservation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;
    
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String eventDescription;
    
    @Column(nullable = false)
    private LocalDate eventDate;
    
    @Column(nullable = false)
    private LocalTime startTime;
    
    @Column(nullable = false)
    private LocalTime endTime;
    
    @Column(nullable = false)
    private Integer requiredCapacity;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    
    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Méthodes utilitaires
    public boolean isPending() {
        return status == ReservationStatus.PENDING;
    }
    
    public boolean isApproved() {
        return status == ReservationStatus.APPROVED;
    }
    
    public boolean isRejected() {
        return status == ReservationStatus.REJECTED;
    }
}
