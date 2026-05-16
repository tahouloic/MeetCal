package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.RefreshToken;
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
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    
    Optional<RefreshToken> findByToken(String token);
    
    List<RefreshToken> findByUser(User user);
    
    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :now OR r.isRevoked = true")
    void deleteExpiredOrRevokedTokens(LocalDateTime now);
    
    @Modifying
    @Query("UPDATE RefreshToken r SET r.isRevoked = true WHERE r.user = :user")
    void revokeAllUserTokens(User user);
    
    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.user = :user")
    void deleteByUser(User user);
}
