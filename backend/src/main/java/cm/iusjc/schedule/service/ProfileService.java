package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.dto.UserProfileResponse;
import cm.iusjc.schedule.model.entity.User;
import cm.iusjc.schedule.model.enums.ProfileVisibility;
import cm.iusjc.schedule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {
    
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public List<UserProfileResponse> searchProfiles(String query) {
        String lowerQuery = query.toLowerCase();
        
        List<User> users = userRepository.findAll().stream()
            .filter(user -> user.getProfileVisibility() == ProfileVisibility.PUBLIC)
            .filter(user -> {
                // Construire la chaîne de recherche selon le type de compte
                StringBuilder searchIn = new StringBuilder();
                
                if (user.getFirstName() != null) {
                    searchIn.append(user.getFirstName().toLowerCase()).append(" ");
                }
                if (user.getLastName() != null) {
                    searchIn.append(user.getLastName().toLowerCase()).append(" ");
                }
                if (user.getCompanyName() != null) {
                    searchIn.append(user.getCompanyName().toLowerCase()).append(" ");
                }
                searchIn.append(user.getEmail().toLowerCase());
                
                return searchIn.toString().contains(lowerQuery);
            })
            .limit(50) // Limiter à 50 résultats
            .collect(Collectors.toList());
        
        return users.stream()
            .map(this::mapToProfileResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getProfileVisibility() == ProfileVisibility.PRIVATE) {
            throw new RuntimeException("This profile is private");
        }
        
        return mapToProfileResponse(user);
    }
    
    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
            .id(user.getId())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .accountType(user.getAccountType())
            .companyName(user.getCompanyName())
            .profileVisibility(user.getProfileVisibility())
            .timezone(user.getTimezone())
            .build();
    }
}
