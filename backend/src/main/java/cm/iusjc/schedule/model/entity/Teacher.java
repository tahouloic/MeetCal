package cm.iusjc.schedule.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "teachers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"user", "courses"})
@EqualsAndHashCode(exclude = {"user", "courses"})
public class Teacher {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(nullable = false, length = 100)
    private String specialty;
    
    @ManyToMany
    @JoinTable(
        name = "teacher_courses",
        joinColumns = @JoinColumn(name = "teacher_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    @Builder.Default
    private Set<Course> courses = new HashSet<>();
    
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Méthodes utilitaires
    public boolean isApproved() {
        return approvedBy != null && approvedAt != null;
    }
    
    public void addCourse(Course course) {
        if (courses == null) {
            courses = new HashSet<>();
        }
        courses.add(course);
    }
    
    public void removeCourse(Course course) {
        if (courses != null) {
            courses.remove(course);
        }
    }
    
    // Méthode pour obtenir les écoles à partir des cours
    public Set<School> getSchools() {
        Set<School> schools = new HashSet<>();
        if (courses != null) {
            for (Course course : courses) {
                if (course.getFieldOfStudy() != null && course.getFieldOfStudy().getSchool() != null) {
                    schools.add(course.getFieldOfStudy().getSchool());
                }
            }
        }
        return schools;
    }
}
