package com.afyaquik.hms.patient.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import com.afyaquik.hms.insurance.domain.InsurancePlan;
import com.afyaquik.hms.insurance.domain.InsuranceProvider;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "patient_insurance_details")
@Getter
@Setter
public class PatientInsuranceDetails extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "provider_id")
    private InsuranceProvider provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private InsurancePlan plan;

    private String policyNumber;
    private String coverageType;
    private LocalDate expiryDate;
}
