package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.ClassGroup;
import cm.iusjc.schedule.model.entity.ClassSubgroup;
import cm.iusjc.schedule.model.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassSubgroupRepository extends JpaRepository<ClassSubgroup, UUID> {
    
    Optional<ClassSubgroup> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<ClassSubgroup> findByClassGroup(ClassGroup classGroup);
    
    List<ClassSubgroup> findByCourse(Course course);
    
    List<ClassSubgroup> findByClassGroupAndCourse(ClassGroup classGroup, Course course);
    
    int countByClassGroupAndCourse(ClassGroup classGroup, Course course);
}
