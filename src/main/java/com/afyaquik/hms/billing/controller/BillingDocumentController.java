package com.afyaquik.hms.billing.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.billing.service.BillingDocumentService;
import com.afyaquik.hms.common.web.ApiResponse;

@RestController
@RequestMapping("/api/v1/billing/documents")
public class BillingDocumentController {

    @Autowired
    private BillingDocumentService billingDocumentService;

    @GetMapping("/invoice/{billId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateInvoice(@PathVariable Long billId) {
        try {
            Map<String, Object> invoice = billingDocumentService.generateInvoice(billId);
            return ResponseEntity.ok(ApiResponse.success(invoice));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate invoice: " + e.getMessage()));
        }
    }

    @GetMapping("/receipt/{paymentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateReceipt(@PathVariable Long paymentId) {
        try {
            Map<String, Object> receipt = billingDocumentService.generateReceipt(paymentId);
            return ResponseEntity.ok(ApiResponse.success(receipt));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate receipt: " + e.getMessage()));
        }
    }
}
