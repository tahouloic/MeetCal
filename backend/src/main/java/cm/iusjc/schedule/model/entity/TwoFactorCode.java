package cm.iusjc.schedule.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "two_factor_codes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorCode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 6)
    private String code;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "is_used", nullable = false)
    @Builder.Default
    private Boolean isUsed = false;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer attempts = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Méthodes utilitaires
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean isValid() {
        return !isUsed && !isExpired();
    }
    
    public void incrementAttempts() {
        this.attempts++;
    }
}
