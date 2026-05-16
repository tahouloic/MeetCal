package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.TwoFactorCode;
import cm.iusjc.schedule.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TwoFactorCodeRepository extends JpaRepository<TwoFactorCode, UUID> {
    
    Optional<TwoFactorCode> findByUserAndCodeAndIsUsedFalse(User user, String code);
    
    List<TwoFactorCode> findByUser(User user);
    
    @Query("SELECT t FROM TwoFactorCode t WHERE t.user = :user AND t.isUsed = false AND t.expiresAt > :now ORDER BY t.createdAt DESC")
    Optional<TwoFactorCode> findLatestValidCodeForUser(User user, LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM TwoFactorCode t WHERE t.expiresAt < :now OR t.isUsed = true")
    void deleteExpiredOrUsedCodes(LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM TwoFactorCode t WHERE t.user = :user")
    void deleteByUser(User user);
}
