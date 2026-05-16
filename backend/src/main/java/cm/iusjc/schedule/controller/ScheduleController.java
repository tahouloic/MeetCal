package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.request.CreateTimeSlotRequest;
import cm.iusjc.schedule.model.dto.request.GenerateScheduleRequest;
import cm.iusjc.schedule.model.dto.request.UpdateTimeSlotRequest;
import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.ScheduleResponse;
import cm.iusjc.schedule.model.dto.response.TimeSlotResponse;
import cm.iusjc.schedule.model.entity.*;
import cm.iusjc.schedule.repository.*;
import cm.iusjc.schedule.service.ScheduleGenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
@Slf4j
public class ScheduleController {
    
    private final ScheduleGenerationService scheduleGenerationService;
    private final WeeklyScheduleRepository scheduleRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final ClassGroupRepository classGroupRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final RoomRepository roomRepository;
    
    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> generateAllSchedules(
        @RequestParam(required = false) Integer weekNumber,
        @RequestParam(required = false) Integer year
    ) {
        try {
            log.info("========================================");
            log.info("🚀 DÉBUT GÉNÉRATION DES EMPLOIS DU TEMPS");
            log.info("========================================");
            
            // Si pas de semaine spécifiée, utiliser la semaine courante
            if (weekNumber == null || year == null) {
                LocalDate now = LocalDate.now();
                WeekFields weekFields = WeekFields.ISO;
                weekNumber = now.get(weekFields.weekOfYear());
                year = now.getYear();
            }
            
            log.info("📅 Génération de tous les emplois du temps pour semaine: {}, année: {}", weekNumber, year);
            
            // Récupérer toutes les classes
            List<ClassGroup> classGroups = classGroupRepository.findAll();
            
            log.info("📚 Nombre de classes trouvées: {}", classGroups.size());
            
            if (classGroups.isEmpty()) {
                log.warn("⚠️ Aucune classe trouvée dans la base de données");
                return ResponseEntity.ok(ApiResponse.<List<ScheduleResponse>>builder()
                    .success(false)
                    .message("Aucune classe trouvée dans la base de données")
                    .data(List.of())
                    .build());
            }
            
            List<ScheduleResponse> generatedSchedules = new ArrayList<>();
            int successCount = 0;
            int errorCount = 0;
            
            final Integer finalWeekNumber = weekNumber;
            final Integer finalYear = year;
            
            // Supprimer les emplois du temps existants pour cette semaine
            log.info("🗑️ Suppression des emplois du temps existants pour semaine {} année {}", weekNumber, year);
            scheduleRepository.deleteByWeekNumberAndYear(weekNumber, year);
            
            // Générer pour chaque classe
            log.info("⚙️ Début de la génération pour {} classe(s)", classGroups.size());
            for (ClassGroup classGroup : classGroups) {
                try {
                    log.info("📝 Génération pour la classe: {} (ID: {})", classGroup.getName(), classGroup.getId());
                    WeeklySchedule schedule = scheduleGenerationService.generateSchedule(
                        classGroup.getId(),
                        finalWeekNumber,
                        finalYear
                    );
                    
                    ScheduleResponse response = mapToScheduleResponse(schedule);
                    generatedSchedules.add(response);
                    successCount++;
                    
                    log.info("✅ Emploi du temps généré pour: {} avec {} créneaux", 
                             classGroup.getName(), schedule.getTimeSlots().size());
                } catch (Exception e) {
                    log.error("❌ Erreur lors de la génération pour {}: {}", classGroup.getName(), e.getMessage(), e);
                    errorCount++;
                }
            }
            
            String message = String.format(
                "Génération terminée: %d succès, %d erreurs sur %d classes",
                successCount, errorCount, classGroups.size()
            );
            
            log.info("========================================");
            log.info("📊 RÉSULTAT: {}", message);
            log.info("========================================");
            
            return ResponseEntity.ok(ApiResponse.<List<ScheduleResponse>>builder()
                .success(true)
                .message(message)
                .data(generatedSchedules)
                .build());
                
        } catch (Exception e) {
            log.error("💥 ERREUR CRITIQUE lors de la génération:", e);
            return ResponseEntity.ok(ApiResponse.<List<ScheduleResponse>>builder()
                .success(false)
                .message("Erreur: " + e.getMessage())
                .data(List.of())
                .build());
        }
    }
    
