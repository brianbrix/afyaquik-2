
package com.afyaquik.hms.notification.service;

import com.afyaquik.hms.notification.events.NotificationEventPublisher;
import com.afyaquik.hms.notification.domain.Notification;
import com.afyaquik.hms.notification.repository.NotificationRepository;
import com.afyaquik.hms.notification.domain.NotificationLevel;
import com.afyaquik.hms.notification.domain.NotificationTemplate;
import com.afyaquik.hms.notification.dto.NotificationTemplateDto;
import com.afyaquik.hms.notification.repository.NotificationTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final NotificationTemplateRepository templateRepository;
    private final NotificationRepository notificationRepository;

    private final NotificationEventPublisher notificationEventPublisher;

    public NotificationService(NotificationTemplateRepository templateRepository, NotificationRepository notificationRepository, NotificationEventPublisher notificationEventPublisher) {
        this.templateRepository = templateRepository;
        this.notificationRepository = notificationRepository;
        this.notificationEventPublisher = notificationEventPublisher;
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
        entity.setId(null);
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
        notification.setSentAt(java.time.Instant.now());
        notificationRepository.save(notification);
        // Publish over websocket
        notificationEventPublisher.publish(notification);
        // Log for debugging
        switch (channel.toUpperCase()) {
            case "IN_APP" -> log.info("[IN-APP][{}][{}] {}", level, recipientId, rendered);
            case "EMAIL" -> log.info("[EMAIL][{}][{}] {}", level, recipientId, rendered); // TODO: integrate email
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
}