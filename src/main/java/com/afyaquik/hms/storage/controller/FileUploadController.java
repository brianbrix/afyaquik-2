package com.afyaquik.hms.storage.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.storage.service.MinioService;

@RestController
@RequestMapping("/api/v1/files")
public class FileUploadController {

    @Autowired
    private MinioService minioService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("folder") String folder) {
        
        try {
            // Validate tenant ID
            String tenantId = TenantHeaderInterceptor.getCurrentTenant();
            if (tenantId == null || tenantId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Tenant ID is required for file operations"));
            }
            
            List<Map<String, String>> uploadedFiles = new ArrayList<>();
            
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String objectName = minioService.uploadFile(file, folder);
                    String fileUrl = minioService.getFileUrl(objectName);
                    
                    Map<String, String> fileInfo = new HashMap<>();
                    fileInfo.put("originalName", file.getOriginalFilename());
                    fileInfo.put("objectName", objectName);
                    fileInfo.put("url", fileUrl);
                    fileInfo.put("size", String.valueOf(file.getSize()));
                    fileInfo.put("contentType", file.getContentType());
                    fileInfo.put("tenantId", tenantId);
                    
                    uploadedFiles.add(fileInfo);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("uploadedFiles", uploadedFiles);
            response.put("count", uploadedFiles.size());
            response.put("tenantId", tenantId);
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to upload files: " + e.getMessage()));
        }
    }

    @GetMapping("/download/{objectName}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String objectName) {
        try {
            // Validate tenant ID
            String tenantId = TenantHeaderInterceptor.getCurrentTenant();
            if (tenantId == null || tenantId.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            try (var inputStream = minioService.downloadFile(objectName)) {
                byte[] fileBytes = inputStream.readAllBytes();
                return ResponseEntity.ok()
                        .header("Content-Disposition", "attachment; filename=\"" + objectName + "\"")
                        .body(fileBytes);
            }
                    
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{objectName}")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable String objectName) {
        try {
            // Validate tenant ID
            String tenantId = TenantHeaderInterceptor.getCurrentTenant();
            if (tenantId == null || tenantId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Tenant ID is required for file operations"));
            }
            
            minioService.deleteFile(objectName);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete file: " + e.getMessage()));
        }
    }
}
