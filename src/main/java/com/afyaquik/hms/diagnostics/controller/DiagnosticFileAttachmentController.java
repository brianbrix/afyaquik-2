package com.afyaquik.hms.diagnostics.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.diagnostics.dto.DiagnosticFileAttachmentDto;
import com.afyaquik.hms.diagnostics.service.DiagnosticFileAttachmentService;

@RestController
@RequestMapping("/api/v1/diagnostics/files")
public class DiagnosticFileAttachmentController {

    @Autowired
    private DiagnosticFileAttachmentService fileAttachmentService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DiagnosticFileAttachmentDto>> uploadFile(
            @RequestParam("diagnosticItemId") Long diagnosticItemId,
            @RequestParam("file") MultipartFile file) {
        try {
            DiagnosticFileAttachmentDto attachment = fileAttachmentService.uploadFile(diagnosticItemId, file);
            return ResponseEntity.ok(ApiResponse.success(attachment));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/diagnostic-item/{diagnosticItemId}")
    public ResponseEntity<ApiResponse<List<DiagnosticFileAttachmentDto>>> getFilesByDiagnosticItem(@PathVariable Long diagnosticItemId) {
        try {
            List<DiagnosticFileAttachmentDto> files = fileAttachmentService.getFilesByDiagnosticItemId(diagnosticItemId);
            return ResponseEntity.ok(ApiResponse.success(files));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch files: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable Long attachmentId) {
        try {
            fileAttachmentService.deleteFile(attachmentId);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete file: " + e.getMessage()));
        }
    }
}
