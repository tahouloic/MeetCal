package cm.iusjc.schedule.model.dto.request;

import cm.iusjc.schedule.model.enums.EducationLevel;
import cm.iusjc.schedule.model.enums.Gender;
import cm.iusjc.schedule.model.enums.Occupation;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterIndividualRequest {
    
    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 100, message = "Le prénom doit contenir entre 2 et 100 caractères")
    private String firstName;
    
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    private String lastName;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;
    
    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Size(min = 9, max = 20, message = "Le numéro de téléphone doit contenir entre 9 et 20 caractères")
    private String phone;
    
    @NotNull(message = "L'emploi est obligatoire")
    private Occupation occupation;
    
    @NotNull(message = "Le niveau d'études est obligatoire")
    private EducationLevel educationLevel;
    
    @NotNull(message = "Le sexe est obligatoire")
    private Gender gender;
}
