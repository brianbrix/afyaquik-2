package com.afyaquik.hms.snapshot.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class DataEncryptionService {

    private static final Logger log = LoggerFactory.getLogger(DataEncryptionService.class);
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 16;

    @Value("${hms.encryption.key:default-encryption-key-change-in-production}")
    private String encryptionKey;

    /**
     * Encrypt data using AES-GCM
     */
    public String encrypt(String plainText) {
        try {
            if (plainText == null || plainText.isEmpty()) {
                return plainText;
            }

            SecretKeySpec keySpec = new SecretKeySpec(encryptionKey.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);

            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);

            cipher.init(Cipher.ENCRYPT_MODE, keySpec, parameterSpec);
            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            // Combine IV and cipher text
            byte[] encryptedData = new byte[GCM_IV_LENGTH + cipherText.length];
            System.arraycopy(iv, 0, encryptedData, 0, GCM_IV_LENGTH);
            System.arraycopy(cipherText, 0, encryptedData, GCM_IV_LENGTH, cipherText.length);

            return Base64.getEncoder().encodeToString(encryptedData);

        } catch (Exception e) {
            log.error("Error encrypting data", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypt data using AES-GCM
     */
    public String decrypt(String encryptedText) {
        try {
            if (encryptedText == null || encryptedText.isEmpty()) {
                return encryptedText;
            }

            byte[] encryptedData = Base64.getDecoder().decode(encryptedText);
            
            // Extract IV and cipher text
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(encryptedData, 0, iv, 0, GCM_IV_LENGTH);
            
            byte[] cipherText = new byte[encryptedData.length - GCM_IV_LENGTH];
            System.arraycopy(encryptedData, GCM_IV_LENGTH, cipherText, 0, cipherText.length);

            SecretKeySpec keySpec = new SecretKeySpec(encryptionKey.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);

            cipher.init(Cipher.DECRYPT_MODE, keySpec, parameterSpec);
            byte[] plainText = cipher.doFinal(cipherText);

            return new String(plainText, StandardCharsets.UTF_8);

        } catch (Exception e) {
            log.error("Error decrypting data", e);
            throw new RuntimeException("Decryption failed", e);
        }
    }

    /**
     * Generate a secure encryption key
     */
    public String generateEncryptionKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
            keyGenerator.init(256); // AES-256
            SecretKey key = keyGenerator.generateKey();
            return Base64.getEncoder().encodeToString(key.getEncoded());
        } catch (Exception e) {
            log.error("Error generating encryption key", e);
            throw new RuntimeException("Key generation failed", e);
        }
    }

    /**
     * Hash data using SHA-256
     */
    public String hash(String data) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            log.error("Error hashing data", e);
            throw new RuntimeException("Hashing failed", e);
        }
    }

    /**
     * Generate a secure random token
     */
    public String generateSecureToken(int length) {
        SecureRandom random = new SecureRandom();
        byte[] token = new byte[length];
        random.nextBytes(token);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(token);
    }

    /**
     * Verify data integrity using hash
     */
    public boolean verifyIntegrity(String data, String expectedHash) {
        String actualHash = hash(data);
        return actualHash.equals(expectedHash);
    }

    /**
     * Encrypt sensitive fields in snapshot data
     */
    public String encryptSnapshotData(String snapshotData) {
        try {
            // Add timestamp and device info for additional security
            String timestamp = String.valueOf(System.currentTimeMillis());
            String dataWithTimestamp = snapshotData + "|" + timestamp;
            
            return encrypt(dataWithTimestamp);
        } catch (Exception e) {
            log.error("Error encrypting snapshot data", e);
            throw new RuntimeException("Snapshot encryption failed", e);
        }
    }

    /**
     * Decrypt snapshot data
     */
    public String decryptSnapshotData(String encryptedSnapshotData) {
        try {
            String decryptedData = decrypt(encryptedSnapshotData);
            
            // Remove timestamp if present
            if (decryptedData.contains("|")) {
                int lastPipeIndex = decryptedData.lastIndexOf("|");
                return decryptedData.substring(0, lastPipeIndex);
            }
            
            return decryptedData;
        } catch (Exception e) {
            log.error("Error decrypting snapshot data", e);
            throw new RuntimeException("Snapshot decryption failed", e);
        }
    }
}

