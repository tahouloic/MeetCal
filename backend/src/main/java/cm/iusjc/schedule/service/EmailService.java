package cm.iusjc.schedule.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${email.from}")
    private String fromEmail;
    
    @Value("${spring.mail.host}")
    private String mailHost;
    
    @Value("${spring.mail.port}")
    private Integer mailPort;
    
    @Value("${spring.mail.username}")
    private String mailUsername;
    
    @jakarta.annotation.PostConstruct
    public void logEmailConfiguration() {
        log.info("========================================");
        log.info("📧 Configuration Email au démarrage:");
        log.info("  Host: {}", mailHost);
        log.info("  Port: {}", mailPort);
        log.info("  Username: {}", mailUsername);
        log.info("  From: {}", fromEmail);
        log.info("  MailSender: {}", mailSender != null ? "Configuré ✅" : "NON configuré ❌");
        log.info("========================================");
    }
    
    // @Async - Temporairement désactivé pour voir les erreurs
    public void sendEmail(String to, String subject, String htmlContent) {
        log.info("📧 EmailService.sendEmail() appelé");
        log.info("  → Destinataire: {}", to);
        log.info("  → Sujet: {}", subject);
        log.info("  → From: {}", fromEmail);
        
        try {
            log.info("📧 Création du message MIME...");
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            log.info("📧 Configuration du message...");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            log.info("📧 Envoi du message via mailSender...");
            mailSender.send(message);
            log.info("✅ Email envoyé avec succès à: {}", to);
            
        } catch (MessagingException e) {
            log.error("❌ MessagingException lors de l'envoi de l'email à {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Échec de l'envoi de l'email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Exception inattendue lors de l'envoi de l'email à {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Échec de l'envoi de l'email: " + e.getMessage(), e);
        }
    }
    
    public void send2FACode(String to, String firstName, String code) {
        String subject = "Code de vérification IUSJC";
        String htmlContent = build2FAEmailTemplate(firstName, code);
        sendEmail(to, subject, htmlContent);
    }
    
    public void sendWelcomeEmail(String to, String firstName) {
        String subject = "Bienvenue sur IUSJC Schedule Management";
        String htmlContent = buildWelcomeEmailTemplate(firstName);
        sendEmail(to, subject, htmlContent);
    }
    
    public void sendTeacherApplicationConfirmation(String to, String firstName) {
        String subject = "Candidature reçue - IUSJC";
        String htmlContent = buildApplicationConfirmationTemplate(firstName);
        sendEmail(to, subject, htmlContent);
    }
    
    public void sendTeacherApprovalEmail(String to, String firstName, String temporaryPassword) {
        String subject = "Candidature approuvée - IUSJC";
        String htmlContent = buildApprovalEmailTemplate(firstName, temporaryPassword);
        sendEmail(to, subject, htmlContent);
    }
    
    public void sendTeacherRejectionEmail(String to, String firstName, String reason) {
        String subject = "Candidature refusée - IUSJC";
        String htmlContent = buildRejectionEmailTemplate(firstName, reason);
        sendEmail(to, subject, htmlContent);
    }
    
    public void sendAdminNotification(String to, String teacherName, String teacherEmail) {
        String subject = "Nouvelle candidature enseignant - IUSJC";
        String htmlContent = buildAdminNotificationTemplate(teacherName, teacherEmail);
        sendEmail(to, subject, htmlContent);
    }
    
    private String build2FAEmailTemplate(String firstName, String code) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .code-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Code de Vérification</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>%s</strong>,</p>
                        <p>Voici votre code de vérification pour vous connecter à IUSJC Schedule Management :</p>
                        <div class="code-box">
                            <div class="code">%s</div>
                        </div>
                        <p><strong>⏰ Ce code expire dans 10 minutes.</strong></p>
                        <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
                        <p>Cordialement,<br>L'équipe IUSJC</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Institut Universitaire Saint Jean du Cameroun</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(firstName, code);
    }
    
    private String buildWelcomeEmailTemplate(String firstName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Bienvenue !</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>%s</strong>,</p>
                        <p>Bienvenue sur <strong>IUSJC Schedule Management</strong> !</p>
                        <p>Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter et gérer vos emplois du temps.</p>
                        <p>Cordialement,<br>L'équipe IUSJC</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Institut Universitaire Saint Jean du Cameroun</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(firstName);
    }
    
    private String buildApplicationConfirmationTemplate(String firstName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📝 Candidature Reçue</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>%s</strong>,</p>
                        <p>Nous avons bien reçu votre candidature en tant qu'enseignant à l'IUSJC.</p>
                        <p>Votre dossier est actuellement en cours d'examen par notre équipe administrative.</p>
                        <p>Vous recevrez un email de confirmation dès que votre candidature sera validée.</p>
                        <p>Cordialement,<br>L'équipe IUSJC</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Institut Universitaire Saint Jean du Cameroun</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(firstName);
    }
    
    private String buildApprovalEmailTemplate(String firstName, String temporaryPassword) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .password-box { background: white; border: 2px solid #10b981; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .password { font-size: 24px; font-weight: bold; color: #10b981; letter-spacing: 2px; font-family: monospace; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Candidature Approuvée</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>%s</strong>,</p>
                        <p>Félicitations ! Votre candidature en tant qu'enseignant à l'IUSJC a été approuvée.</p>
                        
                        <div class="password-box">
                            <p style="margin: 0 0 10px 0; color: #666;">Votre mot de passe temporaire :</p>
                            <div class="password">%s</div>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Important :</strong>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                <li>Conservez ce mot de passe en lieu sûr</li>
                                <li>Changez-le dès votre première connexion</li>
                                <li>Ne le partagez avec personne</li>
                            </ul>
                        </div>
                        
                        <p>Vous pouvez maintenant vous connecter à la plateforme et commencer à gérer vos emplois du temps.</p>
                        <p><strong>URL de connexion :</strong> <a href="http://localhost:4200/login">http://localhost:4200/login</a></p>
                        <p>Bienvenue dans l'équipe !</p>
                        <p>Cordialement,<br>L'équipe IUSJC</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Institut Universitaire Saint Jean du Cameroun</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(firstName, temporaryPassword);
    }
    
    private String buildRejectionEmailTemplate(String firstName, String reason) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ef4444 0%%, #dc2626 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .reason-box { background: white; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>❌ Candidature Refusée</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>%s</strong>,</p>
                        <p>Nous vous remercions pour votre candidature en tant qu'enseignant à l'IUSJC.</p>
                        <p>Malheureusement, après examen de votre dossier, nous ne pouvons pas donner suite à votre candidature pour le moment.</p>
                        <div class="reason-box">
                            <strong>Raison :</strong> %s
                        </div>
                        <p>Nous vous encourageons à postuler à nouveau ultérieurement.</p>
                        <p>Cordialement,<br>L'équipe IUSJC</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Institut Universitaire Saint Jean du Cameroun</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(firstName, reason);
    }
    
    private String buildAdminNotificationTemplate(String teacherName, String teacherEmail) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; padding: 15px; margin: 20px 0; border-radius: 8px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 Nouvelle Candidature</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour Admin,</p>
                        <p>Une nouvelle candidature enseignant a été soumise et nécessite votre validation.</p>
                        <div class="info-box">
                            <p><strong>Nom :</strong> %s</p>
                            <p><strong>Email :</strong> %s</p>
                        </div>
                        <p>Veuillez vous connecter à la plateforme pour examiner cette candidature.</p>
                        <p>Cordialement,<br>Système IUSJC</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Institut Universitaire Saint Jean du Cameroun</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(teacherName, teacherEmail);
    }
}
