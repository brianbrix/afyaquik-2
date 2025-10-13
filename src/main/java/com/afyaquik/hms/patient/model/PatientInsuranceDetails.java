package com.afyaquik.hms.patient.model;

import com.afyaquik.hms.insurance.domain.InsurancePlan;
import com.afyaquik.hms.insurance.domain.InsuranceProvider;
import com.afyaquik.hms.patient.domain.Patient;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter
@Setter
public class PatientInsuranceDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
