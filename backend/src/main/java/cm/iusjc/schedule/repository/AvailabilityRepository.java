package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.Availability;
import cm.iusjc.schedule.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, UUID> {
    
    List<Availability> findByUser(User user);
    
    List<Availability> findByUserId(UUID userId);
    
    @Modifying
    @Query("DELETE FROM Availability a WHERE a.user = :user")
    void deleteByUser(User user);
    
    List<Availability> findByUserAndDayOfWeek(User user, DayOfWeek dayOfWeek);
    
    List<Availability> findByUserIdAndIsAvailable(UUID userId, Boolean isAvailable);
}
