package cm.iusjc.schedule.model.entity;

import cm.iusjc.schedule.model.enums.Gender;
import cm.iusjc.schedule.model.enums.School;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "students")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"classGroup"})
@EqualsAndHashCode(exclude = {"classGroup"})
public class Student {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "matricule", nullable = false, unique = true, length = 30)
    private String matricule; // Ex: SJI-2024-001
    
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false, length = 10)
    private Gender gender; // MALE, FEMALE, OTHER
    
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_group_id", nullable = false)
    private ClassGroup classGroup;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "school", nullable = false, length = 20)
    private School school; // SJI, SJM, PREPA_VOGT, CPGE
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
