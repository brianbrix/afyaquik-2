package com.afyaquik.hms.triage.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.triage.domain.TriageTitle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TriageTitleRepository extends TenantAwareRepository<TriageTitle, Long> {
    boolean existsByTitle(String title);
    boolean existsByTitleAndTenantId(String title, String tenantId);
}
