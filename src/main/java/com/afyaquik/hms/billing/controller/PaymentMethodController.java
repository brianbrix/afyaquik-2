package com.afyaquik.hms.billing.controller;

import com.afyaquik.hms.billing.dto.PaymentMethodDto;
import com.afyaquik.hms.billing.service.PaymentMethodService;
import com.afyaquik.hms.common.web.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/billing/payment-methods")
public class PaymentMethodController {

    @Autowired
    private PaymentMethodService paymentMethodService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentMethodDto>>> getAllPaymentMethods() {
        List<PaymentMethodDto> methods = paymentMethodService.getAllPaymentMethods();
        return ResponseEntity.ok(ApiResponse.success(methods));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PaymentMethodDto>>> getActivePaymentMethods() {
        List<PaymentMethodDto> methods = paymentMethodService.getAllActivePaymentMethods();
        return ResponseEntity.ok(ApiResponse.success(methods));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentMethodDto>> getPaymentMethodById(@PathVariable Long id) {
        PaymentMethodDto method = paymentMethodService.getPaymentMethodById(id);
        return ResponseEntity.ok(ApiResponse.success(method));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentMethodDto>> createPaymentMethod(@RequestBody PaymentMethodDto dto) {
        PaymentMethodDto created = paymentMethodService.createPaymentMethod(dto);
        return ResponseEntity.ok(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentMethodDto>> updatePaymentMethod(
            @PathVariable Long id, 
            @RequestBody PaymentMethodDto dto) {
        PaymentMethodDto updated = paymentMethodService.updatePaymentMethod(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePaymentMethod(@PathVariable Long id) {
        paymentMethodService.deletePaymentMethod(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
