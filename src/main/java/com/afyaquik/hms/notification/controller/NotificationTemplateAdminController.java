package com.afyaquik.hms.notification.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.audit.annotation.Auditable;
import com.afyaquik.hms.notification.domain.NotificationTemplate;
import com.afyaquik.hms.notification.dto.NotificationTemplateDto;
import com.afyaquik.hms.notification.service.NotificationService;

@RestController
@RequestMapping("/api/v1/admin/notification-templates")
@Auditable(entityType = "NotificationTemplate", description = "Notification template management operations")
public class NotificationTemplateAdminController {
    private final NotificationService notificationService;

    public NotificationTemplateAdminController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }


    @GetMapping
    @Auditable(action = "GET_NOTIFICATION_TEMPLATES", entityType = "NotificationTemplate", auditGet = true, description = "Get all notification templates")
    public List<NotificationTemplateDto> getAll() {
        return notificationService.findAllDtos();
    }


    @GetMapping("/{id}")
    @Auditable(action = "GET_NOTIFICATION_TEMPLATE", entityType = "NotificationTemplate", entityIdField = "id", auditGet = true, description = "Get notification template by ID")
    public ResponseEntity<NotificationTemplateDto> getById(@PathVariable Long id) {
        return notificationService.findDtoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping
    @Auditable(action = "CREATE_NOTIFICATION_TEMPLATE", entityType = "NotificationTemplate", description = "Create new notification template")
    public NotificationTemplateDto create(@RequestBody NotificationTemplateDto dto) {
        return notificationService.create(dto);
    }


    @PutMapping("/{id}")
    @Auditable(action = "UPDATE_NOTIFICATION_TEMPLATE", entityType = "NotificationTemplate", entityIdField = "id", description = "Update notification template")
    public ResponseEntity<NotificationTemplateDto> update(@PathVariable Long id, @RequestBody NotificationTemplateDto dto) {
        return notificationService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // --- Mapping helpers ---
    private NotificationTemplateDto toDto(NotificationTemplate t) {
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

    private NotificationTemplate fromDto(NotificationTemplateDto dto) {
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!notificationService.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
