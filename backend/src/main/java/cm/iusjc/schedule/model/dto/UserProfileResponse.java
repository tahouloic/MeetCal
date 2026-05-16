package cm.iusjc.schedule.model.dto;

import cm.iusjc.schedule.model.enums.AccountType;
import cm.iusjc.schedule.model.enums.ProfileVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private AccountType accountType;
    private String companyName;
    private ProfileVisibility profileVisibility;
    private String timezone;
}
