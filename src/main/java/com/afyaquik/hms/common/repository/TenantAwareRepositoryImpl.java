package com.afyaquik.hms.common.repository;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.data.jpa.repository.support.JpaEntityInformation;
import org.springframework.data.jpa.repository.support.JpaEntityInformationSupport;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.io.Serializable;
import java.util.List;
import java.util.Optional;

/**
 * Base implementation for tenant-aware repositories.
 * Provides default implementations for tenant-aware methods.
 */
public class TenantAwareRepositoryImpl<T, ID extends Serializable> extends SimpleJpaRepository<T, ID> 
        implements TenantAwareRepository<T, ID> {
    
    private final EntityManager entityManager;
    private final JpaEntityInformation<T, ?> entityInformation;
    
    public TenantAwareRepositoryImpl(JpaEntityInformation<T, ?> entityInformation, EntityManager entityManager) {
        super(entityInformation, entityManager);
        this.entityInformation = entityInformation;
        this.entityManager = entityManager;
    }
    
    public TenantAwareRepositoryImpl(Class<T> domainClass, EntityManager entityManager) {
        super(domainClass, entityManager);
        this.entityInformation = JpaEntityInformationSupport.getEntityInformation(domainClass, entityManager);
        this.entityManager = entityManager;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<T> findAllByTenantId(String tenantId) {
        return entityManager.createQuery(
            "SELECT e FROM " + entityInformation.getJavaType().getSimpleName() + " e WHERE e.tenantId = :tenantId", 
            (Class<T>) entityInformation.getJavaType()
        )
        .setParameter("tenantId", tenantId)
        .getResultList();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<T> findByIdAndTenantId(ID id, String tenantId) {
        return entityManager.createQuery(
            "SELECT e FROM " + entityInformation.getJavaType().getSimpleName() + " e WHERE e.id = :id AND e.tenantId = :tenantId", 
            (Class<T>) entityInformation.getJavaType()
        )
        .setParameter("id", id)
        .setParameter("tenantId", tenantId)
        .getResultStream()
        .findFirst();
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByIdAndTenantId(ID id, String tenantId) {
        Long count = entityManager.createQuery(
            "SELECT COUNT(e) FROM " + entityInformation.getJavaType().getSimpleName() + " e WHERE e.id = :id AND e.tenantId = :tenantId", 
            Long.class
        )
        .setParameter("id", id)
        .setParameter("tenantId", tenantId)
        .getSingleResult();
        return count > 0;
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countByTenantId(String tenantId) {
        return entityManager.createQuery(
            "SELECT COUNT(e) FROM " + entityInformation.getJavaType().getSimpleName() + " e WHERE e.tenantId = :tenantId", 
            Long.class
        )
        .setParameter("tenantId", tenantId)
        .getSingleResult();
    }
    
    @Override
    @Transactional
    public void deleteByIdAndTenantId(ID id, String tenantId) {
        entityManager.createQuery(
            "DELETE FROM " + entityInformation.getJavaType().getSimpleName() + " e WHERE e.id = :id AND e.tenantId = :tenantId"
        )
        .setParameter("id", id)
        .setParameter("tenantId", tenantId)
        .executeUpdate();
    }
    
    @Override
    @Transactional
    public void deleteAllByTenantId(String tenantId) {
        entityManager.createQuery(
            "DELETE FROM " + entityInformation.getJavaType().getSimpleName() + " e WHERE e.tenantId = :tenantId"
        )
        .setParameter("tenantId", tenantId)
        .executeUpdate();
    }
}
