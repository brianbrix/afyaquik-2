package com.afyaquik.hms.common.util;

import com.afyaquik.hms.common.domain.BaseEntity;
import org.springframework.stereotype.Component;

/**
 * Helper utility for managing entity versioning and optimistic locking.
 * This utility provides methods to handle version conflicts and provide
 * meaningful error messages for version-related operations.
 */
@Component
public class VersionHelper {

    /**
     * Check if two entities have the same version number.
     * Useful for optimistic locking validation.
     * 
     * @param entity1 First entity to compare
     * @param entity2 Second entity to compare
     * @return true if versions match, false otherwise
     */
    public static boolean hasSameVersion(BaseEntity entity1, BaseEntity entity2) {
        if (entity1 == null || entity2 == null) {
            return false;
        }
        return entity1.getVersion().equals(entity2.getVersion());
    }

    /**
     * Check if an entity's version is newer than another.
     * 
     * @param entity1 First entity to compare
     * @param entity2 Second entity to compare
     * @return true if entity1 has a higher version than entity2
     */
    public static boolean isNewerVersion(BaseEntity entity1, BaseEntity entity2) {
        if (entity1 == null || entity2 == null) {
            return false;
        }
        return entity1.getVersion() > entity2.getVersion();
    }

    /**
     * Generate a user-friendly error message for version conflicts.
     * 
     * @param entityName The name of the entity type
     * @param entityId The ID of the entity
     * @param currentVersion The current version in the database
     * @param providedVersion The version provided in the request
     * @return A formatted error message
     */
    public static String getVersionConflictMessage(String entityName, Long entityId, 
                                                  Long currentVersion, Long providedVersion) {
        return String.format(
            "Version conflict for %s (ID: %d). Current version: %d, Provided version: %d. " +
            "The entity has been modified by another user. Please refresh and try again.",
            entityName, entityId, currentVersion, providedVersion
        );
    }

    /**
     * Generate a user-friendly error message for optimistic locking failures.
     * 
     * @param entityName The name of the entity type
     * @param entityId The ID of the entity
     * @return A formatted error message
     */
    public static String getOptimisticLockingMessage(String entityName, Long entityId) {
        return String.format(
            "Optimistic locking failed for %s (ID: %d). " +
            "The entity has been modified by another user. Please refresh and try again.",
            entityName, entityId
        );
    }

    /**
     * Validate that a version number is valid (positive).
     * 
     * @param version The version number to validate
     * @return true if version is valid, false otherwise
     */
    public static boolean isValidVersion(Long version) {
        return version != null && version > 0;
    }

    /**
     * Get the next expected version number for an entity.
     * 
     * @param currentVersion The current version number
     * @return The next expected version number
     */
    public static Long getNextExpectedVersion(Long currentVersion) {
        return currentVersion + 1;
    }

    /**
     * Check if a version number represents a new entity (version 1).
     * 
     * @param version The version number to check
     * @return true if this is a new entity, false otherwise
     */
    public static boolean isNewEntity(Long version) {
        return version != null && version == 1L;
    }

    /**
     * Get a summary of version information for logging purposes.
     * 
     * @param entity The entity to get version info for
     * @return A formatted string with version information
     */
    public static String getVersionSummary(BaseEntity entity) {
        if (entity == null) {
            return "Entity: null";
        }
        return String.format("Entity: %s (ID: %d, Version: %d, Created: %s, Updated: %s)",
            entity.getClass().getSimpleName(),
            entity.getId(),
            entity.getVersion(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
