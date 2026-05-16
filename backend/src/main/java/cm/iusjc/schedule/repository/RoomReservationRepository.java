package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.Room;
import cm.iusjc.schedule.model.entity.RoomReservation;
import cm.iusjc.schedule.model.entity.Teacher;
import cm.iusjc.schedule.model.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RoomReservationRepository extends JpaRepository<RoomReservation, UUID> {
    
    // Trouver les réservations d'un enseignant
    List<RoomReservation> findByTeacherOrderByEventDateDescStartTimeDesc(Teacher teacher);
    
    // Trouver les réservations par statut
    List<RoomReservation> findByStatusOrderByEventDateDescStartTimeDesc(ReservationStatus status);
    
    // Trouver toutes les réservations triées
    List<RoomReservation> findAllByOrderByEventDateDescStartTimeDesc();
    
    // Vérifier si une salle est réservée à une date/heure donnée
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM RoomReservation r " +
           "WHERE r.room.id = :roomId " +
           "AND r.eventDate = :date " +
           "AND r.status = 'APPROVED' " +
           "AND (" +
           "  (r.startTime < :endTime AND r.endTime > :startTime)" +
           ")")
    boolean existsByRoomAndDateAndTimeOverlap(
        @Param("roomId") UUID roomId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );
    
    // Trouver les réservations d'une salle à une date donnée
    @Query("SELECT r FROM RoomReservation r " +
           "WHERE r.room.id = :roomId " +
           "AND r.eventDate = :date " +
           "AND r.status = 'APPROVED' " +
           "ORDER BY r.startTime")
    List<RoomReservation> findByRoomAndDate(
        @Param("roomId") UUID roomId,
        @Param("date") LocalDate date
    );
    
    // Compter les réservations en attente
    long countByStatus(ReservationStatus status);
    
    // Trouver les réservations entre deux dates
    @Query("SELECT r FROM RoomReservation r " +
           "WHERE r.eventDate BETWEEN :startDate AND :endDate " +
           "AND r.status = 'APPROVED' " +
           "ORDER BY r.eventDate, r.startTime")
    List<RoomReservation> findByEventDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
