package cm.iusjc.schedule.repository;

import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.model.enums.UserRole;
import cm.iusjc.schedule.model.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(UserRole role);
    
    List<User> findByStatus(UserStatus status);
    
    List<User> findByRoleAndStatus(UserRole role, UserStatus status);
    
    Page<User> findByRoleAndStatus(UserRole role, UserStatus status, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = 'PENDING'")
    List<User> findPendingUsersByRole(UserRole role);
    
    long countByRole(UserRole role);
    
    long countByStatus(UserStatus status);
    
    long countByRoleAndStatus(UserRole role, UserStatus status);
}
