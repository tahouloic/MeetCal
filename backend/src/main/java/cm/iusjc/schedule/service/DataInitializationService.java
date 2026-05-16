package cm.iusjc.schedule.service;

import cm.iusjc.schedule.model.entity.School;
import cm.iusjc.schedule.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Order(1) // S'exécute en premier
public class DataInitializationService implements CommandLineRunner {
    
    private final SchoolRepository schoolRepository;
    
    @Override
    @Transactional
    public void run(String... args) {
        initializeSchools();
    }
    
    private void initializeSchools() {
        log.info("🏫 Initialisation des écoles...");
        
        // Vérifier si les écoles existent déjà
        if (schoolRepository.count() > 0) {
            log.info("✅ Les écoles sont déjà initialisées ({} écoles)", schoolRepository.count());
            return;
        }
        
        // Créer les 4 écoles de l'IUSJC
        createSchoolIfNotExists("SJI", "Saint Jean Ingénieur", "SJI");
        createSchoolIfNotExists("SJM", "Saint Jean Management", "SJM");
        createSchoolIfNotExists("PREPA_VOGT", "Prépa Vogt", "Prépa Vogt");
        createSchoolIfNotExists("CPGE", "Classes Préparatoires aux Grandes Écoles", "CPGE");
        
        log.info("✅ {} écoles initialisées avec succès", schoolRepository.count());
    }
    
    private void createSchoolIfNotExists(String code, String name, String abbreviation) {
        if (!schoolRepository.existsByCode(code)) {
            School school = School.builder()
                    .code(code)
                    .name(name)
                    .abbreviation(abbreviation)
                    .build();
            
            schoolRepository.save(school);
            log.info("  ✓ École créée: {} ({})", name, code);
        }
    }
}
