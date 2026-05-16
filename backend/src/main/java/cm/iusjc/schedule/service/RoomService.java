package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.request.RoomRequest;
import cm.iusjc.schedule.model.dto.response.RoomResponse;
import cm.iusjc.schedule.model.entity.Room;
import cm.iusjc.schedule.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {
    
    private final RoomRepository roomRepository;
    
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        log.info("🏫 Création d'une nouvelle salle: {}{}{} ({} places)", 
                request.getBuilding(), request.getFloor(), request.getNumber(), request.getCapacity());
        
        Room room = Room.builder()
                .building(request.getBuilding())
                .floor(request.getFloor())
                .number(request.getNumber())
                .capacity(request.getCapacity())
                .build();
        
        Room savedRoom = roomRepository.save(room);
        log.info("✅ Salle créée avec succès: {} ({} places)", savedRoom.getCode(), savedRoom.getCapacity());
        
        return mapToResponse(savedRoom);
    }
    
    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        log.info("🏫 Récupération de toutes les salles");
        return roomRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(UUID id) {
        log.info("🏫 Récupération de la salle: {}", id);
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle non trouvée"));
        return mapToResponse(room);
    }
    
    @Transactional
    public RoomResponse updateRoom(UUID id, RoomRequest request) {
        log.info("📝 Mise à jour de la salle: {}", id);
        
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle non trouvée"));
        
        room.setBuilding(request.getBuilding());
        room.setFloor(request.getFloor());
        room.setNumber(request.getNumber());
        room.setCapacity(request.getCapacity());
        
        Room updatedRoom = roomRepository.save(room);
        
        log.info("✅ Salle mise à jour: {} ({} places)", updatedRoom.getCode(), updatedRoom.getCapacity());
        return mapToResponse(updatedRoom);
    }
    
    @Transactional
    public void deleteRoom(UUID id) {
        log.info("🗑️ Suppression de la salle: {}", id);
        
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle non trouvée"));
        
        roomRepository.delete(room);
        log.info("✅ Salle supprimée: {}", room.getCode());
    }
    
    private RoomResponse mapToResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .building(room.getBuilding())
                .floor(room.getFloor())
                .number(room.getNumber())
                .code(room.getCode())
                .capacity(room.getCapacity())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }
}
