package cm.iusjc.schedule;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class ScheduleManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScheduleManagementApplication.class, args);
        System.out.println("\n🚀 IUSJC Schedule Management API démarrée avec succès !");
        System.out.println("📚 Documentation API: http://localhost:8080/api/docs");
        System.out.println("🔐 Health Check: http://localhost:8080/api/health\n");
    }
}
