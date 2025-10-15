package com.afyaquik.hms.diagnostics.controller;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.diagnostics.domain.DiagnosticOrderStatus;
import com.afyaquik.hms.diagnostics.dto.CreateDiagnosticOrderRequest;
import com.afyaquik.hms.diagnostics.dto.DiagnosticOrderDto;
import com.afyaquik.hms.diagnostics.service.DiagnosticOrderService;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.auth.domain.StaffUser;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/diagnostics")
public class DiagnosticOrderController {
    
    private final DiagnosticOrderService diagnosticOrderService;
    
    @Autowired
    private StaffUserRepository staffUserRepository;
    
    public DiagnosticOrderController(DiagnosticOrderService diagnosticOrderService) {
        this.diagnosticOrderService = diagnosticOrderService;
    }
    
    @PostMapping("/orders")
    public ApiResponse<DiagnosticOrderDto> createDiagnosticOrder(@RequestBody CreateDiagnosticOrderRequest request,
                                                               Authentication authentication) {
        String orderedBy = authentication.getName();
        String orderedByName = getDisplayName(orderedBy);
        
        DiagnosticOrderDto order = diagnosticOrderService.createDiagnosticOrder(request, orderedBy, orderedByName);
        return ApiResponse.success(order);
    }
    
    @GetMapping("/orders/{id}")
    public ApiResponse<DiagnosticOrderDto> getDiagnosticOrder(@PathVariable Long id) {
        DiagnosticOrderDto order = diagnosticOrderService.getDiagnosticOrder(id);
        return ApiResponse.success(order);
    }
    
    @GetMapping("/orders/order-number/{orderNumber}")
    public ApiResponse<DiagnosticOrderDto> getDiagnosticOrderByOrderNumber(@PathVariable String orderNumber) {
        DiagnosticOrderDto order = diagnosticOrderService.getDiagnosticOrderByOrderNumber(orderNumber);
        return ApiResponse.success(order);
    }
    
    @GetMapping("/orders/patient/{patientId}")
    public ApiResponse<List<DiagnosticOrderDto>> getDiagnosticOrdersByPatient(@PathVariable Long patientId) {
        List<DiagnosticOrderDto> orders = diagnosticOrderService.getDiagnosticOrdersByPatient(patientId);
        return ApiResponse.success(orders);
    }
    
    @GetMapping("/orders/queue-item/{queueItemId}")
    public ApiResponse<List<DiagnosticOrderDto>> getDiagnosticOrdersByQueueItem(@PathVariable Long queueItemId) {
        List<DiagnosticOrderDto> orders = diagnosticOrderService.getDiagnosticOrdersByQueueItem(queueItemId);
        return ApiResponse.success(orders);
    }
    
    @GetMapping("/orders")
    public ApiResponse<List<DiagnosticOrderDto>> getAllDiagnosticOrders() {
        List<DiagnosticOrderDto> orders = diagnosticOrderService.getAllDiagnosticOrders();
        return ApiResponse.success(orders);
    }
    
    @PutMapping("/orders/{id}")
    public ApiResponse<DiagnosticOrderDto> updateDiagnosticOrder(@PathVariable Long id,
                                                                @RequestBody DiagnosticOrderDto orderDto) {
        DiagnosticOrderDto order = diagnosticOrderService.updateDiagnosticOrder(id, orderDto);
        return ApiResponse.success(order);
    }
    
    @PatchMapping("/orders/{id}/status")
    public ApiResponse<DiagnosticOrderDto> updateDiagnosticOrderStatus(@PathVariable Long id,
                                                                     @RequestParam DiagnosticOrderStatus status) {
        DiagnosticOrderDto order = diagnosticOrderService.updateDiagnosticOrderStatus(id, status);
        return ApiResponse.success(order);
    }
    
    private String getDisplayName(String username) {
        try {
            String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
            StaffUser user = staffUserRepository.findByTenantIdAndUsernameAndDeletedFalse(tenantId, username);
            if (user != null && user.getDisplayName() != null) {
                return user.getDisplayName();
            }
        } catch (Exception e) {
            // Log error if needed, but don't fail the operation
        }
        return username; // Fallback to username
    }
}
