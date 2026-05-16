package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.request.SaveAvailabilitiesRequest;
import cm.iusjc.schedule.model.dto.response.AvailabilityResponse;
import cm.iusjc.schedule.model.dto.response.AvailableSlotDTO;
import cm.iusjc.schedule.model.entity.Availability;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.repository.AvailabilityRepository;
import cm.iusjc.schedule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilityService {
    
    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public AvailabilityResponse saveAvailabilities(User user, SaveAvailabilitiesRequest request) {
        log.info("💾 Sauvegarde des disponibilités pour l'utilisateur: {}", user.getEmail());
        
        // Supprimer les anciennes disponibilités
        availabilityRepository.deleteByUser(user);
        log.info("🗑️ Anciennes disponibilités supprimées");
        
        // Créer les nouvelles disponibilités
        List<Availability> availabilities = request.getAvailabilities().stream()
                .map(slot -> Availability.builder()
                        .user(user)
                        .dayOfWeek(DayOfWeek.valueOf(slot.getDayOfWeek()))
                        .startTime(LocalTime.parse(slot.getStartTime()))
                        .endTime(LocalTime.parse(slot.getEndTime()))
                        .isAvailable(slot.getIsAvailable())
                        .build())
                .collect(Collectors.toList());
        
        availabilityRepository.saveAll(availabilities);
        log.info("✅ {} créneaux de disponibilité sauvegardés", availabilities.size());
        
        return buildAvailabilityResponse(user);
    }
    
    public AvailabilityResponse getAvailabilities(User user) {
        return buildAvailabilityResponse(user);
    }
    
    public AvailabilityResponse getUserAvailabilities(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        return buildAvailabilityResponse(user);
    }
    
    public List<AvailableSlotDTO> getUserAvailabilitySlots(UUID userId, String startDateStr, String endDateStr) {
        User user = userRepository.findById(userId)
                .orElse(null);
        
        if (user == null) {
            return List.of();
        }
        
        // Récupérer les disponibilités hebdomadaires
        List<Availability> weeklyAvailabilities = availabilityRepository.findByUser(user);
        
        if (weeklyAvailabilities.isEmpty()) {
            return List.of();
        }
        
        // Déterminer la plage de dates
        LocalDate startDate = startDateStr != null ? LocalDate.parse(startDateStr) : LocalDate.now();
        LocalDate endDate = endDateStr != null ? LocalDate.parse(endDateStr) : startDate.plusDays(7);
        
        // Convertir les disponibilités hebdomadaires en créneaux spécifiques par date
        List<AvailableSlotDTO> slots = new ArrayList<>();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE;
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            
            // Trouver les disponibilités pour ce jour de la semaine
            for (Availability availability : weeklyAvailabilities) {
                if (availability.getDayOfWeek() == dayOfWeek && availability.getIsAvailable()) {
                    AvailableSlotDTO slot = AvailableSlotDTO.builder()
                            .date(date.format(dateFormatter))
                            .startTime(availability.getStartTime().toString())
                            .endTime(availability.getEndTime().toString())
                            .dayOfWeek(dayOfWeek.getValue())
                            .isAvailable(true)
                            .build();
                    slots.add(slot);
                }
            }
        }
        
        return slots;
    }
    
    private AvailabilityResponse buildAvailabilityResponse(User user) {
        List<Availability> availabilities = availabilityRepository.findByUser(user);
        
        List<AvailabilityResponse.AvailabilitySlotResponse> slots = availabilities.stream()
                .map(a -> AvailabilityResponse.AvailabilitySlotResponse.builder()
                        .id(a.getId())
                        .dayOfWeek(a.getDayOfWeek().name())
                        .startTime(a.getStartTime().toString())
                        .endTime(a.getEndTime().toString())
                        .isAvailable(a.getIsAvailable())
                        .build())
                .collect(Collectors.toList());
        
        return AvailabilityResponse.builder()
                .teacherId(user.getId()) // Garder le nom du champ pour compatibilité
                .teacherName(user.getFullName())
                .availabilities(slots)
                .build();
    }
}
