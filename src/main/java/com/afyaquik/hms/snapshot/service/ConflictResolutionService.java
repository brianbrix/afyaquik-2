package com.afyaquik.hms.snapshot.service;

import com.afyaquik.hms.snapshot.domain.ConflictResolution;
import com.afyaquik.hms.snapshot.domain.ConflictType;
import com.afyaquik.hms.snapshot.domain.ConflictStatus;
import com.afyaquik.hms.snapshot.repository.ConflictResolutionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ConflictResolutionService {

    private static final Logger log = LoggerFactory.getLogger(ConflictResolutionService.class);

    @Autowired
    private ConflictResolutionRepository conflictResolutionRepository;

    /**
     * Create a new conflict
     */
    public ConflictResolution createConflict(String tenantId, String entityType, String entityId, 
                                           String deviceId, Object localData, Object serverData, 
                                           String conflictReason) {
        log.info("Creating conflict for entity {}:{} by device {} in tenant {}", 
                entityType, entityId, deviceId, tenantId);

        ConflictResolution conflict = new ConflictResolution();
        conflict.setId(UUID.randomUUID().toString());
        conflict.setTenantId(tenantId);
        conflict.setEntityType(entityType);
        conflict.setEntityId(entityId);
        conflict.setDeviceId(deviceId);
        conflict.setConflictType(ConflictType.DATA_CONFLICT);
        conflict.setStatus(ConflictStatus.PENDING);
        conflict.setLocalData(localData.toString());
        conflict.setServerData(serverData.toString());
        conflict.setConflictReason(conflictReason);
        conflict.setCreatedAt(LocalDateTime.now());
        conflict.setUpdatedAt(LocalDateTime.now());

        return conflictResolutionRepository.save(conflict);
    }

    /**
     * Resolve a conflict
     */
    public ConflictResolution resolveConflict(String conflictId, String resolution, 
                                            String resolvedByDeviceId, String resolvedBy) {
        log.info("Resolving conflict {} by device {}", conflictId, resolvedByDeviceId);

        Optional<ConflictResolution> conflictOpt = conflictResolutionRepository.findById(conflictId);
        if (conflictOpt.isEmpty()) {
            throw new IllegalArgumentException("Conflict not found: " + conflictId);
        }

        ConflictResolution conflict = conflictOpt.get();
        conflict.setStatus(ConflictStatus.RESOLVED);
        conflict.setResolution(resolution);
        conflict.setResolvedByDeviceId(resolvedByDeviceId);
        conflict.setResolvedBy(resolvedBy);
        conflict.setResolvedAt(LocalDateTime.now());
        conflict.setUpdatedAt(LocalDateTime.now());

        return conflictResolutionRepository.save(conflict);
    }

    /**
     * Get conflicts for a device
     */
    public List<ConflictResolution> getConflictsForDevice(String tenantId, String deviceId) {
        return conflictResolutionRepository.findByTenantIdAndDeviceIdAndStatusOrderByCreatedAtDesc(
                tenantId, deviceId, ConflictStatus.PENDING);
    }

    /**
     * Get all pending conflicts for a tenant
     */
    public List<ConflictResolution> getPendingConflicts(String tenantId) {
        return conflictResolutionRepository.findByTenantIdAndStatusOrderByCreatedAtDesc(
                tenantId, ConflictStatus.PENDING);
    }

    /**
     * Get conflict by ID
     */
    public Optional<ConflictResolution> getConflictById(String conflictId) {
        return conflictResolutionRepository.findById(conflictId);
    }

    /**
     * Auto-resolve simple conflicts
     */
    public ConflictResolution autoResolveConflict(String conflictId, String autoResolution) {
        log.info("Auto-resolving conflict {}", conflictId);

        Optional<ConflictResolution> conflictOpt = conflictResolutionRepository.findById(conflictId);
        if (conflictOpt.isEmpty()) {
            throw new IllegalArgumentException("Conflict not found: " + conflictId);
        }

        ConflictResolution conflict = conflictOpt.get();
        conflict.setStatus(ConflictStatus.AUTO_RESOLVED);
        conflict.setResolution(autoResolution);
        conflict.setResolvedBy("SYSTEM");
        conflict.setResolvedAt(LocalDateTime.now());
        conflict.setUpdatedAt(LocalDateTime.now());

        return conflictResolutionRepository.save(conflict);
    }

    /**
     * Get conflict statistics
     */
    public ConflictStatistics getConflictStatistics(String tenantId) {
        long totalConflicts = conflictResolutionRepository.countByTenantId(tenantId);
        long pendingConflicts = conflictResolutionRepository.countByTenantIdAndStatus(tenantId, ConflictStatus.PENDING);
        long resolvedConflicts = conflictResolutionRepository.countByTenantIdAndStatus(tenantId, ConflictStatus.RESOLVED);
        long autoResolvedConflicts = conflictResolutionRepository.countByTenantIdAndStatus(tenantId, ConflictStatus.AUTO_RESOLVED);

        return new ConflictStatistics(totalConflicts, pendingConflicts, resolvedConflicts, autoResolvedConflicts);
    }

    /**
     * Clean up old resolved conflicts
     */
    public void cleanupOldConflicts(String tenantId, int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        List<ConflictResolution> oldConflicts = conflictResolutionRepository
                .findByTenantIdAndStatusAndResolvedAtBefore(tenantId, ConflictStatus.RESOLVED, cutoffDate);
        
        conflictResolutionRepository.deleteAll(oldConflicts);
        log.info("Cleaned up {} old resolved conflicts for tenant {}", oldConflicts.size(), tenantId);
    }

    /**
     * Conflict statistics class
     */
    public static class ConflictStatistics {
        private final long totalConflicts;
        private final long pendingConflicts;
        private final long resolvedConflicts;
        private final long autoResolvedConflicts;

        public ConflictStatistics(long totalConflicts, long pendingConflicts, 
                               long resolvedConflicts, long autoResolvedConflicts) {
            this.totalConflicts = totalConflicts;
            this.pendingConflicts = pendingConflicts;
            this.resolvedConflicts = resolvedConflicts;
            this.autoResolvedConflicts = autoResolvedConflicts;
        }

        // Getters
        public long getTotalConflicts() { return totalConflicts; }
        public long getPendingConflicts() { return pendingConflicts; }
        public long getResolvedConflicts() { return resolvedConflicts; }
        public long getAutoResolvedConflicts() { return autoResolvedConflicts; }
    }
}

