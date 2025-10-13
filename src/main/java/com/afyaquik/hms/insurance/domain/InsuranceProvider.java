package com.afyaquik.hms.insurance.domain;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "insurance_providers")
public class InsuranceProvider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 128)
    private String name;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<InsurancePlan> plans;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Set<InsurancePlan> getPlans() { return plans; }
    public void setPlans(Set<InsurancePlan> plans) { this.plans = plans; }
}
