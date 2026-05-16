package cm.iusjc.schedule.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "weekly_schedules", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"class_group_id", "week_number", "year"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklySchedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "class_group_id", nullable = false)
    private ClassGroup classGroup;
    
    @Column(nullable = false)
    private Integer weekNumber; // Numéro de semaine (1-52)
    
    @Column(nullable = false)
    private Integer year;
    
    @Column(nullable = false)
    private LocalDate weekStartDate;
    
    @Column(nullable = false)
    private LocalDate weekEndDate;
    
    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TimeSlot> timeSlots = new ArrayList<>();
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isGenerated = true; // Auto-généré ou manuel
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isPublished = false; // Publié ou brouillon
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Méthodes utilitaires
    public void addTimeSlot(TimeSlot timeSlot) {
        timeSlots.add(timeSlot);
        timeSlot.setSchedule(this);
    }
    
    public void removeTimeSlot(TimeSlot timeSlot) {
        timeSlots.remove(timeSlot);
        timeSlot.setSchedule(null);
    }
    
    public void clearTimeSlots() {
        timeSlots.clear();
    }
}
