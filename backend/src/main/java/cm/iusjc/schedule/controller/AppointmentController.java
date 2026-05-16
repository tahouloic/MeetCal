package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.AppointmentResponse;
import cm.iusjc.schedule.model.dto.AvailableSlotResponse;
import cm.iusjc.schedule.model.dto.CreateAppointmentRequest;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.model.enums.AppointmentStatus;
import cm.iusjc.schedule.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    
    private final AppointmentService appointmentService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request,
            @AuthenticationPrincipal User currentUser) {
        try {
            log.info("=== CREATE APPOINTMENT REQUEST ===");
            log.info("Current User ID: {}", currentUser.getId());
            log.info("Recipient ID: {}", request.getRecipientId());
            log.info("Slot Time: {}", request.getSlotTime());
            log.info("Message: {}", request.getMessage());
            
            AppointmentResponse appointment = appointmentService.createAppointment(
                request, 
                currentUser.getId()
            );
            
            log.info("✅ Appointment created successfully: {}", appointment.getId());
            return ResponseEntity.ok(ApiResponse.success(appointment));
        } catch (Exception e) {
            log.error("❌ ERROR creating appointment", e);
            log.error("Exception type: {}", e.getClass().getName());
            log.error("Exception message: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/sent")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getSentAppointments(
            @RequestParam(required = false) AppointmentStatus status,
            @AuthenticationPrincipal User currentUser) {
        try {
            List<AppointmentResponse> appointments = appointmentService.getSentAppointments(
                currentUser.getId(),
                status
            );
            return ResponseEntity.ok(ApiResponse.success(appointments));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/received")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getReceivedAppointments(
            @RequestParam(required = false) AppointmentStatus status,
            @AuthenticationPrincipal User currentUser) {
        try {
            List<AppointmentResponse> appointments = appointmentService.getReceivedAppointments(
                currentUser.getId(),
                status
            );
            return ResponseEntity.ok(ApiResponse.success(appointments));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{appointmentId}/accept")
    public ResponseEntity<ApiResponse<AppointmentResponse>> acceptAppointment(
            @PathVariable UUID appointmentId,
            @AuthenticationPrincipal User currentUser) {
        try {
            AppointmentResponse appointment = appointmentService.acceptAppointment(
                appointmentId,
                currentUser.getId()
            );
            return ResponseEntity.ok(ApiResponse.success(appointment));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{appointmentId}/reject")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rejectAppointment(
            @PathVariable UUID appointmentId,
            @AuthenticationPrincipal User currentUser) {
        try {
            AppointmentResponse appointment = appointmentService.rejectAppointment(
                appointmentId,
                currentUser.getId()
            );
            return ResponseEntity.ok(ApiResponse.success(appointment));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/slots/{userId}")
    public ResponseEntity<ApiResponse<List<AvailableSlotResponse>>> getAvailableSlots(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<AvailableSlotResponse> slots = appointmentService.getAvailableSlots(
                userId,
                startDate,
                endDate
            );
            return ResponseEntity.ok(ApiResponse.success(slots));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
