package com.afyaquik.hms.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    @Value("${app.email.from-name:AfyQuik HMS}")
    private String fromName;
    
    /**
     * Send a simple text email
     */
    public void sendSimpleEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            message.setFrom(getFromAddress());
            
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    /**
     * Send an HTML email
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true indicates HTML
            helper.setFrom(getFromAddress());
            
            mailSender.send(mimeMessage);
            log.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to: {}", to, e);
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }
    
    /**
     * Send notification email with template
     */
    public void sendNotificationEmail(String to, String subject, String content, String level) {
        try {
            // Create HTML content with styling based on notification level
            String htmlContent = createNotificationHtml(content, level);
            sendHtmlEmail(to, subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send notification email to: {}", to, e);
            // Fallback to simple text email
            sendSimpleEmail(to, subject, content);
        }
    }
    
    /**
     * Create HTML content for notification emails
     */
    private String createNotificationHtml(String content, String level) {
        String color = getLevelColor(level);
        String icon = getLevelIcon(level);
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>HMS Notification</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: %s; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                    .icon { font-size: 24px; margin-right: 10px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <span class="icon">%s</span>
                        <strong>HMS Notification</strong>
                    </div>
                    <div class="content">
                        %s
                    </div>
                    <div class="footer">
                        This is an automated message from the Hospital Management System.
                    </div>
                </div>
            </body>
            </html>
            """, color, icon, content.replace("\n", "<br>"));
    }
    
    /**
     * Get color for notification level
     */
    private String getLevelColor(String level) {
        return switch (level.toUpperCase()) {
            case "CRITICAL" -> "#dc3545"; // Red
            case "HIGH" -> "#fd7e14"; // Orange
            case "MEDIUM" -> "#ffc107"; // Yellow
            case "LOW" -> "#6c757d"; // Gray
            default -> "#007bff"; // Blue
        };
    }
    
    /**
     * Get icon for notification level
     */
    private String getLevelIcon(String level) {
        return switch (level.toUpperCase()) {
            case "CRITICAL" -> "🚨";
            case "HIGH" -> "⚠️";
            case "MEDIUM" -> "ℹ️";
            case "LOW" -> "📝";
            default -> "🔔";
        };
    }
    
    /**
     * Get the from address
     */
    private String getFromAddress() {
        if (StringUtils.hasText(fromEmail)) {
            return StringUtils.hasText(fromName) ? 
                String.format("%s <%s>", fromName, fromEmail) : fromEmail;
        }
        return "noreply@hms.local";
    }
    
    /**
     * Check if email is configured
     */
    public boolean isEmailConfigured() {
        return StringUtils.hasText(fromEmail);
    }
}
