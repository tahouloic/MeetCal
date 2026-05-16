package cm.iusjc.schedule.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {})
@EqualsAndHashCode(exclude = {})
public class Room {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "building", nullable = false, length = 1)
    private String building; // A, B, C
    
    @Column(name = "floor", nullable = false)
    private Integer floor; // 0 (RDC), 1, 2, 3
    
    @Column(name = "number", nullable = false, length = 10)
    private String number; // 01, 02, etc.
    
    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code; // GÉNÉRÉ: A201, B103, etc.
    
    @Column(name = "capacity", nullable = false)
    private Integer capacity; // Nombre de places
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    @PreUpdate
    private void generateCode() {
        if (building != null && floor != null && number != null) {
            this.code = building + floor + number;
        }
    }
}
