package com.afyaquik.hms.auth.repository;

import com.afyaquik.hms.auth.domain.StaffUser;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffUserRepository extends JpaRepository<StaffUser, Long> {

    @EntityGraph(attributePaths = "roles")
    Optional<StaffUser> findByTenantIdAndUsername(String tenantId, String username);

    @EntityGraph(attributePaths = "roles")
    List<StaffUser> findByTenantId(String tenantId);
    @Query("SELECT u FROM StaffUser u LEFT JOIN FETCH u.departments WHERE u.tenantId = :tenantId")
    List<StaffUser> findByTenantIdWithDepartments(@Param("tenantId") String tenantId);
}
