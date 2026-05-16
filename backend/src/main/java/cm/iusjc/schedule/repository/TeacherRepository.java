package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.School;
import cm.iusjc.schedule.model.entity.Teacher;
import cm.iusjc.schedule.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, UUID> {
    
    Optional<Teacher> findByUser(User user);
    
    Optional<Teacher> findByUserId(UUID userId);
    
    List<Teacher> findByIsActive(Boolean isActive);
    
    @Query("SELECT DISTINCT t FROM Teacher t JOIN t.courses c JOIN c.fieldOfStudy f JOIN f.school s WHERE s.id = :schoolId")
    List<Teacher> findBySchoolId(@Param("schoolId") UUID schoolId);
    
    @Query("SELECT DISTINCT t FROM Teacher t JOIN t.courses c JOIN c.fieldOfStudy f WHERE f.school = :school")
    List<Teacher> findBySchool(@Param("school") School school);
    
    @Query("SELECT t FROM Teacher t WHERE t.specialty LIKE %:specialty%")
    List<Teacher> findBySpecialtyContaining(String specialty);
    
    @Query("SELECT t FROM Teacher t WHERE t.approvedBy IS NOT NULL AND t.approvedAt IS NOT NULL")
    List<Teacher> findApprovedTeachers();
    
    @Query("SELECT t FROM Teacher t WHERE t.approvedBy IS NULL")
    List<Teacher> findPendingTeachers();
}
