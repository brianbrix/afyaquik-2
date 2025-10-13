package com.afyaquik.hms.insurance.service;

import com.afyaquik.hms.insurance.domain.InsuranceProvider;
import com.afyaquik.hms.insurance.domain.InsurancePlan;
import com.afyaquik.hms.insurance.dto.InsuranceProviderDto;
import com.afyaquik.hms.insurance.dto.InsurancePlanDto;
import com.afyaquik.hms.insurance.repository.InsuranceProviderRepository;
import com.afyaquik.hms.insurance.repository.InsurancePlanRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InsuranceProviderService {
    private final InsuranceProviderRepository providerRepo;
    private final InsurancePlanRepository planRepo;

    public InsuranceProviderService(InsuranceProviderRepository providerRepo, InsurancePlanRepository planRepo) {
        this.providerRepo = providerRepo;
        this.planRepo = planRepo;
    }

    public List<InsuranceProviderDto> getAllProviders() {
        return providerRepo.findAll().stream().map(this::toDto).toList();
    }

    public Optional<InsuranceProviderDto> getProvider(Long id) {
        return providerRepo.findById(id).map(this::toDto);
    }

    public InsuranceProviderDto createProvider(InsuranceProviderDto dto) {
        InsuranceProvider provider = new InsuranceProvider();
        provider.setName(dto.getName());
        InsuranceProvider saved = providerRepo.save(provider);
        return toDto(saved);
    }

    public Optional<InsuranceProviderDto> updateProvider(Long id, InsuranceProviderDto dto) {
        Optional<InsuranceProvider> opt = providerRepo.findById(id);
        if (opt.isEmpty()) return Optional.empty();
        InsuranceProvider provider = opt.get();
        provider.setName(dto.getName());
        InsuranceProvider saved = providerRepo.save(provider);
        return Optional.of(toDto(saved));
    }

    public boolean deleteProvider(Long id) {
        if (!providerRepo.existsById(id)) return false;
        providerRepo.deleteById(id);
        return true;
    }

    public List<InsurancePlanDto> getPlansByProvider(Long providerId) {
        Optional<InsuranceProvider> provider = providerRepo.findById(providerId);
        return provider.map(p -> p.getPlans().stream().map(this::toPlanDto).toList()).orElse(List.of());
    }

    public Optional<InsurancePlanDto> addPlanToProvider(Long providerId, InsurancePlanDto dto) {
        Optional<InsuranceProvider> providerOpt = providerRepo.findById(providerId);
        if (providerOpt.isEmpty()) return Optional.empty();
        InsurancePlan plan = new InsurancePlan();
        plan.setName(dto.getName());
        plan.setDescription(dto.getDescription());
        plan.setProvider(providerOpt.get());
        InsurancePlan saved = planRepo.save(plan);
        return Optional.of(toPlanDto(saved));
    }

    public Optional<InsurancePlanDto> updatePlan(Long planId, InsurancePlanDto dto) {
        Optional<InsurancePlan> opt = planRepo.findById(planId);
        if (opt.isEmpty()) return Optional.empty();
        InsurancePlan plan = opt.get();
        plan.setName(dto.getName());
        plan.setDescription(dto.getDescription());
        InsurancePlan saved = planRepo.save(plan);
        return Optional.of(toPlanDto(saved));
    }

    public boolean deletePlan(Long planId) {
        if (!planRepo.existsById(planId)) return false;
        planRepo.deleteById(planId);
        return true;
    }

    private InsuranceProviderDto toDto(InsuranceProvider provider) {
        InsuranceProviderDto dto = new InsuranceProviderDto();
        dto.setId(provider.getId());
        dto.setName(provider.getName());
        if (provider.getPlans() != null) {
            dto.setPlans(provider.getPlans().stream().map(this::toPlanDto).toList());
        }
        return dto;
    }

    private InsurancePlanDto toPlanDto(InsurancePlan plan) {
        InsurancePlanDto dto = new InsurancePlanDto();
        dto.setId(plan.getId());
        dto.setName(plan.getName());
        dto.setDescription(plan.getDescription());
        if (plan.getProvider() != null) {
            dto.setProviderId(plan.getProvider().getId());
            dto.setProviderName(plan.getProvider().getName());
        }
        return dto;
    }
}
