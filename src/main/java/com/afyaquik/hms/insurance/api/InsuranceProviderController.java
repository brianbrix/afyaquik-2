package com.afyaquik.hms.insurance.api;

import com.afyaquik.hms.insurance.domain.InsuranceProvider;
import com.afyaquik.hms.insurance.domain.InsurancePlan;
import com.afyaquik.hms.insurance.service.InsuranceProviderService;
import com.afyaquik.hms.insurance.dto.InsuranceProviderDto;
import com.afyaquik.hms.insurance.dto.InsurancePlanDto;
import com.afyaquik.hms.common.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/insurance/providers")
public class InsuranceProviderController {
    private final InsuranceProviderService insuranceService;

    public InsuranceProviderController(InsuranceProviderService insuranceService) {
        this.insuranceService = insuranceService;
    }

    @GetMapping
    public ApiResponse<List<InsuranceProviderDto>> getAllProviders() {
        return ApiResponse.success(insuranceService.getAllProviders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InsuranceProviderDto>> getProvider(@PathVariable Long id) {
        return insuranceService.getProvider(id)
                .map(provider -> ResponseEntity.ok(ApiResponse.success(provider)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Provider not found")));
    }

    @PostMapping
    public ApiResponse<InsuranceProviderDto> createProvider(@RequestBody InsuranceProviderDto provider) {
        return ApiResponse.success(insuranceService.createProvider(provider));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InsuranceProviderDto>> updateProvider(@PathVariable Long id, @RequestBody InsuranceProviderDto provider) {
        return insuranceService.updateProvider(id, provider)
                .map(updated -> ResponseEntity.ok(ApiResponse.success(updated)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Provider not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProvider(@PathVariable Long id) {
        boolean deleted = insuranceService.deleteProvider(id);
        if (deleted) return ResponseEntity.ok(ApiResponse.success(null));
        return ResponseEntity.status(404).body(ApiResponse.error("Provider not found"));
    }

    // --- Insurance Plans ---
    @GetMapping("/{providerId}/plans")
    public ApiResponse<List<InsurancePlanDto>> getPlansByProvider(@PathVariable Long providerId) {
        return ApiResponse.success(insuranceService.getPlansByProvider(providerId));
    }

    @PostMapping("/{providerId}/plans")
    public ResponseEntity<ApiResponse<InsurancePlanDto>> addPlanToProvider(@PathVariable Long providerId, @RequestBody InsurancePlanDto plan) {
        return insuranceService.addPlanToProvider(providerId, plan)
                .map(saved -> ResponseEntity.ok(ApiResponse.success(saved)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Provider not found")));
    }

    @PutMapping("/plans/{planId}")
    public ResponseEntity<ApiResponse<InsurancePlanDto>> updatePlan(@PathVariable Long planId, @RequestBody InsurancePlanDto plan) {
        return insuranceService.updatePlan(planId, plan)
                .map(updated -> ResponseEntity.ok(ApiResponse.success(updated)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Plan not found")));
    }

    @DeleteMapping("/plans/{planId}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable Long planId) {
        boolean deleted = insuranceService.deletePlan(planId);
        if (deleted) return ResponseEntity.ok(ApiResponse.success(null));
        return ResponseEntity.status(404).body(ApiResponse.error("Plan not found"));
    }
}
