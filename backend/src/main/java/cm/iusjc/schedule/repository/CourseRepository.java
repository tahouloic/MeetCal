package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    
    Optional<Course> findByCode(String code);
    
    boolean existsByCode(String code);
    
    boolean existsByName(String name);
    
    @Query("SELECT MAX(CAST(SUBSTRING(c.code, 5) AS int)) FROM Course c WHERE c.code LIKE 'CRS-%'")
    Integer findMaxCourseNumber();
}
