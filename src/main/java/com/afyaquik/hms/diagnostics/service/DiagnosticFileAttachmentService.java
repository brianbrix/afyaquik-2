package com.afyaquik.hms.diagnostics.service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.diagnostics.domain.DiagnosticFileAttachment;
import com.afyaquik.hms.diagnostics.dto.DiagnosticFileAttachmentDto;
import com.afyaquik.hms.diagnostics.repository.DiagnosticFileAttachmentRepository;
import com.afyaquik.hms.storage.service.MinioService;

@Service
@Transactional
public class DiagnosticFileAttachmentService {

    @Autowired
    private DiagnosticFileAttachmentRepository fileAttachmentRepository;

    @Autowired
    private MinioService minioService;

    public DiagnosticFileAttachmentDto uploadFile(Long diagnosticItemId, MultipartFile file) {
        try {
            // Upload file to MinIO
            String folder = "diagnostic-files/" + diagnosticItemId;
            String objectName = minioService.uploadFile(file, folder);
            String fileUrl = minioService.getFileUrl(objectName);
            
            // Create database record
            DiagnosticFileAttachment attachment = new DiagnosticFileAttachment();
            attachment.setDiagnosticItemId(diagnosticItemId);
            attachment.setOriginalFilename(file.getOriginalFilename());
            attachment.setObjectName(objectName);
            attachment.setFileSize(file.getSize());
            attachment.setContentType(file.getContentType());
            attachment.setFileUrl(fileUrl);
            attachment.setUploadedAt(Instant.now());
            attachment.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
            
            // Get current user info
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                String username = authentication.getName();
                attachment.setUploadedBy(username);
                attachment.setUploadedByName(username); // TODO: Get display name from user service
            } else {
                attachment.setUploadedBy("system");
                attachment.setUploadedByName("System");
            }
            
            DiagnosticFileAttachment savedAttachment = fileAttachmentRepository.save(attachment);
            return convertToDto(savedAttachment);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<DiagnosticFileAttachmentDto> getFilesByDiagnosticItemId(Long diagnosticItemId) {
        return fileAttachmentRepository.findByDiagnosticItemIdAndDeletedFalseOrderByUploadedAtDesc(diagnosticItemId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DiagnosticFileAttachmentDto> getFilesByDiagnosticItemIds(List<Long> diagnosticItemIds) {
        return fileAttachmentRepository.findByDiagnosticItemIdInAndDeletedFalseOrderByUploadedAtDesc(diagnosticItemIds)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void deleteFile(Long attachmentId) {
        DiagnosticFileAttachment attachment = fileAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("File attachment not found with id: " + attachmentId));
        
        if (!attachment.getTenantId().equals(TenantHeaderInterceptor.getCurrentTenant())) {
            throw new SecurityException("Access denied to file in another tenant.");
        }
        
        try {
            // Delete from MinIO
            minioService.deleteFile(attachment.getObjectName());
        } catch (Exception e) {
            // Log error but continue with database deletion
            System.err.println("Failed to delete file from MinIO: " + e.getMessage());
        }
        
        // Soft delete from database
        attachment.softDelete();
        fileAttachmentRepository.save(attachment);
    }

    private DiagnosticFileAttachmentDto convertToDto(DiagnosticFileAttachment attachment) {
        DiagnosticFileAttachmentDto dto = new DiagnosticFileAttachmentDto();
        dto.setId(attachment.getId());
        dto.setDiagnosticItemId(attachment.getDiagnosticItemId());
        dto.setOriginalFilename(attachment.getOriginalFilename());
        dto.setObjectName(attachment.getObjectName());
        dto.setFileSize(attachment.getFileSize());
        dto.setContentType(attachment.getContentType());
        dto.setFileUrl(attachment.getFileUrl());
        dto.setUploadedBy(attachment.getUploadedBy());
        dto.setUploadedByName(attachment.getUploadedByName());
        dto.setUploadedAt(attachment.getUploadedAt());
        return dto;
    }
}
