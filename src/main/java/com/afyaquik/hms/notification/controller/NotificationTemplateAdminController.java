package com.afyaquik.hms.notification.controller;

import com.afyaquik.hms.notification.domain.NotificationTemplate;
import com.afyaquik.hms.notification.dto.NotificationTemplateDto;
import com.afyaquik.hms.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/notification-templates")
public class NotificationTemplateAdminController {
    private final NotificationService notificationService;

    public NotificationTemplateAdminController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }


    @GetMapping
    public List<NotificationTemplateDto> getAll() {
        return notificationService.findAllDtos();
    }


    @GetMapping("/{id}")
    public ResponseEntity<NotificationTemplateDto> getById(@PathVariable Long id) {
        return notificationService.findDtoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping
    public NotificationTemplateDto create(@RequestBody NotificationTemplateDto dto) {
        return notificationService.create(dto);
    }


    @PutMapping("/{id}")
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
