package com.afyaquik.hms.insurance.repository;

import com.afyaquik.hms.insurance.domain.InsuranceProvider;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsuranceProviderRepository extends JpaRepository<InsuranceProvider, Long> {
}
