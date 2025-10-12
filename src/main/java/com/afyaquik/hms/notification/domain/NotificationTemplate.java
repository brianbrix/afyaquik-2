package com.afyaquik.hms.notification.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "notification_templates", indexes = {
        @Index(name = "idx_template_code", columnList = "code", unique = true)
})
public class NotificationTemplate extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 64)
    private String code;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false, length = 16)
    private NotificationLevel level = NotificationLevel.INFO;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "variables", length = 255)
    private String variables; // comma-separated variable names

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    // Getters and setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public NotificationLevel getLevel() { return level; }
    public void setLevel(NotificationLevel level) { this.level = level; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getVariables() { return variables; }
    public void setVariables(String variables) { this.variables = variables; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}