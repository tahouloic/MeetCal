package cm.iusjc.schedule.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"fieldOfStudy"})
@EqualsAndHashCode(exclude = {"fieldOfStudy"})
public class Course {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code; // Ex: CRS-001
    
    @Column(name = "label", nullable = false, length = 200)
    private String label; // Ex: Mathématiques Appliquées
    
    @ManyToOne
    @JoinColumn(name = "field_of_study_id", nullable = false)
    private FieldOfStudy fieldOfStudy;
    
    @Column(name = "name", nullable = false, length = 300)
    private String name; // GÉNÉRÉ: Mathématiques Appliquées (Génie Civil - SJI)
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    private void onPrePersist() {
        generateName();
    }
    
    @PreUpdate
    private void onPreUpdate() {
        generateName();
    }
    
    private void generateName() {
        if (label != null && fieldOfStudy != null && fieldOfStudy.getName() != null) {
            String generatedName = label + " (" + fieldOfStudy.getName() + ")";
            
            // Ne mettre à jour que si le nom a changé (évite les doublons)
            if (!generatedName.equals(this.name)) {
                this.name = generatedName;
            }
        }
    }
}
