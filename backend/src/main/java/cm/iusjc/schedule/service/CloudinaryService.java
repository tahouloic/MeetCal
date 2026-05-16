package cm.iusjc.schedule.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {
    
    private final Cloudinary cloudinary;
    
    public Map<String, Object> uploadFile(MultipartFile file, String folder) {
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder != null ? folder : "iusjc-schedule",
                    "resource_type", "auto",
                    "transformation", ObjectUtils.asMap(
                            "width", 300,
                            "height", 300,
                            "crop", "fill",
                            "gravity", "face"
                    )
            );
            
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            log.info("Fichier uploadé avec succès sur Cloudinary: {}", uploadResult.get("public_id"));
            
            return uploadResult;
            
        } catch (IOException e) {
            log.error("Erreur lors de l'upload sur Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Échec de l'upload du fichier", e);
        }
    }
    
    public void deleteFile(String publicId) {
        try {
            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Fichier supprimé de Cloudinary: {}", publicId);
        } catch (IOException e) {
            log.error("Erreur lors de la suppression du fichier sur Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Échec de la suppression du fichier", e);
        }
    }
}
