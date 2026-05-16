package cm.iusjc.schedule.model.dto.request;

import cm.iusjc.schedule.model.enums.BusinessSector;
import cm.iusjc.schedule.model.enums.LegalStatus;
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
public class RegisterBusinessRequest {
    
    @NotBlank(message = "Le nom de l'entreprise est obligatoire")
    @Size(min = 2, max = 200, message = "Le nom de l'entreprise doit contenir entre 2 et 200 caractères")
    private String companyName;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;
    
    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Size(min = 9, max = 20, message = "Le numéro de téléphone doit contenir entre 9 et 20 caractères")
    private String phone;
    
    @NotNull(message = "Le secteur d'activités est obligatoire")
    private BusinessSector businessSector;
    
    @NotNull(message = "Le statut juridique est obligatoire")
    private LegalStatus legalStatus;
}
