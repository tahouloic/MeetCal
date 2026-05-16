package cm.iusjc.schedule.model.entity;

import cm.iusjc.schedule.model.enums.AccountType;
import cm.iusjc.schedule.model.enums.BusinessSector;
import cm.iusjc.schedule.model.enums.EducationLevel;
import cm.iusjc.schedule.model.enums.Gender;
import cm.iusjc.schedule.model.enums.LegalStatus;
import cm.iusjc.schedule.model.enums.Occupation;
import cm.iusjc.schedule.model.enums.ProfileVisibility;
import cm.iusjc.schedule.model.enums.Title;
import cm.iusjc.schedule.model.enums.UserRole;
import cm.iusjc.schedule.model.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"teacher"})
@EqualsAndHashCode(exclude = {"teacher"})
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true, length = 255)
    private String email;
    
    @Column(nullable = false, length = 255)
    private String password;
    
    // ========== CHAMPS COMMUNS ==========
    
    @Column(length = 20)
    private String phone;
    
    @Column(name = "profile_picture", length = 500)
    private String profilePicture;
    
    // ========== TYPE DE COMPTE ==========
    
    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    @Builder.Default
    private AccountType accountType = AccountType.INDIVIDUAL;
    
    // ========== CHAMPS PARTICULIER (INDIVIDUAL) ==========
    
    @Column(name = "first_name", length = 100)
    private String firstName;
    
    @Column(name = "last_name", length = 100)
    private String lastName;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private Occupation occupation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "education_level", length = 50)
    private EducationLevel educationLevel;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;
    
    // ========== CHAMPS ENTREPRISE (BUSINESS) ==========
    
    @Column(name = "company_name", length = 200)
    private String companyName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "business_sector", length = 50)
    private BusinessSector businessSector;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "legal_status", length = 50)
    private LegalStatus legalStatus;
    
    // ========== PARAMÈTRES DE PROFIL ==========
    
    @Enumerated(EnumType.STRING)
    @Column(name = "profile_visibility", nullable = false)
    @Builder.Default
    private ProfileVisibility profileVisibility = ProfileVisibility.PUBLIC;
    
    @Column(length = 50, nullable = false)
    @Builder.Default
    private String timezone = "Africa/Douala";
    
    // ========== SÉCURITÉ ET RÔLE ==========
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING;
    
    @Column(name = "is_active_2fa", nullable = false)
    @Builder.Default
    private Boolean isActive2FA = false; // Désactivée par défaut
    
    @Column(name = "login_attempts")
    @Builder.Default
    private Integer loginAttempts = 0;
    
    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;
    
    @Column(name = "last_connection")
    private LocalDateTime lastConnection;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Relations
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Teacher teacher; // Optionnel - pour compatibilité avec l'ancien système
    
    // Méthodes utilitaires
    public boolean isAccountLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }
    
    public boolean canLogin() {
        return status == UserStatus.ACTIVE && !isAccountLocked();
    }
    
    public String getFullName() {
        if (accountType == AccountType.BUSINESS && companyName != null) {
            return companyName;
        }
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        }
        return email; // Fallback
    }
    
    public String getDisplayName() {
        return getFullName();
    }
}
