package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.entity.Room;
import cm.iusjc.schedule.repository.RoomRepository;
import cm.iusjc.schedule.repository.RoomReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomAvailabilityService {
    
    private final RoomRepository roomRepository;
    private final RoomReservationRepository reservationRepository;
    // TODO: Ajouter ScheduleRepository quand les emplois du temps seront implémentés
    
    /**
     * Vérifie si une salle est disponible à une date et heure données
     */
    public boolean isRoomAvailable(
            UUID roomId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime
    ) {
        log.debug("Vérification disponibilité salle {} pour le {} de {}h à {}h",
                roomId, date, startTime, endTime);
        
        // 1. Vérifier les réservations existantes approuvées
        boolean hasReservationConflict = reservationRepository
                .existsByRoomAndDateAndTimeOverlap(roomId, date, startTime, endTime);
        
        if (hasReservationConflict) {
            log.debug("Conflit avec une réservation existante");
            return false;
        }
        
        // 2. TODO: Vérifier les cours programmés (Phase 3)
        // boolean hasCourseConflict = scheduleRepository
        //     .existsByRoomAndDateAndTimeOverlap(roomId, date, startTime, endTime);
        
        log.debug("Salle disponible");
        return true;
    }
    
    /**
     * Obtient toutes les salles disponibles avec une capacité minimale
     */
    public List<Room> getAvailableRooms(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            Integer minCapacity
    ) {
        log.info("Recherche de salles disponibles pour le {} de {}h à {}h (capacité >= {})",
                date, startTime, endTime, minCapacity);
        
        // 1. Récupérer toutes les salles avec capacité suffisante
        List<Room> roomsWithCapacity = roomRepository
                .findByCapacityGreaterThanEqualOrderByCapacityAsc(minCapacity);
        
        log.debug("Trouvé {} salles avec capacité >= {}", roomsWithCapacity.size(), minCapacity);
        
        // 2. Filtrer celles qui sont disponibles
        List<Room> availableRooms = roomsWithCapacity.stream()
                .filter(room -> isRoomAvailable(room.getId(), date, startTime, endTime))
                .collect(Collectors.toList());
        
        log.info("Trouvé {} salles disponibles", availableRooms.size());
        
        return availableRooms;
    }
    
    /**
     * Valide qu'une plage horaire est correcte
     */
    public void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
            throw new IllegalArgumentException(
                    "L'heure de début doit être avant l'heure de fin");
        }
        
        // Vérifier que c'est dans les heures ouvrables (8h-17h)
        if (startTime.isBefore(LocalTime.of(8, 0)) || 
            endTime.isAfter(LocalTime.of(17, 0))) {
            throw new IllegalArgumentException(
                    "Les réservations doivent être entre 8h et 17h");
        }
        
        // Vérifier que ce n'est pas pendant la pause déjeuner (12h-13h)
        if ((startTime.isBefore(LocalTime.of(13, 0)) && 
             endTime.isAfter(LocalTime.of(12, 0)))) {
            throw new IllegalArgumentException(
                    "Les réservations ne peuvent pas inclure la pause déjeuner (12h-13h)");
        }
    }
}
