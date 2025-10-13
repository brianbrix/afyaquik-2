package com.afyaquik.hms.insurance.dto;

import java.util.List;

public class InsuranceProviderDto {
    private Long id;
    private String name;
    private List<InsurancePlanDto> plans;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<InsurancePlanDto> getPlans() { return plans; }
    public void setPlans(List<InsurancePlanDto> plans) { this.plans = plans; }
}
