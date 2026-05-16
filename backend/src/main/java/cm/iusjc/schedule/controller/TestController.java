package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class TestController {
    
    private final EmailService emailService;
    
    @GetMapping("/email")
    public ResponseEntity<String> testEmail(@RequestParam(required = false) String to) {
        log.info("🧪 Test d'envoi d'email demandé");
        
        String recipient = to != null ? to : "schooldule237@gmail.com";
        
        try {
            log.info("🧪 Envoi d'un email de test à: {}", recipient);
            
            emailService.sendEmail(
                recipient,
                "Test Email - IUSJC Schedule",
                """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px; }
                        h1 { color: #667eea; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>✅ Test Email Réussi!</h1>
                        <p>Si vous recevez cet email, la configuration email fonctionne correctement.</p>
                        <p><strong>Timestamp:</strong> """ + java.time.LocalDateTime.now() + """
                        </p>
                    </div>
                </body>
                </html>
                """
            );
            
            log.info("✅ Email de test envoyé avec succès à: {}", recipient);
            return ResponseEntity.ok("✅ Email envoyé avec succès à: " + recipient + "\nVérifiez votre boîte de réception (et spam).");
            
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de l'email de test: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body("❌ Erreur lors de l'envoi de l'email: " + e.getMessage() + 
                          "\n\nVérifiez les logs du backend pour plus de détails.");
        }
    }
    
    @GetMapping("/email/config")
    public ResponseEntity<String> getEmailConfig() {
        return ResponseEntity.ok("""
            Configuration Email:
            - Endpoint de test: GET /api/test/email?to=votre-email@example.com
            - Vérifiez les logs du backend pour voir la configuration complète
            - Les emails sont envoyés de manière synchrone (pas d'@Async)
            """);
    }
}
