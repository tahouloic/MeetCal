package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {
    
    List<TimeSlot> findByScheduleId(UUID scheduleId);
    
    List<TimeSlot> findByTeacherId(UUID teacherId);
    
    @Query("SELECT ts FROM TimeSlot ts WHERE ts.schedule.id = :scheduleId " +
           "AND ts.dayOfWeek = :dayOfWeek ORDER BY ts.startTime")
    List<TimeSlot> findByScheduleIdAndDayOfWeek(
        @Param("scheduleId") UUID scheduleId,
        @Param("dayOfWeek") DayOfWeek dayOfWeek
    );
    
    @Query("SELECT CASE WHEN COUNT(ts) > 0 THEN true ELSE false END FROM TimeSlot ts " +
           "WHERE ts.room.id = :roomId " +
           "AND ts.schedule.weekNumber = :weekNumber " +
           "AND ts.schedule.year = :year " +
           "AND ts.dayOfWeek = :dayOfWeek " +
           "AND ((ts.startTime < :endTime AND ts.endTime > :startTime))")
    boolean existsConflictForRoom(
        @Param("roomId") UUID roomId,
        @Param("weekNumber") Integer weekNumber,
        @Param("year") Integer year,
        @Param("dayOfWeek") DayOfWeek dayOfWeek,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );
    
    @Query("SELECT CASE WHEN COUNT(ts) > 0 THEN true ELSE false END FROM TimeSlot ts " +
           "WHERE ts.teacher.id = :teacherId " +
           "AND ts.schedule.weekNumber = :weekNumber " +
           "AND ts.schedule.year = :year " +
           "AND ts.dayOfWeek = :dayOfWeek " +
           "AND ((ts.startTime < :endTime AND ts.endTime > :startTime))")
    boolean existsConflictForTeacher(
        @Param("teacherId") UUID teacherId,
        @Param("weekNumber") Integer weekNumber,
        @Param("year") Integer year,
        @Param("dayOfWeek") DayOfWeek dayOfWeek,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );
}
