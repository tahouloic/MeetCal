package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.request.ChangePasswordRequest;
import cm.iusjc.schedule.model.dto.request.LoginRequest;
import cm.iusjc.schedule.model.dto.request.RefreshTokenRequest;
import cm.iusjc.schedule.model.dto.request.RegisterBusinessRequest;
import cm.iusjc.schedule.model.dto.request.RegisterIndividualRequest;
import cm.iusjc.schedule.model.dto.request.TeacherRegistrationRequest;
import cm.iusjc.schedule.model.dto.request.Verify2FARequest;
import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.response.AuthResponse;
import cm.iusjc.schedule.model.dto.response.UserResponse;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register/teacher")
    public ResponseEntity<ApiResponse<AuthResponse>> registerTeacher(
            @Valid @RequestBody TeacherRegistrationRequest request
    ) {
        try {
            AuthResponse response = authService.registerTeacher(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            "Inscription réussie ! Votre candidature est en cours d'examen par l'administration.",
                            response
                    ));
        } catch (Exception e) {
            log.error("Erreur lors de l'inscription: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("REGISTRATION_FAILED", e.getMessage()));
        }
    }
    
    @PostMapping("/register/individual")
    public ResponseEntity<ApiResponse<java.util.UUID>> registerIndividual(
            @Valid @RequestBody RegisterIndividualRequest request
    ) {
        try {
            java.util.UUID userId = authService.registerIndividual(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            "Compte créé avec succès ! Votre mot de passe a été envoyé par email.",
                            userId
                    ));
        } catch (Exception e) {
            log.error("Erreur lors de l'inscription particulier: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("REGISTRATION_FAILED", e.getMessage()));
        }
    }
    
    @PostMapping("/register/business")
    public ResponseEntity<ApiResponse<java.util.UUID>> registerBusiness(
            @Valid @RequestBody RegisterBusinessRequest request
    ) {
        try {
            java.util.UUID userId = authService.registerBusiness(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            "Compte créé avec succès ! Votre mot de passe a été envoyé par email.",
                            userId
                    ));
        } catch (Exception e) {
            log.error("Erreur lors de l'inscription entreprise: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("REGISTRATION_FAILED", e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success(
                    "Code de vérification envoyé par email",
                    response
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la connexion: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("LOGIN_FAILED", e.getMessage()));
        }
    }
    
    @PostMapping("/verify-2fa")
    public ResponseEntity<ApiResponse<AuthResponse>> verify2FA(
            @Valid @RequestBody Verify2FARequest request
    ) {
        try {
            AuthResponse response = authService.verify2FA(request);
            return ResponseEntity.ok(ApiResponse.success(
                    "Connexion réussie !",
                    response
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la vérification 2FA: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("2FA_VERIFICATION_FAILED", e.getMessage()));
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        try {
            AuthResponse response = authService.refreshToken(request);
            return ResponseEntity.ok(ApiResponse.success(
                    "Tokens rafraîchis avec succès",
                    response
            ));
        } catch (Exception e) {
            log.error("Erreur lors du rafraîchissement du token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("TOKEN_REFRESH_FAILED", e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        try {
            authService.logout(request.getRefreshToken());
            return ResponseEntity.ok(ApiResponse.success(
                    "Déconnexion réussie",
                    null
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la déconnexion: {}", e.getMessage());
            // Même en cas d'erreur, on retourne un succès car la déconnexion côté client suffit
            return ResponseEntity.ok(ApiResponse.success(
                    "Déconnexion réussie",
                    null
            ));
        }
    }
    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal User user
    ) {
        try {
            UserResponse userResponse = UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .phone(user.getPhone())
                    .profilePicture(user.getProfilePicture())
                    .role(user.getRole())
                    .status(user.getStatus())
                    .lastConnection(user.getLastConnection())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();
            
            return ResponseEntity.ok(ApiResponse.success(userResponse));
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du profil: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("PROFILE_FETCH_FAILED", e.getMessage()));
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        try {
            log.info("🔐 Tentative de changement de mot de passe pour: {}", user != null ? user.getEmail() : "null");
            log.debug("Request reçue: currentPassword présent={}, newPassword présent={}", 
                request.getCurrentPassword() != null && !request.getCurrentPassword().isEmpty(),
                request.getNewPassword() != null && !request.getNewPassword().isEmpty());
            
            authService.changePassword(user, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(ApiResponse.success(
                    "Mot de passe modifié avec succès. Veuillez vous reconnecter.",
                    null
            ));
        } catch (Exception e) {
            log.error("Erreur lors du changement de mot de passe: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("PASSWORD_CHANGE_FAILED", e.getMessage()));
        }
    }
}
