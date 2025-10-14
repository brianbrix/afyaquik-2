package com.afyaquik.hms.notification.dto;

import java.time.Instant;

import com.afyaquik.hms.notification.domain.Notification;
import com.afyaquik.hms.notification.domain.NotificationLevel;

public class NotificationDto {
    private Long id;
    private String recipientId;
    private String templateCode;
    private NotificationLevel level;
    private String content;
    private String channel;
    private boolean read;
    private Instant sentAt;
    private String tenantId;
    
    // Constructors
    public NotificationDto() {}
    
    public NotificationDto(Notification notification) {
        this.id = notification.getId();
        this.recipientId = notification.getRecipientId();
        this.templateCode = notification.getTemplateCode();
        this.level = notification.getLevel();
        this.content = notification.getContent();
        this.channel = notification.getChannel();
        this.read = notification.isRead();
        this.sentAt = notification.getSentAt();
        this.tenantId = notification.getTenantId();
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    
    public String getTemplateCode() { return templateCode; }
    public void setTemplateCode(String templateCode) { this.templateCode = templateCode; }
    
    public NotificationLevel getLevel() { return level; }
    public void setLevel(NotificationLevel level) { this.level = level; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    
    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
    
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
}
