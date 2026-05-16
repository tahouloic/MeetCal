package cm.iusjc.schedule.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "fields_of_study")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"school"})
@EqualsAndHashCode(exclude = {"school"})
public class FieldOfStudy {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code; // AUTO: FOS-001
    
    @Column(name = "label", nullable = false, length = 100)
    private String label; // Génie Civil, Management, etc.
    
    @ManyToOne
    @JoinColumn(name = "school_id", nullable = false)
    private School school;
    
    @Column(name = "name", nullable = false, length = 200)
    private String name; // GÉNÉRÉ: Génie Civil (SJI)
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Méthode pour générer le nom automatiquement
    @PrePersist
    @PreUpdate
    public void generateName() {
        if (school != null && label != null) {
            this.name = label + " (" + school.getAbbreviation() + ")";
        }
    }
}
