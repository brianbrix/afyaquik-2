
package com.afyaquik.hms.notification.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.notification.domain.Notification;
import com.afyaquik.hms.notification.domain.NotificationLevel;
import com.afyaquik.hms.notification.domain.NotificationTemplate;
import com.afyaquik.hms.notification.dto.NotificationDto;
import com.afyaquik.hms.notification.dto.NotificationTemplateDto;
import com.afyaquik.hms.notification.events.NotificationEventPublisher;
import com.afyaquik.hms.notification.repository.NotificationRepository;
import com.afyaquik.hms.notification.repository.NotificationTemplateRepository;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final NotificationTemplateRepository templateRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationEventPublisher notificationEventPublisher;
    private final EmailService emailService;

    public NotificationService(NotificationTemplateRepository templateRepository, NotificationRepository notificationRepository, NotificationEventPublisher notificationEventPublisher, EmailService emailService) {
        this.templateRepository = templateRepository;
        this.notificationRepository = notificationRepository;
        this.notificationEventPublisher = notificationEventPublisher;
        this.emailService = emailService;
    }

    // --- DTO conversion ---
    public NotificationTemplateDto toDto(NotificationTemplate t) {
        NotificationTemplateDto dto = new NotificationTemplateDto();
        dto.setId(t.getId());
        dto.setCode(t.getCode());
        dto.setName(t.getName());
        dto.setLevel(t.getLevel());
        dto.setContent(t.getContent());
        dto.setVariables(t.getVariables());
        dto.setTargetRoles(t.getTargetRoles());
        dto.setEnabled(t.isEnabled());
        return dto;
    }

    public NotificationTemplate fromDto(NotificationTemplateDto dto) {
        NotificationTemplate t = new NotificationTemplate();
        t.setId(dto.getId());
        t.setCode(dto.getCode());
        t.setName(dto.getName());
        t.setLevel(dto.getLevel());
        t.setContent(dto.getContent());
        t.setVariables(dto.getVariables());
        t.setTargetRoles(dto.getTargetRoles());
        t.setEnabled(dto.isEnabled());
        return t;
    }

    public List<NotificationTemplateDto> toDtoList(List<NotificationTemplate> entities) {
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    // --- CRUD for controller ---
    public List<NotificationTemplateDto> findAllDtos() {
        return toDtoList(templateRepository.findAll());
    }

    public Optional<NotificationTemplateDto> findDtoById(Long id) {
        return templateRepository.findById(id).map(this::toDto);
    }

    public NotificationTemplateDto create(NotificationTemplateDto dto) {
        NotificationTemplate entity = fromDto(dto);
        entity.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        return toDto(templateRepository.save(entity));
    }

    public Optional<NotificationTemplateDto> update(Long id, NotificationTemplateDto dto) {
        return templateRepository.findById(id).map(existing -> {
            NotificationTemplate entity = fromDto(dto);
            entity.setId(id);
            return toDto(templateRepository.save(entity));
        });
    }

    public boolean delete(Long id) {
        if (!templateRepository.existsById(id)) return false;
        templateRepository.deleteById(id);
        return true;
    }

    /**
     * Send a notification using a template code and variables.
     * @param templateCode The code of the template to use
     * @param variables Map of variable names to values
     * @param recipientId User or channel to notify (for now, just a string)
     * @param channel Notification channel ("IN_APP", "EMAIL", etc)
     */
    @Transactional
    public void sendNotification(String templateCode, Map<String, Object> variables, String recipientId, String channel) {
        Optional<NotificationTemplate> opt = templateRepository.findByCode(templateCode);
        if (opt.isEmpty() || !opt.get().isEnabled()) {
            log.warn("Notification template '{}' not found or disabled", templateCode);
            return;
        }
        NotificationTemplate template = opt.get();
        String rendered = renderTemplate(template.getContent(), variables);
        NotificationLevel level = template.getLevel();
        // Persist notification
        Notification notification = new Notification();
        notification.setTenantId(template.getTenantId());
        notification.setRecipientId(recipientId);
        notification.setTemplateCode(templateCode);
        notification.setLevel(level);
        notification.setContent(rendered);
        notification.setChannel(channel);
        notification.setRead(false);
        notification.setSentAt(java.time.LocalDateTime.now());
        notificationRepository.save(notification);
        // Publish over websocket
        notificationEventPublisher.publish(notification);
        // Send notification via appropriate channel
        switch (channel.toUpperCase()) {
            case "IN_APP" -> {
                log.info("[IN-APP][{}][{}] {}", level, recipientId, rendered);
            }
            case "EMAIL" -> {
                log.info("[EMAIL][{}][{}] {}", level, recipientId, rendered);
                sendEmailNotification(recipientId, template.getName(), rendered, level.name());
            }
            default -> log.info("[{}][{}][{}] {}", channel, level, recipientId, rendered);
        }
    }

    /**
     * Simple template rendering: replaces {{var}} with value from variables map.
     */
    public String renderTemplate(String template, Map<String, Object> variables) {
        if (template == null || variables == null) return template;
        String result = template;
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String key = "{{" + entry.getKey() + "}}";
            result = result.replace(key, entry.getValue() != null ? entry.getValue().toString() : "");
        }
        return result;
    }

    // --- User notification methods ---
    
    /**
     * Get all notifications for a specific user
     */
    public List<NotificationDto> getNotificationsForUser(String tenantId, String recipientId) {
        List<Notification> notifications = notificationRepository.findByTenantIdAndRecipientIdOrderBySentAtDesc(tenantId, recipientId);
        return notifications.stream()
                .map(NotificationDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get notifications for a specific user filtered by active role
     * Only returns notifications that are targeted to the user's active role
     */
    public List<NotificationDto> getNotificationsForUserByRole(String tenantId, String recipientId, String activeRole) {
        List<Notification> allNotifications = notificationRepository.findByTenantIdAndRecipientIdOrderBySentAtDesc(tenantId, recipientId);
        
        // Filter notifications based on role targeting
        return allNotifications.stream()
                .filter(notification -> isNotificationRelevantForRole(notification, activeRole))
                .map(NotificationDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Mark a specific notification as read
     */
    @Transactional
    public void markAsRead(String tenantId, String recipientId, Long notificationId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isPresent() && 
            notification.get().getTenantId().equals(tenantId) && 
            notification.get().getRecipientId().equals(recipientId)) {
            notification.get().setRead(true);
            notificationRepository.save(notification.get());
        }
    }
    
    /**
     * Mark all notifications as read for a specific user
     */
    @Transactional
    public void markAllAsRead(String tenantId, String recipientId) {
        List<Notification> notifications = notificationRepository.findByTenantIdAndRecipientIdAndReadFalse(tenantId, recipientId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
    
    /**
     * Get unread notification count for a specific user
     */
    public int getUnreadCount(String tenantId, String recipientId) {
        return notificationRepository.countByTenantIdAndRecipientIdAndReadFalse(tenantId, recipientId);
    }
    
    /**
     * Send email notification
     */
    private void sendEmailNotification(String recipientId, String subject, String content, String level) {
        try {
            // Check if email is configured
            if (!emailService.isEmailConfigured()) {
                log.warn("Email not configured, skipping email notification to: {}", recipientId);
                return;
            }
            
            // Validate email format (basic validation)
            if (!isValidEmail(recipientId)) {
                log.warn("Invalid email format: {}", recipientId);
                return;
            }
            
            // Send the email
            emailService.sendNotificationEmail(recipientId, subject, content, level);
            log.info("Email notification sent successfully to: {}", recipientId);
            
        } catch (Exception e) {
            log.error("Failed to send email notification to: {}", recipientId, e);
            // Don't throw exception to avoid breaking the notification flow
        }
    }
    
    /**
     * Basic email validation
     */
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return email.contains("@") && email.contains(".");
    }
    
    /**
     * Check if a notification is relevant for the given role
     */
    private boolean isNotificationRelevantForRole(Notification notification, String activeRole) {
        // If no active role, show all notifications
        if (activeRole == null || activeRole.trim().isEmpty()) {
            log.debug("No active role provided, showing notification: {}", notification.getTemplateCode());
            return true;
        }
        
        // Get the template for this notification
        Optional<NotificationTemplate> template = templateRepository.findByCode(notification.getTemplateCode());
        if (template.isEmpty()) {
            // If template not found, show the notification (fallback)
            log.debug("Template not found for notification: {}, showing notification", notification.getTemplateCode());
            return true;
        }
        
        NotificationTemplate templateEntity = template.get();
        String targetRoles = templateEntity.getTargetRoles();
        
        // If no target roles specified, show to all roles
        if (targetRoles == null || targetRoles.trim().isEmpty()) {
            log.debug("No target roles specified for template: {}, showing notification", notification.getTemplateCode());
            return true;
        }
        
        // Check if the active role is in the target roles
        String[] roles = targetRoles.split(",");
        for (String role : roles) {
            if (role.trim().equalsIgnoreCase(activeRole.trim())) {
                log.debug("Active role '{}' matches target role '{}' for notification: {}", activeRole, role.trim(), notification.getTemplateCode());
                return true;
            }
        }
        
        log.debug("Active role '{}' not in target roles '{}' for notification: {}", activeRole, targetRoles, notification.getTemplateCode());
        return false;
    }
    
    /**
     * Send notification to all users with specific roles
     */
    @Transactional
    public void sendNotificationToRoles(String templateCode, Map<String, Object> variables, String[] targetRoles, String channel) {
        // This would require integration with user service to get users by roles
        // For now, we'll log the intention
        log.info("Sending notification '{}' to roles: {}", templateCode, String.join(", ", targetRoles));
        
        // TODO: Implement integration with user service to get users by roles
        // This would involve:
        // 1. Getting all users with the specified roles
        // 2. Sending notification to each user
        // 3. This requires integration with the user/role management system
    }
}