package com.afyaquik.hms.notification.config;

import com.afyaquik.hms.notification.domain.NotificationLevel;
import com.afyaquik.hms.notification.domain.NotificationTemplate;
import com.afyaquik.hms.notification.repository.NotificationTemplateRepository;
import com.afyaquik.hms.notification.domain.Notification;
import com.afyaquik.hms.notification.repository.NotificationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class NotificationSeeder {
    @Bean
    public CommandLineRunner seedNotifications(NotificationTemplateRepository templateRepo, NotificationRepository notificationRepo) {
        return args -> {
            // Seed notification templates
            String defaultTenant = System.getProperty("afyaquik.default-admin.tenant", System.getenv().getOrDefault("AFYAQUIK_DEFAULT_ADMIN_TENANT", "clinic-a"));
            if (templateRepo.count() == 0) {
                NotificationTemplate queueAssigned = new NotificationTemplate();
                queueAssigned.setTenantId(defaultTenant);
                queueAssigned.setCode("QUEUE_ASSIGNED");
                queueAssigned.setName("Queue Item Assigned");
                queueAssigned.setLevel(NotificationLevel.INFO);
                queueAssigned.setContent("You have been assigned to a queue item for patient {{patientName}} (ID: {{patientId}}).");
                queueAssigned.setVariables("patientName,patientId");
                queueAssigned.setEnabled(true);
                templateRepo.save(queueAssigned);

                NotificationTemplate queueAdvanced = new NotificationTemplate();
                queueAdvanced.setTenantId(defaultTenant);
                queueAdvanced.setCode("QUEUE_ADVANCED");
                queueAdvanced.setName("Queue Item Advanced");
                queueAdvanced.setLevel(NotificationLevel.INFO);
                queueAdvanced.setContent("Queue item for patient {{patientName}} has advanced to status {{status}}.");
                queueAdvanced.setVariables("patientName,status");
                queueAdvanced.setEnabled(true);
                templateRepo.save(queueAdvanced);
            }

            // Seed example notifications if none exist
            if (notificationRepo.count() == 0) {
                Notification n = new Notification();
                n.setTenantId(defaultTenant);
                n.setRecipientId("admin");
                n.setTemplateCode("QUEUE_ASSIGNED");
                n.setLevel(NotificationLevel.INFO);
                n.setContent("You have been assigned to a queue item for patient John Doe (ID: 12345).");
                n.setChannel("IN_APP");
                n.setRead(false);
                notificationRepo.save(n);
            }
        };
    }
}
