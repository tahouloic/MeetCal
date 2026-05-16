package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.FieldOfStudy;
import cm.iusjc.schedule.model.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FieldOfStudyRepository extends JpaRepository<FieldOfStudy, UUID> {
    
    Optional<FieldOfStudy> findByCode(String code);
    
    List<FieldOfStudy> findBySchool(School school);
    
    List<FieldOfStudy> findBySchoolId(UUID schoolId);
    
    boolean existsByCode(String code);
    
    boolean existsByLabelAndSchool(String label, School school);
    
    long countBySchool(School school);
}
