package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.request.LoginRequest;
import cm.iusjc.schedule.model.dto.request.RefreshTokenRequest;
import cm.iusjc.schedule.model.dto.request.RegisterBusinessRequest;
import cm.iusjc.schedule.model.dto.request.RegisterIndividualRequest;
import cm.iusjc.schedule.model.dto.request.TeacherRegistrationRequest;
import cm.iusjc.schedule.model.dto.request.Verify2FARequest;
import cm.iusjc.schedule.model.dto.response.AuthResponse;
import cm.iusjc.schedule.model.dto.response.UserResponse;
import cm.iusjc.schedule.model.entity.Course;
import cm.iusjc.schedule.model.entity.RefreshToken;
import cm.iusjc.schedule.model.entity.Teacher;
import cm.iusjc.schedule.model.entity.TwoFactorCode;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.model.enums.AccountType;
import cm.iusjc.schedule.model.enums.ProfileVisibility;
import cm.iusjc.schedule.model.enums.UserRole;
import cm.iusjc.schedule.model.enums.UserStatus;
import cm.iusjc.schedule.repository.CourseRepository;
import cm.iusjc.schedule.repository.RefreshTokenRepository;
import cm.iusjc.schedule.repository.TeacherRepository;
import cm.iusjc.schedule.repository.TwoFactorCodeRepository;
import cm.iusjc.schedule.repository.UserRepository;
import cm.iusjc.schedule.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final TwoFactorCodeRepository twoFactorCodeRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    
    @Value("${two-factor.code-expiry-minutes}")
    private Integer codeExpiryMinutes;
    
    @Value("${two-factor.max-attempts}")
    private Integer maxAttempts;
    
    @Value("${security.max-login-attempts}")
    private Integer maxLoginAttempts;
    
    @Value("${security.lockout-time-minutes}")
    private Integer lockoutTimeMinutes;
    
    @Value("${admin.email}")
    private String adminEmail;
    
    @Transactional
    public AuthResponse registerTeacher(TeacherRegistrationRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Un compte avec cet email existe déjà");
        }
        
        // Générer un mot de passe temporaire si non fourni (sera remplacé lors de la validation)
        String tempPassword = request.getPassword() != null && !request.getPassword().isEmpty() 
                ? request.getPassword() 
                : generateTemporaryPassword();
        
        // Créer l'utilisateur
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .gender(request.getGender())
                .profilePicture(request.getProfilePicture())
                .role(UserRole.TEACHER)
                .status(UserStatus.PENDING) // En attente de validation admin
                .isActive2FA(true)
                .loginAttempts(0)
                .build();
        
        user = userRepository.save(user);
        
        // Récupérer les cours enseignés
        Set<Course> courses = new HashSet<>();
        for (UUID courseId : request.getCourseIds()) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Cours non trouvé: " + courseId));
            courses.add(course);
        }
        
        if (courses.isEmpty()) {
            throw new RuntimeException("Au moins un cours doit être sélectionné");
        }
        
        // Utiliser le premier cours comme spécialité principale
        String specialty = courses.iterator().next().getName();
        
        // Créer le profil enseignant
        Teacher teacher = Teacher.builder()
                .user(user)
                .specialty(specialty) // Utiliser le premier cours comme spécialité
                .courses(courses) // Ajouter tous les cours
                .isActive(false) // Inactif jusqu'à validation
                .build();
        
        teacherRepository.save(teacher);
        
        // Envoyer email de confirmation au professeur (ne pas bloquer si échec)
        log.info("📧 Tentative d'envoi d'email de confirmation à: {}", user.getEmail());
        try {
            emailService.sendTeacherApplicationConfirmation(
                    user.getEmail(),
                    user.getFirstName()
            );
            log.info("✅ Email de confirmation envoyé avec succès à: {}", user.getEmail());
        } catch (Exception e) {
            log.error("❌ ERREUR lors de l'envoi de l'email de confirmation à {}: {}", user.getEmail(), e.getMessage(), e);
        }
        
        // Notifier l'admin (ne pas bloquer si échec)
        log.info("📧 Tentative d'envoi d'email de notification à l'admin: {}", adminEmail);
        try {
            emailService.sendAdminNotification(
                    adminEmail,
                    user.getFullName(),
                    user.getEmail()
            );
            log.info("✅ Email de notification envoyé avec succès à l'admin");
        } catch (Exception e) {
            log.error("❌ ERREUR lors de l'envoi de l'email de notification à l'admin: {}", e.getMessage(), e);
        }
        
        log.info("Nouvelle inscription enseignant: {} ({})", user.getFullName(), user.getEmail());
        
        return AuthResponse.builder()
                .user(mapToUserResponse(user))
                .requiresVerification(false)
                .build();
    }
    
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Trouver l'utilisateur
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));
        
        // Vérifier si le compte est verrouillé
        if (user.isAccountLocked()) {
            throw new RuntimeException("Compte temporairement verrouillé. Réessayez plus tard.");
        }
        
        // Vérifier le mot de passe
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            handleFailedLogin(user);
            throw new RuntimeException("Email ou mot de passe incorrect");
        }
        
        // Vérifier le statut du compte
        if (user.getStatus() == UserStatus.PENDING) {
            throw new RuntimeException("Votre compte est en attente de validation par l'administrateur");
        }
        
        if (user.getStatus() == UserStatus.REJECTED) {
            throw new RuntimeException("Votre candidature a été refusée");
        }
        
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new RuntimeException("Votre compte a été bloqué par l'administrateur. Veuillez contacter le support.");
        }
        
        if (!user.canLogin()) {
            throw new RuntimeException("Impossible de se connecter. Contactez l'administrateur.");
        }
        
        // Réinitialiser les tentatives de connexion
        user.setLoginAttempts(0);
        user.setLockedUntil(null);
        
        // Mettre à jour la dernière connexion
        user.setLastConnection(LocalDateTime.now());
        userRepository.save(user);
        
        // Générer les tokens directement (2FA désactivé temporairement)
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        
        // Sauvegarder le refresh token
        saveRefreshToken(user, refreshToken);
        
        log.info("✅ Connexion réussie pour: {}", user.getEmail());
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .requiresVerification(false)
                .build();
    }
    
    @Transactional
    public AuthResponse verify2FA(Verify2FARequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Trouver le code 2FA valide le plus récent
        TwoFactorCode twoFactorCode = twoFactorCodeRepository
                .findLatestValidCodeForUser(user, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Code de vérification invalide ou expiré"));
        
        // Vérifier le nombre de tentatives
        if (twoFactorCode.getAttempts() >= maxAttempts) {
            twoFactorCode.setIsUsed(true);
            twoFactorCodeRepository.save(twoFactorCode);
            throw new RuntimeException("Nombre maximum de tentatives atteint. Demandez un nouveau code.");
        }
        
        // Vérifier le code
        if (!twoFactorCode.getCode().equals(request.getCode())) {
            twoFactorCode.incrementAttempts();
            twoFactorCodeRepository.save(twoFactorCode);
            throw new RuntimeException("Code de vérification incorrect");
        }
        
        // Marquer le code comme utilisé
        twoFactorCode.setIsUsed(true);
        twoFactorCodeRepository.save(twoFactorCode);
        
        // Mettre à jour la dernière connexion
        user.setLastConnection(LocalDateTime.now());
        userRepository.save(user);
        
        // Générer les tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        
        // Sauvegarder le refresh token
        saveRefreshToken(user, refreshToken);
        
        log.info("Connexion réussie pour: {}", user.getEmail());
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .requiresVerification(false)
                .build();
    }
    
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        // Vérifier le refresh token
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Refresh token invalide"));
        
        if (!refreshToken.isValid()) {
            throw new RuntimeException("Refresh token expiré ou révoqué");
        }
        
        User user = refreshToken.getUser();
        
        // Générer un nouveau access token
        String newAccessToken = jwtService.generateAccessToken(user);
        
        // Optionnel: Générer un nouveau refresh token (rotation)
        String newRefreshToken = jwtService.generateRefreshToken(user);
        
        // Révoquer l'ancien refresh token
        refreshToken.setIsRevoked(true);
        refreshTokenRepository.save(refreshToken);
        
        // Sauvegarder le nouveau refresh token
        saveRefreshToken(user, newRefreshToken);
        
        log.info("Tokens rafraîchis pour: {}", user.getEmail());
        
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }
    
    private void handleFailedLogin(User user) {
        user.setLoginAttempts(user.getLoginAttempts() + 1);
        
        if (user.getLoginAttempts() >= maxLoginAttempts) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(lockoutTimeMinutes));
            log.warn("Compte verrouillé pour {} tentatives échouées: {}", maxLoginAttempts, user.getEmail());
        }
        
        userRepository.save(user);
    }
    
    private String generate2FACode() {
        Random random = new Random();
        return String.format("%04d", random.nextInt(10000));
    }
    
    private String generateTemporaryPassword() {
        // Générer un mot de passe temporaire sécurisé
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&#";
        Random random = new Random();
        StringBuilder password = new StringBuilder();
        
        // Au moins 12 caractères avec majuscule, minuscule, chiffre et caractère spécial
        password.append((char) ('A' + random.nextInt(26))); // Majuscule
        password.append((char) ('a' + random.nextInt(26))); // Minuscule
        password.append(random.nextInt(10)); // Chiffre
        password.append("@$!%*?&#".charAt(random.nextInt(8))); // Caractère spécial
        
        // Compléter avec des caractères aléatoires
        for (int i = 0; i < 8; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        // Mélanger les caractères
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }
        
        return new String(passwordArray);
    }
    
    private String generateSecurePassword() {
        return generateTemporaryPassword(); // Réutiliser la même logique
    }
    
    @Transactional
    public UUID registerIndividual(RegisterIndividualRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Un compte avec cet email existe déjà");
        }
        
        // Générer un mot de passe sécurisé
        String generatedPassword = generateSecurePassword();
        
        // Créer l'utilisateur
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(generatedPassword))
                .accountType(AccountType.INDIVIDUAL)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .occupation(request.getOccupation())
                .educationLevel(request.getEducationLevel())
                .gender(request.getGender())
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE) // Actif immédiatement
                .isActive2FA(false) // 2FA désactivée par défaut
                .profileVisibility(ProfileVisibility.PUBLIC)
                .loginAttempts(0)
                .build();
        
        user = userRepository.save(user);
        
        // Envoyer le mot de passe par email
        try {
            emailService.sendEmail(
                user.getEmail(),
                "Bienvenue sur IUSJC - Votre mot de passe",
                buildPasswordEmailTemplate(user.getFirstName(), generatedPassword)
            );
            log.info("✅ Mot de passe envoyé par email à: {}", user.getEmail());
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de l'email à {}: {}", user.getEmail(), e.getMessage());
            // Ne pas bloquer l'inscription si l'email échoue
        }
        
        log.info("Nouvelle inscription particulier: {} ({})", user.getFullName(), user.getEmail());
        
        return user.getId();
    }
    
    @Transactional
    public UUID registerBusiness(RegisterBusinessRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Un compte avec cet email existe déjà");
        }
        
        // Générer un mot de passe sécurisé
        String generatedPassword = generateSecurePassword();
        
        // Créer l'utilisateur
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(generatedPassword))
                .accountType(AccountType.BUSINESS)
                .companyName(request.getCompanyName())
                .phone(request.getPhone())
                .businessSector(request.getBusinessSector())
                .legalStatus(request.getLegalStatus())
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE) // Actif immédiatement
                .isActive2FA(false) // 2FA désactivée par défaut
                .profileVisibility(ProfileVisibility.PUBLIC)
                .loginAttempts(0)
                .build();
        
        user = userRepository.save(user);
        
        // Envoyer le mot de passe par email
        try {
            emailService.sendEmail(
                user.getEmail(),
                "Bienvenue sur IUSJC - Votre mot de passe",
                buildPasswordEmailTemplate(user.getCompanyName(), generatedPassword)
            );
            log.info("✅ Mot de passe envoyé par email à: {}", user.getEmail());
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de l'email à {}: {}", user.getEmail(), e.getMessage());
            // Ne pas bloquer l'inscription si l'email échoue
        }
        
        log.info("Nouvelle inscription entreprise: {} ({})", user.getFullName(), user.getEmail());
        
        return user.getId();
    }
    
    private String buildPasswordEmailTemplate(String name, String password) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .password-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .password { font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: monospace; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Bienvenue sur IUSJC</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>%s</strong>,</p>
                        <p>Votre compte a été créé avec succès !</p>
                        
                        <div class="password-box">
                            <p style="margin: 0 0 10px 0; color: #666;">Votre mot de passe :</p>
                            <div class="password">%s</div>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Important :</strong>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                <li>Conservez ce mot de passe en lieu sûr</li>
                                <li>Vous pouvez le changer après votre première connexion</li>
                                <li>Ne le partagez avec personne</li>
                            </ul>
                        </div>
                        
                        <p><strong>URL de connexion :</strong> <a href="http://localhost:4200/login">http://localhost:4200/login</a></p>
                        <p>Cordialement,<br>L'équipe IUSJC</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Institut Universitaire Saint Jean du Cameroun</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, password);
    }
    
    private void save2FACode(User user, String code) {
        // Supprimer les anciens codes non utilisés
        twoFactorCodeRepository.deleteByUser(user);
        
        TwoFactorCode twoFactorCode = TwoFactorCode.builder()
                .user(user)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(codeExpiryMinutes))
                .isUsed(false)
                .attempts(0)
                .build();
        
        twoFactorCodeRepository.save(twoFactorCode);
    }
    
    private void saveRefreshToken(User user, String token) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .isRevoked(false)
                .build();
        
        refreshTokenRepository.save(refreshToken);
    }
    
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .gender(user.getGender())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .status(user.getStatus())
                .lastConnection(user.getLastConnection())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
    
    @Transactional
    public void logout(String token) {
        try {
            // Trouver et révoquer le refresh token
            RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                    .orElse(null);
            
            if (refreshToken != null) {
                refreshToken.setIsRevoked(true);
                refreshTokenRepository.save(refreshToken);
                log.info("🚪 Refresh token révoqué pour l'utilisateur: {}", refreshToken.getUser().getEmail());
            } else {
                log.warn("⚠️ Refresh token non trouvé lors de la déconnexion");
            }
        } catch (Exception e) {
            log.error("❌ Erreur lors de la révocation du refresh token: {}", e.getMessage());
            // On ne lance pas d'exception car la déconnexion côté client suffit
        }
    }
    
    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        // Vérifier que l'utilisateur existe
        if (user == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        
        // Valider le nouveau mot de passe
        if (!isPasswordValid(newPassword)) {
            throw new RuntimeException("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial");
        }
        
        // Vérifier le mot de passe actuel
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            log.warn("❌ Tentative de changement de mot de passe avec mot de passe actuel incorrect pour: {}", user.getEmail());
            throw new RuntimeException("Le mot de passe actuel est incorrect");
        }
        
        // Vérifier que le nouveau mot de passe est différent
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("Le nouveau mot de passe doit être différent de l'ancien");
        }
        
        // Mettre à jour le mot de passe
        user.setPassword(passwordEncoder.encode(newPassword));
        User savedUser = userRepository.save(user);
        
        log.info("✅ Mot de passe modifié avec succès pour: {}", savedUser.getEmail());
        
        // Révoquer les tokens de manière asynchrone pour ne pas bloquer la réponse
        revokeUserTokensAsync(savedUser.getId());
    }
    
    private boolean isPasswordValid(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasUpperCase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowerCase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecialChar = password.chars().anyMatch(ch -> 
            "@$!%*?&#".indexOf(ch) >= 0
        );
        
        return hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
    }
    
    @Transactional
    public void revokeUserTokensAsync(UUID userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                refreshTokenRepository.revokeAllUserTokens(user);
                log.info("🔒 Tous les refresh tokens révoqués pour l'utilisateur: {}", user.getEmail());
            }
        } catch (Exception e) {
            log.warn("⚠️ Erreur lors de la révocation des tokens: {}", e.getMessage());
        }
    }
}
