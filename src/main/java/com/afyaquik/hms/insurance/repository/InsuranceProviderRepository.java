package com.afyaquik.hms.insurance.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.insurance.domain.InsuranceProvider;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsuranceProviderRepository extends TenantAwareRepository<InsuranceProvider, Long> {
}
