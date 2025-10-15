package com.afyaquik.hms.billing.api;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.billing.domain.BillStatus;
import com.afyaquik.hms.billing.dto.BillDto;
import com.afyaquik.hms.billing.dto.BillItemDto;
import com.afyaquik.hms.billing.dto.CreateBillItemRequest;
import com.afyaquik.hms.billing.dto.CreateBillRequest;
import com.afyaquik.hms.billing.dto.CreatePaymentRequest;
import com.afyaquik.hms.billing.service.BillItemService;
import com.afyaquik.hms.billing.service.BillingService;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import jakarta.validation.Valid;

/**
 * REST controller for billing operations.
 */
@RestController
@RequestMapping("/api/v1/billing")
public class BillingController {

    private static final Logger log = LoggerFactory.getLogger(BillingController.class);

    private final BillingService billingService;
    private final BillItemService billItemService;

    public BillingController(BillingService billingService, BillItemService billItemService) {
        this.billingService = billingService;
        this.billItemService = billItemService;
    }

    /**
     * Create a new bill.
     */
    @PostMapping("/bills")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<BillDto> createBill(@Valid @RequestBody CreateBillRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Creating bill for patient {} in tenant {}", request.patientId(), tenantId);
        
        BillDto bill = billingService.createBill(tenantId, request);
        return ResponseEntity.ok(bill);
    }

    /**
     * Get bill by ID.
     */
    @GetMapping("/bills/{billId}")
    @PreAuthorize("hasPermission(null,'VIEW_BILLING')")
    public ResponseEntity<BillDto> getBill(@PathVariable Long billId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        BillDto bill = billingService.getBill(tenantId, billId);
        return ResponseEntity.ok(bill);
    }

    /**
     * Get bills by patient ID.
     */
    @GetMapping("/bills/patient/{patientId}")
    @PreAuthorize("hasPermission(null,'VIEW_BILLING')")
    public ResponseEntity<List<BillDto>> getBillsByPatient(@PathVariable Long patientId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<BillDto> bills = billingService.getBillsByPatient(tenantId, patientId);
        return ResponseEntity.ok(bills);
    }

    /**
     * Get bills by queue item ID.
     */
    @GetMapping("/bills/queue/{queueItemId}")
    @PreAuthorize("hasPermission(null,'VIEW_BILLING')")
    public ResponseEntity<List<BillDto>> getBillsByQueueItem(@PathVariable Long queueItemId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<BillDto> bills = billingService.getBillsByQueueItem(tenantId, queueItemId);
        return ResponseEntity.ok(bills);
    }

    /**
     * Add payment to bill.
     */
    @PostMapping("/bills/{billId}/payments")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<BillDto> addPayment(
            @PathVariable Long billId,
            @Valid @RequestBody CreatePaymentRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Adding payment to bill {} in tenant {}", billId, tenantId);
        
        BillDto bill = billingService.addPayment(tenantId, billId, request);
        return ResponseEntity.ok(bill);
    }

    /**
     * Update bill status.
     */
    @PatchMapping("/bills/{billId}/status")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<BillDto> updateBillStatus(
            @PathVariable Long billId,
            @RequestParam BillStatus status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Updating bill {} status to {} in tenant {}", billId, status, tenantId);
        
        BillDto bill = billingService.updateBillStatus(tenantId, billId, status);
        return ResponseEntity.ok(bill);
    }


    /**
     * Get bill statuses.
     */
    @GetMapping("/bill-statuses")
    @PreAuthorize("hasPermission(null,'VIEW_BILLING')")
    public ResponseEntity<List<String>> getBillStatuses() {
        List<String> statuses = List.of(
            "DRAFT", "SENT", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED", "REFUNDED"
        );
        return ResponseEntity.ok(statuses);
    }

    /**
     * Get bill items for a specific bill.
     */
    @GetMapping("/bills/{billId}/items")
    @PreAuthorize("hasPermission(null,'VIEW_BILLING')")
    public ResponseEntity<List<BillItemDto>> getBillItems(@PathVariable Long billId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Getting bill items for bill {} in tenant {}", billId, tenantId);
        
        List<BillItemDto> items = billItemService.getBillItems(billId);
        return ResponseEntity.ok(items);
    }

    /**
     * Add a new item to a bill.
     */
    @PostMapping("/bills/{billId}/items")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<BillItemDto> addBillItem(
            @PathVariable Long billId,
            @Valid @RequestBody CreateBillItemRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Adding item to bill {} in tenant {}", billId, tenantId);
        
        BillItemDto item = billItemService.addBillItem(billId, request);
        return ResponseEntity.ok(item);
    }

    /**
     * Update a bill item.
     */
    @PutMapping("/bills/{billId}/items/{itemId}")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<BillItemDto> updateBillItem(
            @PathVariable Long billId,
            @PathVariable Long itemId,
            @Valid @RequestBody CreateBillItemRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Updating bill item {} for bill {} in tenant {}", itemId, billId, tenantId);
        
        BillItemDto item = billItemService.updateBillItem(billId, itemId, request);
        return ResponseEntity.ok(item);
    }

    /**
     * Delete a bill item.
     */
    @DeleteMapping("/bills/{billId}/items/{itemId}")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<Void> deleteBillItem(
            @PathVariable Long billId,
            @PathVariable Long itemId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Deleting bill item {} for bill {} in tenant {}", itemId, billId, tenantId);
        
        billItemService.deleteBillItem(billId, itemId);
        return ResponseEntity.ok().build();
    }

    /**
     * Delete a bill.
     */
    @DeleteMapping("/{billId}")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<ApiResponse<Void>> deleteBill(@PathVariable Long billId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Deleting bill {} in tenant {}", billId, tenantId);
        
        billingService.deleteBill(tenantId, billId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * Cancel a bill.
     */
    @PatchMapping("/bills/{billId}/cancel")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<ApiResponse<BillDto>> cancelBill(@PathVariable Long billId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Cancelling bill {} in tenant {}", billId, tenantId);
        
        BillDto bill = billingService.cancelBill(tenantId, billId);
        return ResponseEntity.ok(ApiResponse.success(bill));
    }
}
