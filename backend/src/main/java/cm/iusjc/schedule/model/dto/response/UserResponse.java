package cm.iusjc.schedule.model.dto.response;

import cm.iusjc.schedule.model.enums.Gender;
import cm.iusjc.schedule.model.enums.Title;
import cm.iusjc.schedule.model.enums.UserRole;
import cm.iusjc.schedule.model.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private LocalDateTime dateOfBirth;
    private Gender gender;
    private Title title;
    private String profilePicture;
    private UserRole role;
    private UserStatus status;
    private LocalDateTime lastConnection;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
