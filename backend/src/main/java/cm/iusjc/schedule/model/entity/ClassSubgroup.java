package cm.iusjc.schedule.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "class_subgroups")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"classGroup", "course"})
@EqualsAndHashCode(exclude = {"classGroup", "course"})
public class ClassSubgroup {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "code", nullable = false, unique = true, length = 100)
    private String code; // Ex: GC4-MATH-G1
    
    @Column(name = "name", nullable = false, length = 200)
    private String name; // Ex: Génie Civil 4 - Mathématiques - Groupe 1
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_group_id", nullable = false)
    private ClassGroup classGroup;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Column(name = "group_number", nullable = false)
    private Integer groupNumber; // 1, 2, 3, etc.
    
    @Column(name = "student_count", nullable = false)
    @Builder.Default
    private Integer studentCount = 0; // Calculé lors de la création
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
