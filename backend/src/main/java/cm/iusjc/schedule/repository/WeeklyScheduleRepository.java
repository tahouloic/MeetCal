package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.ClassGroup;
import cm.iusjc.schedule.model.entity.WeeklySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeeklyScheduleRepository extends JpaRepository<WeeklySchedule, UUID> {
    
    /**
     * Trouver l'emploi du temps d'une classe pour une semaine donnée
     */
    Optional<WeeklySchedule> findByClassGroupAndWeekNumberAndYear(
            ClassGroup classGroup, 
            Integer weekNumber, 
            Integer year
    );
    
    /**
     * Trouver tous les emplois du temps d'une classe
     */
    List<WeeklySchedule> findByClassGroupOrderByYearDescWeekNumberDesc(ClassGroup classGroup);
    
    /**
     * Trouver tous les emplois du temps d'une année
     */
    List<WeeklySchedule> findByYearOrderByWeekNumberAsc(Integer year);
    
    /**
     * Trouver tous les emplois du temps d'une semaine (toutes les classes)
     */
    List<WeeklySchedule> findByWeekNumberAndYear(Integer weekNumber, Integer year);
    
    /**
     * Trouver les emplois du temps d'un enseignant (via les créneaux)
     */
    @Query("SELECT DISTINCT ws FROM WeeklySchedule ws " +
           "JOIN ws.timeSlots ts " +
           "WHERE ts.teacher.id = :teacherId " +
           "ORDER BY ws.year DESC, ws.weekNumber DESC")
    List<WeeklySchedule> findByTeacherId(@Param("teacherId") UUID teacherId);
    
    /**
     * Trouver les emplois du temps d'un enseignant pour une semaine donnée
     */
    @Query("SELECT DISTINCT ws FROM WeeklySchedule ws " +
           "JOIN ws.timeSlots ts " +
           "WHERE ts.teacher.id = :teacherId " +
           "AND ws.weekNumber = :weekNumber " +
           "AND ws.year = :year")
    List<WeeklySchedule> findByTeacherIdAndWeek(
            @Param("teacherId") UUID teacherId,
            @Param("weekNumber") Integer weekNumber,
            @Param("year") Integer year
    );
    
    /**
     * Vérifier si un emploi du temps existe pour une classe et une semaine
     */
    boolean existsByClassGroupAndWeekNumberAndYear(
            ClassGroup classGroup,
            Integer weekNumber,
            Integer year
    );
    
    /**
     * Supprimer les emplois du temps d'une classe
     */
    @Transactional
    @Modifying
    void deleteByClassGroup(ClassGroup classGroup);
    
    /**
     * Supprimer les emplois du temps d'une semaine
     */
    @Transactional
    @Modifying
    void deleteByWeekNumberAndYear(Integer weekNumber, Integer year);
}
