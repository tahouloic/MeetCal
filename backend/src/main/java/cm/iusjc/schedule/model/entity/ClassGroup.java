package cm.iusjc.schedule.model.entity;

import cm.iusjc.schedule.model.enums.Language;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "class_groups")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"students", "fieldOfStudy"})
@EqualsAndHashCode(exclude = {"students", "fieldOfStudy"})
public class ClassGroup {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code; // Ex: CLS-001
    
    @ManyToOne
    @JoinColumn(name = "field_of_study_id", nullable = false)
    private FieldOfStudy fieldOfStudy;
    
    @Column(name = "level", nullable = false, length = 50)
    private String level; // Ex: 4ème année
    
    @Enumerated(EnumType.STRING)
    @Column(name = "language", nullable = false, length = 10)
    private Language language; // FR, EN, NONE
    
    @Column(name = "name", nullable = false, length = 300)
    private String name; // GÉNÉRÉ: Génie Civil (SJI) - 4ème année - FR
    
    @Column(name = "student_count", nullable = false)
    @Builder.Default
    private Integer studentCount = 0; // Calculé automatiquement
    
    @OneToMany(mappedBy = "classGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Student> students = new HashSet<>();
    
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
        // Régénérer le nom seulement si les champs ont changé
        generateName();
    }
    
    private void generateName() {
        if (fieldOfStudy != null && level != null && language != null) {
            // FieldOfStudy.name contient déjà "Label (Abbreviation)", ex: "Génie Civil (SJI)"
            // On génère le nom complet: Filière - Niveau - Langue
            String languageSuffix = language == Language.NONE ? "" : " - " + language.name();
            String generatedName = fieldOfStudy.getName() + " - " + level + languageSuffix;
            
            // Ne mettre à jour que si le nom a changé (évite les doublons)
            if (!generatedName.equals(this.name)) {
                this.name = generatedName;
            }
        }
    }
}
