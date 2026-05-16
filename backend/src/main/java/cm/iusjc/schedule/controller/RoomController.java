package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.request.RoomRequest;
import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.RoomResponse;
import cm.iusjc.schedule.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class RoomController {
    
    private final RoomService roomService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(@Valid @RequestBody RoomRequest request) {
        try {
            RoomResponse response = roomService.createRoom(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Salle créée avec succès", response));
        } catch (Exception e) {
            log.error("❌ Erreur création salle", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("CREATE_ROOM_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAllRooms() {
        try {
            List<RoomResponse> rooms = roomService.getAllRooms();
            return ResponseEntity.ok(ApiResponse.success(rooms));
        } catch (Exception e) {
            log.error("❌ Erreur récupération salles", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_ROOMS_FAILED", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(@PathVariable UUID id) {
        try {
            RoomResponse response = roomService.getRoomById(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("❌ Erreur récupération salle", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("GET_ROOM_FAILED", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable UUID id,
            @Valid @RequestBody RoomRequest request) {
        try {
            RoomResponse response = roomService.updateRoom(id, request);
            return ResponseEntity.ok(ApiResponse.success("Salle mise à jour avec succès", response));
        } catch (Exception e) {
            log.error("❌ Erreur mise à jour salle", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("UPDATE_ROOM_FAILED", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable UUID id) {
        try {
            roomService.deleteRoom(id);
            return ResponseEntity.ok(ApiResponse.success("Salle supprimée avec succès", null));
        } catch (Exception e) {
            log.error("❌ Erreur suppression salle", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("DELETE_ROOM_FAILED", e.getMessage()));
        }
    }
}
