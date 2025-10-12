package com.afyaquik.hms.configuration.api;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.configuration.domain.FeatureFlag;
import com.afyaquik.hms.configuration.domain.FormDefinition;
import com.afyaquik.hms.configuration.domain.TenantTheme;
import com.afyaquik.hms.configuration.domain.RoleRedirectUrl;
import com.afyaquik.hms.configuration.service.FeatureFlagService;
import com.afyaquik.hms.configuration.service.FormDefinitionService;
import com.afyaquik.hms.configuration.service.TenantThemeService;
import com.afyaquik.hms.configuration.service.RoleRedirectUrlService;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/config")
@Validated
public class ConfigController {

    private final FeatureFlagService featureFlagService;
    private final FormDefinitionService formService;
    private final TenantThemeService themeService;
    private final RoleRedirectUrlService roleRedirectUrlService;

    public ConfigController(FeatureFlagService featureFlagService, FormDefinitionService formService, TenantThemeService themeService, RoleRedirectUrlService roleRedirectUrlService) {
        this.featureFlagService = featureFlagService;
        this.formService = formService;
        this.themeService = themeService;
        this.roleRedirectUrlService = roleRedirectUrlService;
    }
    // ----- Role Redirect URLs -----
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/role-redirects")
    public ApiResponse<List<RoleRedirectUrl>> listRoleRedirects() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(roleRedirectUrlService.getAllForTenant(tenantId));
    }

    @GetMapping("/role-redirects/{roleKey}")
    public ApiResponse<RoleRedirectUrl> getRoleRedirect(@PathVariable("roleKey") String roleKey) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return roleRedirectUrlService.getByTenantAndRole(tenantId, roleKey)
                .map(ApiResponse::success)
                .orElse(ApiResponse.error("Role redirect not found"));
    }

    record RoleRedirectUrlRequest(@NotBlank String roleKey, @NotBlank String redirectUrl) {}

    @PostMapping(value = "/role-redirects", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<RoleRedirectUrl> upsertRoleRedirect(@RequestBody RoleRedirectUrlRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        RoleRedirectUrl saved = roleRedirectUrlService.saveOrUpdate(tenantId, request.roleKey(), request.redirectUrl());
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/role-redirects/{roleKey}")
    public ApiResponse<Void> deleteRoleRedirect(@PathVariable("roleKey") String roleKey) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        roleRedirectUrlService.delete(tenantId, roleKey);
        return ApiResponse.success(null);
    }

    // ----- Feature Flags -----
    @GetMapping("/features")
    public ApiResponse<List<FeatureFlag>> listFeatures() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(featureFlagService.list(tenantId));
    }

    @PostMapping("/features/{key}")
    public ApiResponse<FeatureFlag> upsertFeature(@PathVariable("key") String key,
                                                  @RequestParam("enabled") boolean enabled,
                                                  @RequestParam(value = "description", required = false) String description) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(featureFlagService.upsert(tenantId, key, enabled, description));
    }

    // ----- Form Definitions -----
    @GetMapping("/forms/{formKey}")
    public ApiResponse<FormDefinition> getLatestForm(@PathVariable("formKey") String formKey) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return formService.getLatest(tenantId, formKey)
                .map(ApiResponse::success)
                .orElse(ApiResponse.error("Form not found"));
    }

    record FormDefinitionRequest(@NotBlank String schemaJson) {}

    @PostMapping(value = "/forms/{formKey}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<FormDefinition> newFormVersion(@PathVariable("formKey") String formKey,
                                                     @RequestBody FormDefinitionRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(formService.saveNewVersion(tenantId, formKey, request.schemaJson()));
    }

    // ----- Tenant Theme -----
    @GetMapping("/theme")
    public ApiResponse<TenantTheme> getTheme() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
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
    public ApiResponse<TenantTheme> updateTheme(@RequestBody ThemeUpdateRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(themeService.update(tenantId, request.primaryColor(), request.logoUrl(), request.updatedBy()));
    }
}
