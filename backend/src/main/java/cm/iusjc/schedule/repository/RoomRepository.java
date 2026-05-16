package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    
    Optional<Room> findByCode(String code);
    
    boolean existsByCode(String code);
    
    @Query("SELECT MAX(CAST(SUBSTRING(r.code, 8) AS int)) FROM Room r WHERE r.code LIKE 'ROOM-A%'")
    Integer findMaxRoomNumber();
    
    // Trouver les salles avec une capacité minimale, triées par capacité croissante
    List<Room> findByCapacityGreaterThanEqualOrderByCapacityAsc(Integer minCapacity);
}
