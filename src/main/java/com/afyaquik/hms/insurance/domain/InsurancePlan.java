package com.afyaquik.hms.insurance.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "insurance_plans")
public class InsurancePlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 128)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "provider_id", nullable = false)
    private InsuranceProvider provider;

    @Column(length = 255)
    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public InsuranceProvider getProvider() { return provider; }
    public void setProvider(InsuranceProvider provider) { this.provider = provider; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
