package com.afyaquik.hms.insurance.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.insurance.domain.InsurancePlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsurancePlanRepository extends TenantAwareRepository<InsurancePlan, Long> {
}
