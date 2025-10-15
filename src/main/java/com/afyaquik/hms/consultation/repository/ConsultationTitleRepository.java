package com.afyaquik.hms.consultation.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.consultation.domain.ConsultationTitle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConsultationTitleRepository extends TenantAwareRepository<ConsultationTitle, Long> {
    boolean existsByTitle(String title);

    /**
     * Find all root level titles (level 1, no parent).
     */
    @Query("SELECT ct FROM ConsultationTitle ct WHERE ct.tenantId = :tenantId AND ct.parent IS NULL AND ct.deleted = false ORDER BY ct.sortOrder ASC, ct.title ASC")
    List<ConsultationTitle> findRootTitles(@Param("tenantId") String tenantId);

    /**
     * Find children of a specific parent.
     */
    @Query("SELECT ct FROM ConsultationTitle ct WHERE ct.tenantId = :tenantId AND ct.parent.id = :parentId AND ct.deleted = false ORDER BY ct.sortOrder ASC, ct.title ASC")
    List<ConsultationTitle> findByParentId(@Param("tenantId") String tenantId, @Param("parentId") Long parentId);

    /**
     * Find titles by level.
     */
    @Query("SELECT ct FROM ConsultationTitle ct WHERE ct.tenantId = :tenantId AND ct.level = :level AND ct.deleted = false ORDER BY ct.sortOrder ASC, ct.title ASC")
    List<ConsultationTitle> findByLevel(@Param("tenantId") String tenantId, @Param("level") Integer level);

    /**
     * Find all titles in hierarchical structure.
     */
    @Query("SELECT ct FROM ConsultationTitle ct WHERE ct.tenantId = :tenantId AND ct.deleted = false ORDER BY ct.level ASC, ct.sortOrder ASC, ct.title ASC")
    List<ConsultationTitle> findAllHierarchical(@Param("tenantId") String tenantId);

    /**
     * Find titles that can have children (not level 3).
     */
    @Query("SELECT ct FROM ConsultationTitle ct WHERE ct.tenantId = :tenantId AND ct.level < 3 AND ct.deleted = false ORDER BY ct.level ASC, ct.sortOrder ASC, ct.title ASC")
    List<ConsultationTitle> findParentCandidates(@Param("tenantId") String tenantId);

    /**
     * Check if title exists with same parent and level.
     */
    @Query("SELECT COUNT(ct) > 0 FROM ConsultationTitle ct WHERE ct.tenantId = :tenantId AND ct.title = :title AND ct.parent.id = :parentId AND ct.deleted = false")
    boolean existsByTitleAndParent(@Param("tenantId") String tenantId, @Param("title") String title, @Param("parentId") Long parentId);

    /**
     * Find by title and parent for uniqueness check.
     */
    @Query("SELECT ct FROM ConsultationTitle ct WHERE ct.tenantId = :tenantId AND ct.title = :title AND ct.parent.id = :parentId AND ct.deleted = false")
    Optional<ConsultationTitle> findByTitleAndParent(@Param("tenantId") String tenantId, @Param("title") String title, @Param("parentId") Long parentId);
}
