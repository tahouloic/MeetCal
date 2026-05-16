package cm.iusjc.schedule.config;

import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.model.enums.UserRole;
import cm.iusjc.schedule.model.enums.UserStatus;
import cm.iusjc.schedule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${admin.email}")
    private String adminEmail;
    
    @Value("${admin.password}")
    private String adminPassword;
    
    @Value("${admin.first-name}")
    private String adminFirstName;
    
    @Value("${admin.last-name}")
    private String adminLastName;
    
    @Override
    public void run(String... args) {
        initializeDefaultAdmin();
    }
    
    private void initializeDefaultAdmin() {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setFirstName(adminFirstName);
            admin.setLastName(adminLastName);
            admin.setRole(UserRole.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setIsActive2FA(false); // Désactiver 2FA pour l'admin par défaut
            admin.setLoginAttempts(0);
            
            userRepository.save(admin);
            log.info("✅ Compte administrateur par défaut créé avec succès");
            log.info("📧 Email: {}", adminEmail);
            log.info("🔑 Mot de passe: {} (CHANGEZ-LE EN PRODUCTION !)", adminPassword);
        } else {
            log.info("ℹ️ Compte administrateur déjà existant");
        }
    }
}
