package com.afyaquik.hms.notification.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {
    @Column(nullable = false, length = 64)
    private String recipientId;

    @Column(nullable = false, length = 64)
    private String templateCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private NotificationLevel level;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 16)
    private String channel;

    @Column(nullable = false)
    private boolean read = false;

    @Column(nullable = false)
    private Instant sentAt = Instant.now();

    // Getters and setters
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
}
