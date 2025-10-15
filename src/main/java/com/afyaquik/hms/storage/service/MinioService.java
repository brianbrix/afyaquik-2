package com.afyaquik.hms.storage.service;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;

@Service
public class MinioService {

    private final MinioClient minioClient;
    private final String bucketName;

    public MinioService(
            @Value("${minio.endpoint:http://localhost:9000}") String endpoint,
            @Value("${minio.access-key:minioadmin}") String accessKey,
            @Value("${minio.secret-key:minioadmin123}") String secretKey,
            @Value("${minio.bucket-name:diagnostic-files}") String bucketName) {
        
        this.minioClient = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
        this.bucketName = bucketName;
        
        initializeBucket();
    }

    private void initializeBucket() {
        try {
            // Initialize the default bucket
            boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build());
            
            if (!bucketExists) {
                minioClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(bucketName)
                        .build());
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialize MinIO bucket", e);
        }
    }

    private String getTenantBucketName() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalStateException("Tenant ID is required for file operations");
        }
        return "tenant-" + tenantId;
    }

    private void ensureTenantBucketExists(String tenantBucketName) throws Exception {
        boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder()
                .bucket(tenantBucketName)
                .build());
        
        if (!bucketExists) {
            minioClient.makeBucket(MakeBucketArgs.builder()
                    .bucket(tenantBucketName)
                    .build());
        }
    }

    public String uploadFile(MultipartFile file, String folder) throws Exception {
        String fileName = generateFileName(file.getOriginalFilename());
        String objectName = folder + "/" + fileName;
        
        // Get tenant-specific bucket name
        String tenantBucketName = getTenantBucketName();
        
        // Ensure tenant bucket exists
        ensureTenantBucketExists(tenantBucketName);
        
        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(tenantBucketName)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
        }
        
        return objectName;
    }

    public InputStream downloadFile(String objectName) throws Exception {
        String tenantBucketName = getTenantBucketName();
        return minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(tenantBucketName)
                        .object(objectName)
                        .build()
        );
    }

    public void deleteFile(String objectName) throws Exception {
        String tenantBucketName = getTenantBucketName();
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(tenantBucketName)
                        .object(objectName)
                        .build()
        );
    }

    public String getFileUrl(String objectName) throws Exception {
        String tenantBucketName = getTenantBucketName();
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(io.minio.http.Method.GET)
                        .bucket(tenantBucketName)
                        .object(objectName)
                        .expiry(60 * 60 * 24) // 24 hours
                        .build()
        );
    }

    private String generateFileName(String originalFileName) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }
}
