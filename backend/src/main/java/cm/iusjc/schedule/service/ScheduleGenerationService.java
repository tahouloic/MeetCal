package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.entity.*;
import cm.iusjc.schedule.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleGenerationService {
    
    private final WeeklyScheduleRepository scheduleRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final CourseRepository courseRepository;
    private final RoomRepository roomRepository;
    private final AvailabilityRepository availabilityRepository;
    private final RoomReservationRepository reservationRepository;
    private final TeacherRepository teacherRepository;
    private final ClassGroupRepository classGroupRepository;
    
    // Heures de travail: 8h-17h (sans 12h-13h)
    private static final List<LocalTime> TIME_SLOTS = Arrays.asList(
        LocalTime.of(8, 0),
        LocalTime.of(9, 0),
        LocalTime.of(10, 0),
        LocalTime.of(11, 0),
        // 12h-13h: pause déjeuner
        LocalTime.of(13, 0),
        LocalTime.of(14, 0),
        LocalTime.of(15, 0),
        LocalTime.of(16, 0)
    );
    
    @Transactional
    public WeeklySchedule generateSchedule(UUID classGroupId, Integer weekNumber, Integer year) {
        log.info("Génération de l'emploi du temps pour la classe {} - Semaine {} de {}", 
                 classGroupId, weekNumber, year);
        
        // 1. Récupérer la classe
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
            .orElseThrow(() -> new RuntimeException("Classe non trouvée: " + classGroupId));
        
        log.info("   📚 Classe: {} (Filière: {})", 
                 classGroup.getName(), 
                 classGroup.getFieldOfStudy() != null ? classGroup.getFieldOfStudy().getName() : "N/A");
        
        // 2. Récupérer ou créer l'emploi du temps
        Optional<WeeklySchedule> existingSchedule = scheduleRepository
            .findByClassGroupAndWeekNumberAndYear(classGroup, weekNumber, year);
        
        WeeklySchedule schedule;
        if (existingSchedule.isPresent()) {
            schedule = existingSchedule.get();
            schedule.clearTimeSlots();
            log.info("Emploi du temps existant trouvé, régénération...");
        } else {
            LocalDate weekStart = getWeekStartDate(weekNumber, year);
            LocalDate weekEnd = weekStart.plusDays(6);
            schedule = WeeklySchedule.builder()
                .classGroup(classGroup)
                .weekNumber(weekNumber)
                .year(year)
                .weekStartDate(weekStart)
                .weekEndDate(weekEnd)
                .isGenerated(true)
                .isPublished(false)
                .build();
            log.info("Création d'un nouvel emploi du temps");
        }
        
        // 3. Récupérer UNIQUEMENT les cours de la filière de la classe
        List<Course> courses = courseRepository.findAll().stream()
            .filter(c -> c.getFieldOfStudy() != null)
            .filter(c -> c.getFieldOfStudy().getId().equals(classGroup.getFieldOfStudy().getId()))
            .collect(Collectors.toList());
        
        log.info("   📖 {} cours trouvés pour la filière {}", 
                 courses.size(), 
                 classGroup.getFieldOfStudy().getName());
        
        if (courses.isEmpty()) {
            log.warn("Aucun cours trouvé pour la filière de la classe");
            return scheduleRepository.save(schedule);
        }
        
        // 4. Récupérer les enseignants et leurs disponibilités
        Map<UUID, List<Availability>> teacherAvailabilities = new HashMap<>();
        List<Teacher> teachers = teacherRepository.findAll();
        for (Teacher teacher : teachers) {
            List<Availability> availabilities = availabilityRepository
                .findByUserIdAndIsAvailable(teacher.getUser().getId(), true);
            teacherAvailabilities.put(teacher.getId(), availabilities);
        }
        
        // 5. Récupérer les salles
        List<Room> rooms = roomRepository.findAll();
        
        // 6. Récupérer les réservations de la semaine
        LocalDate weekStart = getWeekStartDate(weekNumber, year);
        LocalDate weekEnd = weekStart.plusDays(6);
        List<RoomReservation> reservations = reservationRepository
            .findByEventDateBetween(weekStart, weekEnd);
        
        // 7. Générer les créneaux avec Ford-Fulkerson
        List<TimeSlot> generatedSlots = generateTimeSlotsWithFordFulkerson(
            schedule, courses, teachers, teacherAvailabilities, rooms, reservations, weekNumber, year
        );
        
        // 8. Ajouter les créneaux à l'emploi du temps
        for (TimeSlot slot : generatedSlots) {
            schedule.addTimeSlot(slot);
        }
        
        log.info("Emploi du temps généré avec {} créneaux", generatedSlots.size());
        return scheduleRepository.save(schedule);
    }

    
    private List<TimeSlot> generateTimeSlotsWithFordFulkerson(
        WeeklySchedule schedule,
        List<Course> courses,
        List<Teacher> teachers,
        Map<UUID, List<Availability>> teacherAvailabilities,
        List<Room> rooms,
        List<RoomReservation> reservations,
        Integer weekNumber,
        Integer year
    ) {
        List<TimeSlot> slots = new ArrayList<>();
        
        log.info("🔄 Génération des créneaux avec gestion des collisions...");
        log.info("   Cours disponibles: {}", courses.size());
        log.info("   Enseignants: {}", teachers.size());
        log.info("   Salles: {}", rooms.size());
        log.info("   Effectif de la classe: {}", schedule.getClassGroup().getStudentCount());
        
        // Créer une liste de tous les créneaux possibles pour chaque enseignant
        List<TeacherSlotRequest> slotRequests = new ArrayList<>();
        
        for (Teacher teacher : teachers) {
            List<Availability> availabilities = teacherAvailabilities.get(teacher.getId());
            if (availabilities == null || availabilities.isEmpty()) {
                log.warn("   ⚠️ Enseignant {} n'a pas de disponibilités", teacher.getUser().getEmail());
                continue;
            }
            
            log.info("   👨‍🏫 Traitement enseignant: {} ({} disponibilités)", 
                     teacher.getUser().getEmail(), availabilities.size());
            
            for (Availability availability : availabilities) {
                if (!availability.getIsAvailable()) continue;
                
                DayOfWeek day = availability.getDayOfWeek();
                LocalTime startTime = availability.getStartTime();
                LocalTime endTime = availability.getEndTime();
                
                // Pour chaque heure dans la disponibilité
                LocalTime currentTime = startTime;
                while (currentTime.isBefore(endTime)) {
                    LocalTime slotEnd = currentTime.plusHours(1);
                    
                    // Trouver un cours que l'enseignant peut enseigner
                    Course course = findAvailableCourse(teacher, courses);
                    if (course != null) {
                        slotRequests.add(new TeacherSlotRequest(
                            teacher, course, day, currentTime, slotEnd, true
                        ));
                    }
                    
                    currentTime = slotEnd;
                }
            }
        }
        
        log.info("   📋 {} demandes de créneaux à traiter", slotRequests.size());
        
        // Trier les demandes par priorité (disponibilités préférées en premier)
        slotRequests.sort((a, b) -> Boolean.compare(b.isPreferred, a.isPreferred));
        
        // Traiter chaque demande
        List<TeacherSlotRequest> failedRequests = new ArrayList<>();
        
        for (TeacherSlotRequest request : slotRequests) {
            // Vérifier si l'enseignant est déjà programmé à ce moment
            boolean teacherBusy = slots.stream()
                .anyMatch(slot -> 
                    slot.getTeacher().getId().equals(request.teacher.getId()) &&
                    slot.getDayOfWeek() == request.day &&
                    slot.getStartTime().isBefore(request.endTime) &&
                    slot.getEndTime().isAfter(request.startTime)
                );
            
            if (teacherBusy) {
                log.debug("      ⏭️ Enseignant {} déjà occupé à {} {}", 
                         request.teacher.getUser().getEmail(), request.day, request.startTime);
                // Ajouter à la liste des demandes échouées pour reprogrammation
                failedRequests.add(request);
                continue;
            }
            
            // Trouver une salle disponible avec capacité suffisante
            Room room = findAvailableRoomWithCapacity(
                rooms, 
                schedule.getClassGroup().getStudentCount(),
                request.day, 
                request.startTime, 
                request.endTime, 
                reservations, 
                weekNumber, 
                year, 
                slots
            );
            
            if (room == null) {
                log.debug("      ⏭️ Pas de salle disponible pour {} à {} {}", 
                         request.teacher.getUser().getEmail(), request.day, request.startTime);
                failedRequests.add(request);
                continue;
            }
            
            // Créer le créneau
            TimeSlot slot = TimeSlot.builder()
                .schedule(schedule)
                .dayOfWeek(request.day)
                .startTime(request.startTime)
                .endTime(request.endTime)
                .course(request.course)
                .teacher(request.teacher)
                .room(room)
                .isManuallySet(false)
                .build();
            
            slots.add(slot);
            log.info("      ✅ Créneau créé: {} {} - {} ({} - Salle: {})", 
                     request.day, request.startTime, request.endTime, 
                     request.course.getName(), room.getCode());
        }
        
        // Reprogrammer les demandes échouées sur d'autres créneaux libres
        log.info("   🔄 Reprogrammation de {} créneaux échoués...", failedRequests.size());
        
        for (TeacherSlotRequest failedRequest : failedRequests) {
            boolean rescheduled = false;
            
            // Essayer tous les jours de la semaine
            for (DayOfWeek day : Arrays.asList(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, 
                                                DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, 
                                                DayOfWeek.FRIDAY)) {
                if (rescheduled) break;
                
                // Essayer tous les créneaux horaires
                for (LocalTime time : TIME_SLOTS) {
                    LocalTime endTime = time.plusHours(1);
                    
                    // Vérifier si l'enseignant est libre
                    boolean teacherFree = slots.stream()
                        .noneMatch(slot -> 
                            slot.getTeacher().getId().equals(failedRequest.teacher.getId()) &&
                            slot.getDayOfWeek() == day &&
                            slot.getStartTime().isBefore(endTime) &&
                            slot.getEndTime().isAfter(time)
                        );
                    
                    if (!teacherFree) continue;
                    
                    // Trouver une salle disponible
                    Room room = findAvailableRoomWithCapacity(
                        rooms, 
                        schedule.getClassGroup().getStudentCount(),
                        day, 
                        time, 
                        endTime, 
                        reservations, 
                        weekNumber, 
                        year, 
                        slots
                    );
                    
                    if (room != null) {
                        // Créer le créneau reprogrammé
                        TimeSlot slot = TimeSlot.builder()
                            .schedule(schedule)
                            .dayOfWeek(day)
                            .startTime(time)
                            .endTime(endTime)
                            .course(failedRequest.course)
                            .teacher(failedRequest.teacher)
                            .room(room)
                            .isManuallySet(false)
                            .build();
                        
                        slots.add(slot);
                        log.info("      ♻️ Créneau reprogrammé: {} {} - {} ({} - Salle: {})", 
                                 day, time, endTime, 
                                 failedRequest.course.getName(), room.getCode());
                        rescheduled = true;
                        break;
                    }
                }
            }
            
            if (!rescheduled) {
                log.warn("      ❌ Impossible de reprogrammer le créneau pour {} ({})", 
                         failedRequest.teacher.getUser().getEmail(), 
                         failedRequest.course.getName());
            }
        }
        
        log.info("✅ Génération terminée: {} créneaux créés", slots.size());
        return slots;
    }
    
    // Classe interne pour représenter une demande de créneau
    private static class TeacherSlotRequest {
        Teacher teacher;
        Course course;
        DayOfWeek day;
        LocalTime startTime;
        LocalTime endTime;
        boolean isPreferred; // true si c'est dans les disponibilités de l'enseignant
        
        TeacherSlotRequest(Teacher teacher, Course course, DayOfWeek day, 
                          LocalTime startTime, LocalTime endTime, boolean isPreferred) {
            this.teacher = teacher;
            this.course = course;
            this.day = day;
            this.startTime = startTime;
            this.endTime = endTime;
            this.isPreferred = isPreferred;
        }
    }
    
    private Course findAvailableCourse(Teacher teacher, List<Course> courses) {
        // Trouver un cours que l'enseignant peut enseigner
        // Vérifier dans la relation teacher_courses
        if (teacher.getCourses() == null || teacher.getCourses().isEmpty()) {
            log.debug("      ⚠️ Enseignant {} n'a aucun cours assigné", teacher.getUser().getEmail());
            return null;
        }
        
        // Trouver un cours dans la liste qui est aussi dans les cours de l'enseignant
        for (Course course : courses) {
            if (teacher.getCourses().contains(course)) {
                return course;
            }
        }
        
        log.debug("      ⚠️ Enseignant {} ne peut enseigner aucun des cours de cette filière", 
                 teacher.getUser().getEmail());
        return null;
    }
    
    private Room findAvailableRoom(
        List<Room> rooms,
        DayOfWeek day,
        LocalTime startTime,
        LocalTime endTime,
        List<RoomReservation> reservations,
        Integer weekNumber,
        Integer year,
        List<TimeSlot> existingSlots
    ) {
        for (Room room : rooms) {
            // Vérifier les réservations
            boolean hasReservationConflict = hasRoomReservationConflict(
                room.getId(), day, startTime, endTime, reservations, weekNumber, year
            );
            
            if (hasReservationConflict) continue;
            
            // Vérifier les créneaux déjà créés
            boolean hasSlotConflict = existingSlots.stream()
                .anyMatch(slot -> 
                    slot.getRoom().getId().equals(room.getId()) &&
                    slot.getDayOfWeek() == day &&
                    slot.getStartTime().isBefore(endTime) &&
                    slot.getEndTime().isAfter(startTime)
                );
            
            if (!hasSlotConflict) {
                return room;
            }
        }
        
        return null;
    }
    
    private Room findAvailableRoomWithCapacity(
        List<Room> rooms,
        Integer classSize,
        DayOfWeek day,
        LocalTime startTime,
        LocalTime endTime,
        List<RoomReservation> reservations,
        Integer weekNumber,
        Integer year,
        List<TimeSlot> existingSlots
    ) {
        // Filtrer les salles par capacité suffisante
        List<Room> suitableRooms = rooms.stream()
            .filter(room -> room.getCapacity() >= classSize)
            .collect(Collectors.toList());
        
        if (suitableRooms.isEmpty()) {
            log.warn("      ⚠️ Aucune salle avec capacité suffisante ({} étudiants)", classSize);
            return null;
        }
        
        // Trouver une salle disponible parmi les salles adaptées
        for (Room room : suitableRooms) {
            // Vérifier les réservations
            boolean hasReservationConflict = hasRoomReservationConflict(
                room.getId(), day, startTime, endTime, reservations, weekNumber, year
            );
            
            if (hasReservationConflict) continue;
            
            // Vérifier les créneaux déjà créés
            boolean hasSlotConflict = existingSlots.stream()
                .anyMatch(slot -> 
                    slot.getRoom().getId().equals(room.getId()) &&
                    slot.getDayOfWeek() == day &&
                    slot.getStartTime().isBefore(endTime) &&
                    slot.getEndTime().isAfter(startTime)
                );
            
            if (!hasSlotConflict) {
                log.debug("      ✓ Salle {} sélectionnée (capacité: {} >= {})", 
                         room.getCode(), room.getCapacity(), classSize);
                return room;
            }
        }
        
        return null;
    }
    
    private boolean hasRoomReservationConflict(
        UUID roomId,
        DayOfWeek day,
        LocalTime startTime,
        LocalTime endTime,
        List<RoomReservation> reservations,
        Integer weekNumber,
        Integer year
    ) {
        LocalDate weekStart = getWeekStartDate(weekNumber, year);
        LocalDate targetDate = weekStart.plusDays(day.getValue() - 1);
        
        return reservations.stream()
            .anyMatch(r -> 
                r.getRoom().getId().equals(roomId) &&
                r.getEventDate().equals(targetDate) &&
                r.getStartTime().isBefore(endTime) &&
                r.getEndTime().isAfter(startTime)
            );
    }
    
    private FlowGraph buildFlowGraph(
        List<Course> courses,
        List<Teacher> teachers,
        Map<UUID, List<Availability>> teacherAvailabilities,
        List<Room> rooms,
        List<RoomReservation> reservations,
        Integer weekNumber,
        Integer year
    ) {
        FlowGraph graph = new FlowGraph();
        
        // Nœuds: Source → Cours → (Enseignant, Jour, Heure) → Salle → Sink
        int nodeId = 0;
        int source = nodeId++;
        int sink = nodeId++;
        
        graph.setSource(source);
        graph.setSink(sink);
        
        // Mapper les cours aux nœuds
        Map<UUID, Integer> courseNodes = new HashMap<>();
        for (Course course : courses) {
            int courseNode = nodeId++;
            courseNodes.put(course.getId(), courseNode);
            // Source → Cours (capacité = nombre d'heures par semaine, ex: 2)
            graph.addEdge(source, courseNode, 2);
        }
        
        // Créer des nœuds pour chaque combinaison (Enseignant, Jour, Heure)
        Map<String, Integer> slotNodes = new HashMap<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) continue;
            
            for (LocalTime time : TIME_SLOTS) {
                for (Teacher teacher : teachers) {
                    // Vérifier si l'enseignant est disponible
                    if (isTeacherAvailable(teacher.getId(), day, time, teacherAvailabilities)) {
                        String slotKey = teacher.getId() + "_" + day + "_" + time;
                        int slotNode = nodeId++;
                        slotNodes.put(slotKey, slotNode);
                        
                        // Cours → Slot (si l'enseignant enseigne ce cours)
                        for (Course course : courses) {
                            if (teacherTeachesCourse(teacher, course)) {
                                int courseNode = courseNodes.get(course.getId());
                                graph.addEdge(courseNode, slotNode, 1);
                            }
                        }
                    }
                }
            }
        }
        
        // Mapper les salles aux nœuds
        Map<UUID, Integer> roomNodes = new HashMap<>();
        for (Room room : rooms) {
            int roomNode = nodeId++;
            roomNodes.put(room.getId(), roomNode);
            // Salle → Sink (capacité = nombre de créneaux disponibles)
            graph.addEdge(roomNode, sink, TIME_SLOTS.size() * 5); // 5 jours
        }
        
        // Slot → Salle (si la salle est disponible)
        for (Map.Entry<String, Integer> entry : slotNodes.entrySet()) {
            String[] parts = entry.getKey().split("_");
            DayOfWeek day = DayOfWeek.valueOf(parts[1]);
            LocalTime time = LocalTime.parse(parts[2]);
            
            for (Room room : rooms) {
                if (isRoomAvailable(room.getId(), day, time, reservations, weekNumber, year)) {
                    int slotNode = entry.getValue();
                    int roomNode = roomNodes.get(room.getId());
                    graph.addEdge(slotNode, roomNode, 1);
                }
            }
        }
        
        graph.setCourseNodes(courseNodes);
        graph.setSlotNodes(slotNodes);
        graph.setRoomNodes(roomNodes);
        
        return graph;
    }
    
    private int fordFulkerson(FlowGraph graph) {
        int maxFlow = 0;
        
        // Tant qu'il existe un chemin augmentant de source à sink
        while (true) {
            // BFS pour trouver un chemin augmentant
            Map<Integer, Integer> parent = new HashMap<>();
            Queue<Integer> queue = new LinkedList<>();
            Set<Integer> visited = new HashSet<>();
            
            queue.add(graph.getSource());
            visited.add(graph.getSource());
            parent.put(graph.getSource(), -1);
            
            boolean foundPath = false;
            while (!queue.isEmpty() && !foundPath) {
                int u = queue.poll();
                
                for (FlowEdge edge : graph.getEdges(u)) {
                    int v = edge.getTo();
                    int residualCapacity = edge.getCapacity() - edge.getFlow();
                    
                    if (!visited.contains(v) && residualCapacity > 0) {
                        visited.add(v);
                        parent.put(v, u);
                        queue.add(v);
                        
                        if (v == graph.getSink()) {
                            foundPath = true;
                            break;
                        }
                    }
                }
            }
            
            if (!foundPath) break;
            
            // Trouver le flot minimum sur le chemin
            int pathFlow = Integer.MAX_VALUE;
            int v = graph.getSink();
            while (v != graph.getSource()) {
                int u = parent.get(v);
                FlowEdge edge = graph.getEdge(u, v);
                pathFlow = Math.min(pathFlow, edge.getCapacity() - edge.getFlow());
                v = u;
            }
            
            // Mettre à jour les flots
            v = graph.getSink();
            while (v != graph.getSource()) {
                int u = parent.get(v);
                graph.addFlow(u, v, pathFlow);
                v = u;
            }
            
            maxFlow += pathFlow;
        }
        
        return maxFlow;
    }

    
    private List<TimeSlot> convertFlowToTimeSlots(
        WeeklySchedule schedule,
        FlowGraph graph,
        List<Course> courses,
        List<Teacher> teachers,
        List<Room> rooms
    ) {
        List<TimeSlot> slots = new ArrayList<>();
        
        // Parcourir les arêtes avec du flot pour créer les créneaux
        for (Map.Entry<UUID, Integer> courseEntry : graph.getCourseNodes().entrySet()) {
            UUID courseId = courseEntry.getKey();
            int courseNode = courseEntry.getValue();
            
            Course course = courses.stream()
                .filter(c -> c.getId().equals(courseId))
                .findFirst()
                .orElse(null);
            
            if (course == null) continue;
            
            // Trouver les slots avec du flot depuis ce cours
            for (Map.Entry<String, Integer> slotEntry : graph.getSlotNodes().entrySet()) {
                int slotNode = slotEntry.getValue();
                FlowEdge edge = graph.getEdge(courseNode, slotNode);
                
                if (edge != null && edge.getFlow() > 0) {
                    // Parser le slot key: teacherId_day_time
                    String[] parts = slotEntry.getKey().split("_");
                    UUID teacherId = UUID.fromString(parts[0]);
                    DayOfWeek day = DayOfWeek.valueOf(parts[1]);
                    LocalTime startTime = LocalTime.parse(parts[2]);
                    LocalTime endTime = startTime.plusHours(1);
                    
                    Teacher teacher = teachers.stream()
                        .filter(t -> t.getId().equals(teacherId))
                        .findFirst()
                        .orElse(null);
                    
                    if (teacher == null) continue;
                    
                    // Trouver la salle avec du flot depuis ce slot
                    Room assignedRoom = null;
                    for (Map.Entry<UUID, Integer> roomEntry : graph.getRoomNodes().entrySet()) {
                        int roomNode = roomEntry.getValue();
                        FlowEdge slotToRoom = graph.getEdge(slotNode, roomNode);
                        
                        if (slotToRoom != null && slotToRoom.getFlow() > 0) {
                            UUID roomId = roomEntry.getKey();
                            assignedRoom = rooms.stream()
                                .filter(r -> r.getId().equals(roomId))
                                .findFirst()
                                .orElse(null);
                            break;
                        }
                    }
                    
                    if (assignedRoom != null) {
                        TimeSlot slot = TimeSlot.builder()
                            .schedule(schedule)
                            .dayOfWeek(day)
                            .startTime(startTime)
                            .endTime(endTime)
                            .course(course)
                            .teacher(teacher)
                            .room(assignedRoom)
                            .isManuallySet(false)
                            .build();
                        
                        slots.add(slot);
                    }
                }
            }
        }
        
        return slots;
    }
    
    private boolean isTeacherAvailable(
        UUID teacherId,
        DayOfWeek day,
        LocalTime time,
        Map<UUID, List<Availability>> teacherAvailabilities
    ) {
        List<Availability> availabilities = teacherAvailabilities.get(teacherId);
        if (availabilities == null || availabilities.isEmpty()) {
            return false;
        }
        
        LocalTime endTime = time.plusHours(1);
        
        return availabilities.stream()
            .anyMatch(a -> 
                a.getDayOfWeek() == day &&
                a.getIsAvailable() &&
                !a.getStartTime().isAfter(time) &&
                !a.getEndTime().isBefore(endTime)
            );
    }
    
    private boolean teacherTeachesCourse(Teacher teacher, Course course) {
        // Vérifier si l'enseignant enseigne ce cours via la relation teacher_courses
        return teacher.getCourses() != null && teacher.getCourses().contains(course);
    }
    
    private boolean isRoomAvailable(
        UUID roomId,
        DayOfWeek day,
        LocalTime time,
        List<RoomReservation> reservations,
        Integer weekNumber,
        Integer year
    ) {
        LocalTime endTime = time.plusHours(1);
        
        // Vérifier les réservations
        LocalDate weekStart = getWeekStartDate(weekNumber, year);
        LocalDate targetDate = weekStart.plusDays(day.getValue() - 1);
        
        boolean hasReservationConflict = reservations.stream()
            .anyMatch(r -> 
                r.getRoom().getId().equals(roomId) &&
                r.getEventDate().equals(targetDate) &&
                r.getStartTime().isBefore(endTime) &&
                r.getEndTime().isAfter(time)
            );
        
        if (hasReservationConflict) {
            return false;
        }
        
        // Vérifier les conflits avec d'autres créneaux
        boolean hasTimeSlotConflict = timeSlotRepository.existsConflictForRoom(
            roomId, weekNumber, year, day, time, endTime
        );
        
        return !hasTimeSlotConflict;
    }
    
    private LocalDate getWeekStartDate(Integer weekNumber, Integer year) {
        WeekFields weekFields = WeekFields.ISO;
        return LocalDate.of(year, 1, 1)
            .with(weekFields.weekOfYear(), weekNumber)
            .with(weekFields.dayOfWeek(), 1);
    }
    
    // Classes internes pour le graphe de flot
    private static class FlowGraph {
        private int source;
        private int sink;
        private Map<Integer, List<FlowEdge>> adjacencyList = new HashMap<>();
        private Map<UUID, Integer> courseNodes;
        private Map<String, Integer> slotNodes;
        private Map<UUID, Integer> roomNodes;
        
        public void addEdge(int from, int to, int capacity) {
            FlowEdge edge = new FlowEdge(from, to, capacity);
            FlowEdge reverseEdge = new FlowEdge(to, from, 0);
            
            edge.setReverse(reverseEdge);
            reverseEdge.setReverse(edge);
            
            adjacencyList.computeIfAbsent(from, k -> new ArrayList<>()).add(edge);
            adjacencyList.computeIfAbsent(to, k -> new ArrayList<>()).add(reverseEdge);
        }
        
        public List<FlowEdge> getEdges(int node) {
            return adjacencyList.getOrDefault(node, new ArrayList<>());
        }
        
        public FlowEdge getEdge(int from, int to) {
            List<FlowEdge> edges = adjacencyList.get(from);
            if (edges == null) return null;
            
            return edges.stream()
                .filter(e -> e.getTo() == to)
                .findFirst()
                .orElse(null);
        }
        
        public void addFlow(int from, int to, int flow) {
            FlowEdge edge = getEdge(from, to);
            if (edge != null) {
                edge.addFlow(flow);
                edge.getReverse().addFlow(-flow);
            }
        }
        
        // Getters et setters
        public int getSource() { return source; }
        public void setSource(int source) { this.source = source; }
        public int getSink() { return sink; }
        public void setSink(int sink) { this.sink = sink; }
        public Map<UUID, Integer> getCourseNodes() { return courseNodes; }
        public void setCourseNodes(Map<UUID, Integer> courseNodes) { this.courseNodes = courseNodes; }
        public Map<String, Integer> getSlotNodes() { return slotNodes; }
        public void setSlotNodes(Map<String, Integer> slotNodes) { this.slotNodes = slotNodes; }
        public Map<UUID, Integer> getRoomNodes() { return roomNodes; }
        public void setRoomNodes(Map<UUID, Integer> roomNodes) { this.roomNodes = roomNodes; }
    }
    
    private static class FlowEdge {
        private final int from;
        private final int to;
        private final int capacity;
        private int flow;
        private FlowEdge reverse;
        
        public FlowEdge(int from, int to, int capacity) {
            this.from = from;
            this.to = to;
            this.capacity = capacity;
            this.flow = 0;
        }
        
        public void addFlow(int amount) {
            this.flow += amount;
        }
        
        // Getters et setters
        public int getFrom() { return from; }
        public int getTo() { return to; }
        public int getCapacity() { return capacity; }
        public int getFlow() { return flow; }
        public FlowEdge getReverse() { return reverse; }
        public void setReverse(FlowEdge reverse) { this.reverse = reverse; }
    }
}
