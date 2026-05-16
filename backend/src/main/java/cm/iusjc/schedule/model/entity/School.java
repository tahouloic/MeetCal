package cm.iusjc.schedule.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "schools")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {})
@EqualsAndHashCode(exclude = {})
public class School {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code; // SJI, SJM, PREPA_VOGT, CPGE
    
    @Column(name = "name", nullable = false, length = 100)
    private String name; // Saint Jean Ingénieur, Saint Jean Management, etc.
    
    @Column(name = "abbreviation", nullable = false, length = 20)
    private String abbreviation; // SJI, SJM, Prépa Vogt, CPGE
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
