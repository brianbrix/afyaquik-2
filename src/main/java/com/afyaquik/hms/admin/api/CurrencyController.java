package com.afyaquik.hms.admin.api;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.admin.dto.CurrencyDto;
import com.afyaquik.hms.admin.dto.CurrencyRequest;
import com.afyaquik.hms.admin.service.CurrencyService;
import com.afyaquik.hms.common.web.ApiResponse;

import jakarta.validation.Valid;

/**
 * Controller for managing currencies.
 */
@RestController
@RequestMapping("/api/v1/admin/currencies")
public class CurrencyController {
    private static final Logger log = LoggerFactory.getLogger(CurrencyController.class);

    @Autowired
    private CurrencyService currencyService;

    /**
     * Get all active currencies.
     */
    @GetMapping("/active")
    @PreAuthorize("hasPermission(null, 'VIEW_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<List<CurrencyDto>>> getActiveCurrencies() {
        log.info("Getting all active currencies");
        List<CurrencyDto> currencies = currencyService.getAllActiveCurrencies();
        return ResponseEntity.ok(ApiResponse.success(currencies));
    }

    /**
     * Get all currencies (including inactive).
     */
    @GetMapping
    @PreAuthorize("hasPermission(null, 'VIEW_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<List<CurrencyDto>>> getAllCurrencies() {
        log.info("Getting all currencies");
        List<CurrencyDto> currencies = currencyService.getAllCurrencies();
        return ResponseEntity.ok(ApiResponse.success(currencies));
    }

    /**
     * Get the default currency.
     */
    @GetMapping("/default")
    @PreAuthorize("hasPermission(null, 'VIEW_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<CurrencyDto>> getDefaultCurrency() {
        log.info("Getting default currency");
        CurrencyDto currency = currencyService.getDefaultCurrency();
        return ResponseEntity.ok(ApiResponse.success(currency));
    }

    /**
     * Get currency by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission(null, 'VIEW_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<CurrencyDto>> getCurrencyById(@PathVariable Long id) {
        log.info("Getting currency by ID: {}", id);
        CurrencyDto currency = currencyService.getCurrencyById(id);
        return ResponseEntity.ok(ApiResponse.success(currency));
    }

    /**
     * Create a new currency.
     */
    @PostMapping
    @PreAuthorize("hasPermission(null, 'MANAGE_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<CurrencyDto>> createCurrency(@Valid @RequestBody CurrencyRequest request) {
        log.info("Creating currency: {}", request.getCode());
        CurrencyDto currency = currencyService.createCurrency(request);
        return ResponseEntity.ok(ApiResponse.success(currency));
    }

    /**
     * Update an existing currency.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission(null, 'MANAGE_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<CurrencyDto>> updateCurrency(
            @PathVariable Long id,
            @Valid @RequestBody CurrencyRequest request) {
        log.info("Updating currency: {}", id);
        CurrencyDto currency = currencyService.updateCurrency(id, request);
        return ResponseEntity.ok(ApiResponse.success(currency));
    }

    /**
     * Delete a currency.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission(null, 'MANAGE_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<Void>> deleteCurrency(@PathVariable Long id) {
        log.info("Deleting currency: {}", id);
        currencyService.deleteCurrency(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * Set a currency as default.
     */
    @PostMapping("/{id}/set-default")
    @PreAuthorize("hasPermission(null, 'MANAGE_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<CurrencyDto>> setDefaultCurrency(@PathVariable Long id) {
        log.info("Setting currency as default: {}", id);
        CurrencyDto currency = currencyService.setDefaultCurrency(id);
        return ResponseEntity.ok(ApiResponse.success(currency));
    }
}

