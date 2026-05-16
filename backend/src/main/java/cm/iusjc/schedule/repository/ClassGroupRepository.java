package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.ClassGroup;
import cm.iusjc.schedule.model.entity.FieldOfStudy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassGroupRepository extends JpaRepository<ClassGroup, UUID> {
    
    Optional<ClassGroup> findByCode(String code);
    
    boolean existsByCode(String code);
    
    // Nouvelle méthode: recherche par école via la filière
    @Query("SELECT cg FROM ClassGroup cg WHERE cg.fieldOfStudy.school.id = :schoolId")
    List<ClassGroup> findBySchoolId(@Param("schoolId") UUID schoolId);
    
    // Recherche par filière
    List<ClassGroup> findByFieldOfStudy(FieldOfStudy fieldOfStudy);
    
    @Query("SELECT MAX(CAST(SUBSTRING(c.code, LENGTH(c.code) - 2) AS int)) FROM ClassGroup c WHERE c.code LIKE :pattern")
    Integer findMaxClassNumber(@Param("pattern") String pattern);
}
