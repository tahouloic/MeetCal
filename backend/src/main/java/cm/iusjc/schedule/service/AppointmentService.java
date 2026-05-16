package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.AppointmentResponse;
import cm.iusjc.schedule.model.dto.AvailableSlotResponse;
import cm.iusjc.schedule.model.dto.CreateAppointmentRequest;
import cm.iusjc.schedule.model.entity.Appointment;
import cm.iusjc.schedule.model.entity.Availability;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.model.enums.AppointmentStatus;
import cm.iusjc.schedule.repository.AppointmentRepository;
import cm.iusjc.schedule.repository.AvailabilityRepository;
import cm.iusjc.schedule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request, UUID requestorId) {
        log.info("=== AppointmentService.createAppointment START ===");
        
        try {
            log.info("Step 1: Finding requestor with ID: {}", requestorId);
            User requestor = userRepository.findById(requestorId)
                .orElseThrow(() -> new RuntimeException("Requestor not found"));
            log.info("✓ Requestor found: {} ({})", requestor.getEmail(), requestor.getId());
            
            log.info("Step 2: Parsing recipient ID: {}", request.getRecipientId());
            UUID recipientUuid = UUID.fromString(request.getRecipientId());
            log.info("✓ Recipient UUID parsed: {}", recipientUuid);
            
            log.info("Step 3: Finding recipient");
            User recipient = userRepository.findById(recipientUuid)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));
            log.info("✓ Recipient found: {} ({})", recipient.getEmail(), recipient.getId());
            
            log.info("Step 4: Checking if slot is available for time: {}", request.getSlotTime());
            boolean available = isSlotAvailable(recipient, request.getSlotTime());
            log.info("✓ Slot availability check result: {}", available);
            
            if (!available) {
                throw new RuntimeException("This time slot is not available");
            }
            
            log.info("Step 5: Checking for existing appointments at this time");
            List<Appointment> existingAppointments = appointmentRepository
                .findAcceptedAppointmentsByRecipientAndTime(recipient, request.getSlotTime());
            log.info("✓ Found {} existing appointments", existingAppointments.size());
            
            if (!existingAppointments.isEmpty()) {
                throw new RuntimeException("This time slot is already booked");
            }
            
            log.info("Step 6: Getting timezones - Requestor: {}, Recipient: {}", 
                requestor.getTimezone(), recipient.getTimezone());
            
            log.info("Step 7: Converting to UTC");
            LocalDateTime utcTime = convertToUtc(request.getSlotTime(), requestor.getTimezone());
            log.info("✓ UTC time: {}", utcTime);
            
            log.info("Step 8: Building appointment entity");
            Appointment appointment = Appointment.builder()
                .requestor(requestor)
                .recipient(recipient)
                .slotTime(request.getSlotTime())
                .slotTimeUtc(utcTime)
                .requestorTimezone(requestor.getTimezone())
                .recipientTimezone(recipient.getTimezone())
                .message(request.getMessage())
                .status(AppointmentStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusHours(48))
                .build();
            log.info("✓ Appointment entity built");
            
            log.info("Step 9: Saving appointment to database");
            appointment = appointmentRepository.save(appointment);
            log.info("✓ Appointment saved with ID: {}", appointment.getId());
            
            log.info("Step 10: Mapping to response");
            AppointmentResponse response = mapToResponse(appointment);
            log.info("✓ Response mapped");
            
            log.info("=== AppointmentService.createAppointment SUCCESS ===");
            return response;
            
        } catch (Exception e) {
            log.error("❌ ERROR in AppointmentService.createAppointment", e);
            log.error("Exception type: {}", e.getClass().getName());
            log.error("Exception message: {}", e.getMessage());
            throw e;
        }
    }
    
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getSentAppointments(UUID userId, AppointmentStatus status) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Appointment> appointments;
        if (status != null) {
            appointments = appointmentRepository.findByRequestorAndStatusOrderByCreatedAtDesc(user, status);
        } else {
            appointments = appointmentRepository.findByRequestorOrderByCreatedAtDesc(user);
        }
        
        return appointments.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getReceivedAppointments(UUID userId, AppointmentStatus status) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Appointment> appointments;
        if (status != null) {
            appointments = appointmentRepository.findByRecipientAndStatusOrderByCreatedAtDesc(user, status);
        } else {
            appointments = appointmentRepository.findByRecipientOrderByCreatedAtDesc(user);
        }
        
        return appointments.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public AppointmentResponse acceptAppointment(UUID appointmentId, UUID userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        if (!appointment.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to accept this appointment");
        }
        
        if (!appointment.canBeModified()) {
            throw new RuntimeException("This appointment cannot be modified");
        }
        
        appointment.setStatus(AppointmentStatus.ACCEPTED);
        appointment.setRespondedAt(LocalDateTime.now());
        
        appointment = appointmentRepository.save(appointment);
        
        return mapToResponse(appointment);
    }
    
    @Transactional
    public AppointmentResponse rejectAppointment(UUID appointmentId, UUID userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        if (!appointment.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to reject this appointment");
        }
        
        if (!appointment.canBeModified()) {
            throw new RuntimeException("This appointment cannot be modified");
        }
        
        appointment.setStatus(AppointmentStatus.REJECTED);
        appointment.setRespondedAt(LocalDateTime.now());
        
        appointment = appointmentRepository.save(appointment);
        
        return mapToResponse(appointment);
    }
    
    @Transactional(readOnly = true)
    public List<AvailableSlotResponse> getAvailableSlots(UUID userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Availability> availabilities = availabilityRepository.findByUser(user);
        List<AvailableSlotResponse> slots = new ArrayList<>();
        
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            DayOfWeek dayOfWeek = currentDate.getDayOfWeek();
            
            LocalDate finalCurrentDate = currentDate;
            List<Availability> dayAvailabilities = availabilities.stream()
                .filter(a -> a.getDayOfWeek() != null && a.getDayOfWeek() == dayOfWeek)
                .collect(Collectors.toList());
            
            for (Availability availability : dayAvailabilities) {
                LocalDateTime slotDateTime = LocalDateTime.of(finalCurrentDate, availability.getStartTime());
                boolean isBooked = !appointmentRepository
                    .findAcceptedAppointmentsByRecipientAndTime(user, slotDateTime)
                    .isEmpty();
                
                slots.add(AvailableSlotResponse.builder()
                    .date(finalCurrentDate.toString())
                    .startTime(availability.getStartTime().toString())
                    .endTime(availability.getEndTime().toString())
                    .isAvailable(!isBooked)
                    .build());
            }
            
            currentDate = currentDate.plusDays(1);
        }
        
        return slots;
    }
    
    private boolean isSlotAvailable(User recipient, LocalDateTime slotTime) {
        DayOfWeek dayOfWeek = slotTime.getDayOfWeek();
        LocalTime time = slotTime.toLocalTime();
        
        List<Availability> availabilities = availabilityRepository.findByUser(recipient);
        
        return availabilities.stream()
            .anyMatch(a -> 
                a.getDayOfWeek() != null &&
                a.getDayOfWeek() == dayOfWeek &&
                !time.isBefore(a.getStartTime()) &&
                time.isBefore(a.getEndTime())  // Strictement inférieur à endTime
            );
    }
    
    private LocalDateTime convertToUtc(LocalDateTime localTime, String timezone) {
        // Use default timezone if null
        String effectiveTimezone = (timezone != null && !timezone.isEmpty()) ? timezone : "Africa/Douala";
        ZoneId zoneId = ZoneId.of(effectiveTimezone);
        return localTime.atZone(zoneId).withZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime();
    }
    
    private AppointmentResponse mapToResponse(Appointment appointment) {
        return AppointmentResponse.builder()
            .id(appointment.getId())
            .requestorId(appointment.getRequestor().getId())
            .recipientId(appointment.getRecipient().getId())
            .slotTime(appointment.getSlotTime())
            .slotTimeUtc(appointment.getSlotTimeUtc())
            .requestorTimezone(appointment.getRequestorTimezone())
            .recipientTimezone(appointment.getRecipientTimezone())
            .message(appointment.getMessage())
            .status(appointment.getStatus())
            .expiresAt(appointment.getExpiresAt())
            .respondedAt(appointment.getRespondedAt())
            .createdAt(appointment.getCreatedAt())
            .requestorName(appointment.getRequestor().getFullName())
            .requestorEmail(appointment.getRequestor().getEmail())
            .recipientName(appointment.getRecipient().getFullName())
            .recipientEmail(appointment.getRecipient().getEmail())
            .build();
    }
}
