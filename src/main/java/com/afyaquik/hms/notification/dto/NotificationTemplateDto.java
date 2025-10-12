package com.afyaquik.hms.notification.dto;

import com.afyaquik.hms.notification.domain.NotificationLevel;

public class NotificationTemplateDto {
    private Long id;
    private String code;
    private String name;
    private NotificationLevel level;
    private String content;
    private String variables;
    private boolean enabled;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
