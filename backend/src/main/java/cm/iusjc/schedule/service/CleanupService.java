package cm.iusjc.schedule.service;

import cm.iusjc.schedule.repository.RefreshTokenRepository;
import cm.iusjc.schedule.repository.TwoFactorCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CleanupService {
    
    private final TwoFactorCodeRepository twoFactorCodeRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    
    /**
     * Nettoie les codes 2FA expirés ou utilisés toutes les heures
     */
    @Scheduled(cron = "0 0 * * * *") // Toutes les heures
    @Transactional
    public void cleanupExpired2FACodes() {
        try {
            twoFactorCodeRepository.deleteExpiredOrUsedCodes(LocalDateTime.now());
            log.info("🧹 Nettoyage des codes 2FA expirés effectué");
        } catch (Exception e) {
            log.error("Erreur lors du nettoyage des codes 2FA: {}", e.getMessage());
        }
    }
    
    /**
     * Nettoie les refresh tokens expirés ou révoqués toutes les 6 heures
     */
    @Scheduled(cron = "0 0 */6 * * *") // Toutes les 6 heures
    @Transactional
    public void cleanupExpiredRefreshTokens() {
        try {
            refreshTokenRepository.deleteExpiredOrRevokedTokens(LocalDateTime.now());
            log.info("🧹 Nettoyage des refresh tokens expirés effectué");
        } catch (Exception e) {
            log.error("Erreur lors du nettoyage des refresh tokens: {}", e.getMessage());
        }
    }
}