    // Endpoint de test simple
    @PostMapping("/test-generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> testGenerate() {
        log.info("🧪 TEST POST ENDPOINT APPELÉ!");
        return ResponseEntity.ok("Test POST réussi!");
    }
    
    @GetMapping("/test-generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> testGenerateGet() {
        log.info("🧪 TEST GET ENDPOINT APPELÉ!");
        return ResponseEntity.ok("Test GET réussi!");
    }
    
    @GetMapping("/class/{classId}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> getClassSchedule(
        @PathVariable UUID classId,
        @RequestParam(required = false) Integer weekNumber,
        @RequestParam(required = false) Integer year
    ) {
        // Si pas de semaine spécifiée, utiliser la semaine courante
        if (weekNumber == null || year == null) {
            LocalDate now = LocalDate.now();
            WeekFields weekFields = WeekFields.ISO;
            weekNumber = now.get(weekFields.weekOfYear());
            year = now.getYear();
        }
        
        ClassGroup classGroup = classGroupRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Classe non trouvée"));
        
        WeeklySchedule schedule = scheduleRepository
            .findByClassGroupAndWeekNumberAndYear(classGroup, weekNumber, year)
            .orElse(null);
        
        if (schedule == null) {
            return ResponseEntity.ok(ApiResponse.<ScheduleResponse>builder()
                .success(true)
                .message("Aucun emploi du temps trouvé pour cette semaine")
                .data(null)
                .build());
        }
        
        ScheduleResponse response = mapToScheduleResponse(schedule);
        
        return ResponseEntity.ok(ApiResponse.<ScheduleResponse>builder()
            .success(true)
            .message("Emploi du temps récupéré avec succès")
            .data(response)
            .build());
    }
    
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getTeacherSchedules(
        @PathVariable UUID teacherId,
        @RequestParam(required = false) Integer weekNumber,
        @RequestParam(required = false) Integer year
    ) {
        // Si pas de semaine spécifiée, utiliser la semaine courante
        if (weekNumber == null || year == null) {
            LocalDate now = LocalDate.now();
            WeekFields weekFields = WeekFields.ISO;
            weekNumber = now.get(weekFields.weekOfYear());
            year = now.getYear();
        }
        
        List<WeeklySchedule> schedules = scheduleRepository
            .findByTeacherIdAndWeek(teacherId, weekNumber, year);
        
        List<ScheduleResponse> responses = schedules.stream()
            .map(this::mapToScheduleResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.<List<ScheduleResponse>>builder()
            .success(true)
            .message("Emplois du temps récupérés avec succès")
            .data(responses)
            .build());
    }

    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getAllSchedules(
        @RequestParam(required = false) Integer weekNumber,
        @RequestParam(required = false) Integer year
    ) {
        // Si pas de semaine spécifiée, utiliser la semaine courante
        if (weekNumber == null || year == null) {
            LocalDate now = LocalDate.now();
            WeekFields weekFields = WeekFields.ISO;
            weekNumber = now.get(weekFields.weekOfYear());
            year = now.getYear();
        }
        
        List<WeeklySchedule> schedules = scheduleRepository
            .findByWeekNumberAndYear(weekNumber, year);
        
        List<ScheduleResponse> responses = schedules.stream()
            .map(this::mapToScheduleResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.<List<ScheduleResponse>>builder()
            .success(true)
            .message("Emplois du temps récupérés avec succès")
            .data(responses)
            .build());
    }
    
    @PostMapping("/timeslot")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TimeSlotResponse>> createTimeSlot(
        @Valid @RequestBody CreateTimeSlotRequest request
    ) {
        log.info("Création d'un nouveau créneau");
        
        try {
            // Récupérer l'emploi du temps
            WeeklySchedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Emploi du temps non trouvé"));
            
            // Récupérer les entités
            Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
            
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
            
            Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Salle non trouvée"));
            
            // Créer le créneau
            TimeSlot timeSlot = TimeSlot.builder()
                .schedule(schedule)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .course(course)
                .teacher(teacher)
                .room(room)
                .isManuallySet(true)
                .build();
            
            timeSlot = timeSlotRepository.save(timeSlot);
            
            TimeSlotResponse response = mapToTimeSlotResponse(timeSlot);
            
            return ResponseEntity.ok(ApiResponse.<TimeSlotResponse>builder()
                .success(true)
                .message("Créneau créé avec succès")
                .data(response)
                .build());
        } catch (Exception e) {
            log.error("Erreur lors de la création du créneau:", e);
            return ResponseEntity.ok(ApiResponse.<TimeSlotResponse>builder()
                .success(false)
                .message("Erreur: " + e.getMessage())
                .data(null)
                .build());
        }
    }
    
