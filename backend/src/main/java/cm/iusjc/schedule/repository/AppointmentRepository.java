package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.Appointment;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.model.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    
    List<Appointment> findByRequestorAndStatusOrderByCreatedAtDesc(User requestor, AppointmentStatus status);
    
    List<Appointment> findByRequestorOrderByCreatedAtDesc(User requestor);
    
    List<Appointment> findByRecipientAndStatusOrderByCreatedAtDesc(User recipient, AppointmentStatus status);
    
    List<Appointment> findByRecipientOrderByCreatedAtDesc(User recipient);
    
    @Query("SELECT a FROM Appointment a WHERE a.recipient = :recipient AND a.slotTime = :slotTime AND a.status = 'ACCEPTED'")
    List<Appointment> findAcceptedAppointmentsByRecipientAndTime(
        @Param("recipient") User recipient,
        @Param("slotTime") LocalDateTime slotTime
    );
    
    @Query("SELECT a FROM Appointment a WHERE a.status = 'PENDING' AND a.expiresAt < :now")
    List<Appointment> findExpiredPendingAppointments(@Param("now") LocalDateTime now);
}
