# Tenant-Aware Repository Migration Guide

This guide shows how to migrate existing repositories to use the new `TenantAwareRepository` base interface, ensuring all repository methods are automatically tenant-aware.

## Overview

The `TenantAwareRepository` interface provides:
- Automatic tenant context filtering
- No need to pass `tenantId` explicitly
- Consistent tenant isolation across all repositories
- Default implementations for common operations

## Migration Steps

### 1. Update Repository Interface

**Before:**
```java
public interface StaffUserRepository extends JpaRepository<StaffUser, Long> {
    Optional<StaffUser> findByUsernameAndDeletedFalse(String username);
    List<StaffUser> findByTenantId(String tenantId);
    // ... other methods
}
```

**After:**
```java
public interface StaffUserRepository extends TenantAwareRepository<StaffUser, Long> {
    // Tenant-aware methods are now available automatically:
    // - findAllForCurrentTenant()
    // - findByIdForCurrentTenant(Long id)
    // - existsByIdForCurrentTenant(Long id)
    // - countForCurrentTenant()
    // - deleteByIdForCurrentTenant(Long id)
    // - deleteAllForCurrentTenant()
    
    // Keep existing tenant-aware methods
    List<StaffUser> findByTenantId(String tenantId);
    
    // Remove non-tenant-aware methods
    // Optional<StaffUser> findByUsernameAndDeletedFalse(String username); // REMOVE
    
    // Add tenant-aware versions
    default Optional<StaffUser> findByUsernameForCurrentTenant(String username) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndUsername(tenantId, username);
    }
}
```

### 2. Update Service Layer

**Before:**
```java
@Service
public class StaffUserService {
    
    public Optional<StaffUser> getStaffUserById(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return staffUserRepository.findById(id)
            .filter(user -> tenantId.equals(user.getTenantId()));
    }
    
    public List<StaffUser> getAllStaffUsers() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return staffUserRepository.findByTenantId(tenantId);
    }
}
```

**After:**
```java
@Service
public class StaffUserService {
    
    public Optional<StaffUser> getStaffUserById(Long id) {
        // No need to pass tenantId - it's handled automatically!
        return staffUserRepository.findByIdForCurrentTenant(id);
    }
    
    public List<StaffUser> getAllStaffUsers() {
        // No need to pass tenantId - it's handled automatically!
        return staffUserRepository.findAllForCurrentTenant();
    }
}
```

### 3. Update Entity Classes

Ensure all entities implement `TenantAwareEntity`:

```java
@Entity
@Table(name = "staff_users")
public class StaffUser extends BaseEntity implements TenantAwareEntity {
    
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
    
    // ... other fields
    
    @Override
    public String getTenantId() {
        return tenantId;
    }
    
    @Override
    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
}
```

## Available Tenant-Aware Methods

### Basic CRUD Operations
```java
// Find all entities for current tenant
List<T> findAllForCurrentTenant()

// Find entity by ID for current tenant
Optional<T> findByIdForCurrentTenant(ID id)

// Check if entity exists for current tenant
boolean existsByIdForCurrentTenant(ID id)

// Count entities for current tenant
long countForCurrentTenant()

// Delete entity for current tenant
void deleteByIdForCurrentTenant(ID id)

// Delete all entities for current tenant
void deleteAllForCurrentTenant()
```

### Custom Tenant-Aware Methods
```java
// Create default methods for existing repository methods
default Optional<StaffUser> findByUsernameForCurrentTenant(String username) {
    String tenantId = TenantHeaderInterceptor.getCurrentTenant();
    return findByTenantIdAndUsername(tenantId, username);
}

default List<StaffUser> findByStatusForCurrentTenant(String status) {
    String tenantId = TenantHeaderInterceptor.getCurrentTenant();
    return findByTenantIdAndStatus(tenantId, status);
}
```

## Benefits

### 1. Automatic Tenant Isolation
- All repository methods are tenant-aware by default
- No risk of cross-tenant data access
- Consistent tenant filtering across the application

### 2. Cleaner Service Code
- No need to pass `tenantId` explicitly
- No need to filter results by tenant
- Reduced boilerplate code

### 3. Type Safety
- Compile-time enforcement of tenant context
- Clear indication of tenant-aware methods
- Consistent API across all repositories

### 4. Performance
- Tenant filtering at database level
- Optimized queries with tenant context
- Reduced data transfer

## Configuration

The tenant-aware repository is automatically configured via:

```java
@Configuration
@EnableJpaRepositories(
    basePackages = "com.afyaquik.hms",
    repositoryFactoryBeanClass = TenantAwareRepositoryConfig.TenantAwareRepositoryFactoryBean.class
)
public class TenantAwareRepositoryConfig {
    // Configuration is handled automatically
}
```

## Migration Checklist

- [ ] Update repository interfaces to extend `TenantAwareRepository`
- [ ] Remove non-tenant-aware methods from repositories
- [ ] Add tenant-aware default methods for existing functionality
- [ ] Update service layer to use tenant-aware methods
- [ ] Ensure all entities implement `TenantAwareEntity`
- [ ] Test all repository operations
- [ ] Verify tenant isolation is working correctly

## Example Migration

See the example files:
- `StaffUserRepositoryExample.java` - Updated repository interface
- `StaffUserServiceExample.java` - Updated service layer
- `TenantAwareRepository.java` - Base repository interface
- `TenantAwareRepositoryImpl.java` - Base implementation