    @PutMapping("/timeslot/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TimeSlotResponse>> updateTimeSlot(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateTimeSlotRequest request
    ) {
        log.info("Modification manuelle du créneau: {}", id);
        
        TimeSlot timeSlot = timeSlotRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Créneau non trouvé"));
        
        // Récupérer les entités
        Course course = courseRepository.findById(request.getCourseId())
            .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
            .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
        
        Room room = roomRepository.findById(request.getRoomId())
            .orElseThrow(() -> new RuntimeException("Salle non trouvée"));
        
        // Mettre à jour SEULEMENT le cours, l'enseignant et la salle
        // Le jour et l'heure ne changent PAS
        timeSlot.setCourse(course);
        timeSlot.setTeacher(teacher);
        timeSlot.setRoom(room);
        timeSlot.setIsManuallySet(true);
        
        timeSlot = timeSlotRepository.save(timeSlot);
        
        TimeSlotResponse response = mapToTimeSlotResponse(timeSlot);
        
        return ResponseEntity.ok(ApiResponse.<TimeSlotResponse>builder()
            .success(true)
            .message("Créneau modifié avec succès")
            .data(response)
            .build());
    }
    
    @GetMapping("/current")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getCurrentWeekSchedules(
        @AuthenticationPrincipal User user
    ) {
        LocalDate now = LocalDate.now();
        WeekFields weekFields = WeekFields.ISO;
        Integer weekNumber = now.get(weekFields.weekOfYear());
        Integer year = now.getYear();
        
        List<WeeklySchedule> schedules;
        
        if (user.getRole().name().equals("ADMIN")) {
            schedules = scheduleRepository.findByWeekNumberAndYear(weekNumber, year);
        } else if (user.getRole().name().equals("TEACHER")) {
            Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
            schedules = scheduleRepository.findByTeacherIdAndWeek(teacher.getId(), weekNumber, year);
        } else {
            schedules = List.of();
        }
        
        List<ScheduleResponse> responses = schedules.stream()
            .map(this::mapToScheduleResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.<List<ScheduleResponse>>builder()
            .success(true)
            .message("Emplois du temps de la semaine courante récupérés")
            .data(responses)
            .build());
    }
    
    private ScheduleResponse mapToScheduleResponse(WeeklySchedule schedule) {
        List<TimeSlotResponse> timeSlots = schedule.getTimeSlots().stream()
            .map(this::mapToTimeSlotResponse)
            .collect(Collectors.toList());
        
        return ScheduleResponse.builder()
            .id(schedule.getId())
            .weekNumber(schedule.getWeekNumber())
            .year(schedule.getYear())
            .weekStartDate(schedule.getWeekStartDate())
            .classGroupId(schedule.getClassGroup().getId())
            .classGroupName(schedule.getClassGroup().getName())
            .timeSlots(timeSlots)
            .isGenerated(schedule.getIsGenerated())
            .isPublished(schedule.getIsPublished())
            .build();
    }
    
    private TimeSlotResponse mapToTimeSlotResponse(TimeSlot slot) {
        return TimeSlotResponse.builder()
            .id(slot.getId())
            .dayOfWeek(slot.getDayOfWeek())
            .startTime(slot.getStartTime())
            .endTime(slot.getEndTime())
            .courseId(slot.getCourse().getId())
            .courseName(slot.getCourse().getName())
            .courseCode(slot.getCourse().getCode())
            .teacherId(slot.getTeacher().getId())
            .teacherName(slot.getTeacher().getUser().getFirstName() + " " + 
                        slot.getTeacher().getUser().getLastName())
            .teacherEmail(slot.getTeacher().getUser().getEmail())
            .roomId(slot.getRoom().getId())
            .roomCode(slot.getRoom().getCode())
            .roomCapacity(slot.getRoom().getCapacity())
            .isManuallySet(slot.getIsManuallySet())
            .build();
    }
}
