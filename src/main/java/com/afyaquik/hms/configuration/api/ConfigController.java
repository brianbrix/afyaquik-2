package com.afyaquik.hms.configuration.api;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderResolver;
import com.afyaquik.hms.configuration.domain.FeatureFlag;
import com.afyaquik.hms.configuration.domain.FormDefinition;
import com.afyaquik.hms.configuration.domain.TenantTheme;
import com.afyaquik.hms.configuration.service.FeatureFlagService;
import com.afyaquik.hms.configuration.service.FormDefinitionService;
import com.afyaquik.hms.configuration.service.TenantThemeService;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/config")
@Validated
public class ConfigController {

    private final FeatureFlagService featureFlagService;
    private final FormDefinitionService formService;
    private final TenantThemeService themeService;

    public ConfigController(FeatureFlagService featureFlagService, FormDefinitionService formService, TenantThemeService themeService) {
        this.featureFlagService = featureFlagService;
        this.formService = formService;
        this.themeService = themeService;
    }

    // ----- Feature Flags -----
    @GetMapping("/features")
    public ApiResponse<List<FeatureFlag>> listFeatures(@RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(featureFlagService.list(tenantId));
    }

    @PostMapping("/features/{key}")
    public ApiResponse<FeatureFlag> upsertFeature(@RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
                                                  @PathVariable("key") String key,
                                                  @RequestParam("enabled") boolean enabled,
                                                  @RequestParam(value = "description", required = false) String description) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(featureFlagService.upsert(tenantId, key, enabled, description));
    }

    // ----- Form Definitions -----
    @GetMapping("/forms/{formKey}")
    public ApiResponse<FormDefinition> getLatestForm(@RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
                                                      @PathVariable("formKey") String formKey) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return formService.getLatest(tenantId, formKey)
                .map(ApiResponse::success)
                .orElse(ApiResponse.error("Form not found"));
    }

    record FormDefinitionRequest(@NotBlank String schemaJson) {}

    @PostMapping(value = "/forms/{formKey}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<FormDefinition> newFormVersion(@RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
                                                       @PathVariable("formKey") String formKey,
                                                       @RequestBody FormDefinitionRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(formService.saveNewVersion(tenantId, formKey, request.schemaJson()));
    }

    // ----- Tenant Theme -----
    @GetMapping("/theme")
    public ApiResponse<TenantTheme> getTheme(@RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return themeService.get(tenantId)
                .map(ApiResponse::success)
                .orElseGet(() -> {
                    // Provide a sensible default theme so public (unauthenticated) login page can style immediately
                    TenantTheme defaultTheme = new TenantTheme();
                    defaultTheme.setTenantId(tenantId);
                    defaultTheme.setPrimaryColor("#0d9488"); // teal-ish default
                    defaultTheme.setLogoUrl("/static/logo-default.svg");
                    defaultTheme.setUpdatedBy("system");
                    return ApiResponse.success(defaultTheme, Map.of("default", true));
                });
    }

    record ThemeUpdateRequest(String primaryColor, String logoUrl, String updatedBy) {}

    @PostMapping("/theme")
    public ApiResponse<TenantTheme> updateTheme(@RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
                                                @RequestBody ThemeUpdateRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(themeService.update(tenantId, request.primaryColor(), request.logoUrl(), request.updatedBy()));
    }
}
