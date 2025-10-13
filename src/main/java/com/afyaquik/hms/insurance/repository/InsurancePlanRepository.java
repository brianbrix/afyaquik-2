package com.afyaquik.hms.insurance.repository;

import com.afyaquik.hms.insurance.domain.InsurancePlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsurancePlanRepository extends JpaRepository<InsurancePlan, Long> {
}
