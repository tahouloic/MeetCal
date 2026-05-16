package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.ClassGroup;
import cm.iusjc.schedule.model.entity.Student;
import cm.iusjc.schedule.model.enums.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    
    Optional<Student> findByMatricule(String matricule);
    
    boolean existsByMatricule(String matricule);
    
    List<Student> findByClassGroup(ClassGroup classGroup);
    
    List<Student> findBySchool(School school);
    
    long countByClassGroup(ClassGroup classGroup);
    
    @Query("SELECT MAX(CAST(SUBSTRING(s.matricule, LENGTH(s.matricule) - 2) AS int)) FROM Student s WHERE s.matricule LIKE :pattern")
    Integer findMaxStudentNumber(@Param("pattern") String pattern);
}
