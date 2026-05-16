package cm.iusjc.schedule.model.dto.request;

import cm.iusjc.schedule.model.enums.Gender;
import cm.iusjc.schedule.model.enums.Title;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherRegistrationRequest {
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;
    
    // Mot de passe optionnel - sera généré automatiquement lors de la validation par l'admin
    private String password;
    
    @NotBlank(message = "Le prénom est obligatoire")
    private String firstName;
    
    @NotBlank(message = "Le nom est obligatoire")
    private String lastName;
    
    @Pattern(regexp = "^[0-9\\s\\-\\+\\(\\)]{8,20}$", message = "Format de téléphone invalide")
    private String phone;
    
    private String dateOfBirth; // Format: YYYY-MM-DD
    
    private Gender gender;
    
    private Title title;
    
    @NotEmpty(message = "Au moins un cours doit être sélectionné")
    private Set<UUID> courseIds; // IDs des cours enseignés
    
    private String profilePicture; // URL Cloudinary après upload
}
