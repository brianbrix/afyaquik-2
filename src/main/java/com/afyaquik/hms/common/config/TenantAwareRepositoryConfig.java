package com.afyaquik.hms.common.config;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.repository.TenantAwareRepositoryImpl;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.jpa.repository.support.JpaEntityInformation;
import org.springframework.data.jpa.repository.support.JpaEntityInformationSupport;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactoryBean;
import org.springframework.data.jpa.repository.support.JpaRepositoryImplementation;
import org.springframework.data.repository.core.RepositoryInformation;
import org.springframework.data.repository.core.RepositoryMetadata;
import org.springframework.data.repository.core.support.RepositoryFactorySupport;

import jakarta.persistence.EntityManager;
import java.io.Serializable;

/**
 * Configuration for tenant-aware repositories.
 * This enables automatic tenant context filtering for all repositories.
 */
@Configuration
@EnableJpaRepositories(
    basePackages = "com.afyaquik.hms",
    repositoryFactoryBeanClass = TenantAwareRepositoryConfig.TenantAwareRepositoryFactoryBean.class
)
public class TenantAwareRepositoryConfig {
    
    /**
     * Custom repository factory bean that creates tenant-aware repositories.
     */
    public static class TenantAwareRepositoryFactoryBean<R extends TenantAwareRepository<T, ID>, T, ID extends Serializable>
            extends JpaRepositoryFactoryBean<R, T, ID> {
        
        public TenantAwareRepositoryFactoryBean(Class<? extends R> repositoryInterface) {
            super(repositoryInterface);
        }
        
        @Override
        protected RepositoryFactorySupport createRepositoryFactory(EntityManager entityManager) {
            return new TenantAwareRepositoryFactory(entityManager);
        }
    }
    
    /**
     * Custom repository factory that creates tenant-aware repository implementations.
     */
    private static class TenantAwareRepositoryFactory extends JpaRepositoryFactory {
        
        public TenantAwareRepositoryFactory(EntityManager entityManager) {
            super(entityManager);
        }
        
        @Override
        protected JpaRepositoryImplementation<?, ?> getTargetRepository(RepositoryInformation information, EntityManager entityManager) {
            JpaEntityInformation<?, ?> entityInformation = JpaEntityInformationSupport.getEntityInformation(information.getDomainType(), entityManager);
            Object repository = getTargetRepositoryViaReflection(information, entityInformation, entityManager);
            return (JpaRepositoryImplementation<?, ?>) repository;
        }
        
        @Override
        protected Class<?> getRepositoryBaseClass(RepositoryMetadata metadata) {
            if (TenantAwareRepository.class.isAssignableFrom(metadata.getRepositoryInterface())) {
                return TenantAwareRepositoryImpl.class;
            }
            return super.getRepositoryBaseClass(metadata);
        }
    }
}
