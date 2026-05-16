package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.request.RejectReservationRequest;
import cm.iusjc.schedule.model.dto.request.RoomReservationRequest;
import cm.iusjc.schedule.model.dto.response.RoomReservationResponse;
import cm.iusjc.schedule.model.entity.Room;
import cm.iusjc.schedule.model.entity.RoomReservation;
import cm.iusjc.schedule.model.entity.Teacher;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.model.enums.ReservationStatus;
import cm.iusjc.schedule.repository.RoomRepository;
import cm.iusjc.schedule.repository.RoomReservationRepository;
import cm.iusjc.schedule.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomReservationService {
    
    private final RoomReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final TeacherRepository teacherRepository;
    private final RoomAvailabilityService availabilityService;
    
    /**
     * Créer une nouvelle réservation (Enseignant)
     */
    @Transactional
    public RoomReservationResponse createReservation(
            RoomReservationRequest request,
            User teacherUser
    ) {
        log.info("Création d'une réservation par {}", teacherUser.getEmail());
        
        // 1. Valider la plage horaire
        availabilityService.validateTimeRange(request.getStartTime(), request.getEndTime());
        
        // 2. Récupérer l'enseignant
        Teacher teacher = teacherRepository.findByUser(teacherUser)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
        
        // 3. Récupérer la salle
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Salle non trouvée"));
        
        // 4. Vérifier que la salle a la capacité suffisante
        if (room.getCapacity() < request.getRequiredCapacity()) {
            throw new RuntimeException(
                    String.format("La salle %s n'a qu'une capacité de %d places (requis: %d)",
                            room.getCode(), room.getCapacity(), request.getRequiredCapacity()));
        }
        
        // 5. Vérifier la disponibilité
        boolean isAvailable = availabilityService.isRoomAvailable(
                room.getId(),
                request.getEventDate(),
                request.getStartTime(),
                request.getEndTime()
        );
        
        if (!isAvailable) {
            throw new RuntimeException(
                    "La salle n'est pas disponible à cette date et heure");
        }
        
        // 6. Créer la réservation
        RoomReservation reservation = RoomReservation.builder()
                .teacher(teacher)
                .room(room)
                .eventDescription(request.getEventDescription())
                .eventDate(request.getEventDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .requiredCapacity(request.getRequiredCapacity())
                .status(ReservationStatus.PENDING)
                .build();
        
        reservation = reservationRepository.save(reservation);
        
        log.info("✅ Réservation créée avec succès: {}", reservation.getId());
        
        return mapToResponse(reservation);
    }
    
    /**
     * Obtenir les réservations d'un enseignant
     */
    public List<RoomReservationResponse> getTeacherReservations(User teacherUser) {
        Teacher teacher = teacherRepository.findByUser(teacherUser)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
        
        List<RoomReservation> reservations = reservationRepository
                .findByTeacherOrderByEventDateDescStartTimeDesc(teacher);
        
        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtenir toutes les réservations (Admin)
     */
    public List<RoomReservationResponse> getAllReservations(ReservationStatus status) {
        List<RoomReservation> reservations;
        
        if (status != null) {
            reservations = reservationRepository
                    .findByStatusOrderByEventDateDescStartTimeDesc(status);
        } else {
            reservations = reservationRepository
                    .findAllByOrderByEventDateDescStartTimeDesc();
        }
        
        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Approuver une réservation (Admin)
     */
    @Transactional
    public RoomReservationResponse approveReservation(UUID reservationId, User admin) {
        log.info("Approbation de la réservation {} par {}", reservationId, admin.getEmail());
        
        RoomReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));
        
        if (!reservation.isPending()) {
            throw new RuntimeException("Seules les réservations en attente peuvent être approuvées");
        }
        
        // Vérifier à nouveau la disponibilité
        boolean isAvailable = availabilityService.isRoomAvailable(
                reservation.getRoom().getId(),
                reservation.getEventDate(),
                reservation.getStartTime(),
                reservation.getEndTime()
        );
        
        if (!isAvailable) {
            throw new RuntimeException(
                    "La salle n'est plus disponible à cette date et heure");
        }
        
        reservation.setStatus(ReservationStatus.APPROVED);
        reservation.setReviewedBy(admin);
        reservation.setReviewedAt(LocalDateTime.now());
        reservation.setRejectionReason(null);
        
        reservation = reservationRepository.save(reservation);
        
        log.info("✅ Réservation approuvée");
        
        // TODO: Envoyer email de notification à l'enseignant
        
        return mapToResponse(reservation);
    }
    
    /**
     * Rejeter une réservation (Admin)
     */
    @Transactional
    public RoomReservationResponse rejectReservation(
            UUID reservationId,
            RejectReservationRequest request,
            User admin
    ) {
        log.info("Rejet de la réservation {} par {}", reservationId, admin.getEmail());
        
        RoomReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));
        
        if (!reservation.isPending()) {
            throw new RuntimeException("Seules les réservations en attente peuvent être rejetées");
        }
        
        reservation.setStatus(ReservationStatus.REJECTED);
        reservation.setReviewedBy(admin);
        reservation.setReviewedAt(LocalDateTime.now());
        reservation.setRejectionReason(request.getRejectionReason());
        
        reservation = reservationRepository.save(reservation);
        
        log.info("✅ Réservation rejetée");
        
        // TODO: Envoyer email de notification à l'enseignant
        
        return mapToResponse(reservation);
    }
    
    /**
     * Compter les réservations en attente
     */
    public long countPendingReservations() {
        return reservationRepository.countByStatus(ReservationStatus.PENDING);
    }
    
    /**
     * Mapper une entité vers un DTO
     */
    private RoomReservationResponse mapToResponse(RoomReservation reservation) {
        User teacherUser = reservation.getTeacher().getUser();
        Room room = reservation.getRoom();
        
        return RoomReservationResponse.builder()
                .id(reservation.getId())
                .teacher(RoomReservationResponse.TeacherSummary.builder()
                        .id(reservation.getTeacher().getId())
                        .firstName(teacherUser.getFirstName())
                        .lastName(teacherUser.getLastName())
                        .email(teacherUser.getEmail())
                        .specialty(reservation.getTeacher().getSpecialty())
                        .build())
                .room(RoomReservationResponse.RoomSummary.builder()
                        .id(room.getId())
                        .name(room.getCode()) // Utiliser le code comme nom (ex: A201)
                        .building(room.getBuilding())
                        .capacity(room.getCapacity())
                        .build())
                .eventDescription(reservation.getEventDescription())
                .eventDate(reservation.getEventDate())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .requiredCapacity(reservation.getRequiredCapacity())
                .status(reservation.getStatus())
                .rejectionReason(reservation.getRejectionReason())
                .reviewedBy(reservation.getReviewedBy() != null ?
                        RoomReservationResponse.UserSummary.builder()
                                .id(reservation.getReviewedBy().getId())
                                .firstName(reservation.getReviewedBy().getFirstName())
                                .lastName(reservation.getReviewedBy().getLastName())
                                .email(reservation.getReviewedBy().getEmail())
                                .build() : null)
                .reviewedAt(reservation.getReviewedAt())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .build();
    }
}
