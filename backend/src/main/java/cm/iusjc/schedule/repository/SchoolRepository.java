package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SchoolRepository extends JpaRepository<School, UUID> {
    
    Optional<School> findByCode(String code);
    
    boolean existsByCode(String code);
    
    boolean existsByName(String name);
}
