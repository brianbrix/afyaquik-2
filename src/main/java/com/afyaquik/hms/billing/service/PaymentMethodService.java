package com.afyaquik.hms.billing.service;

import com.afyaquik.hms.billing.domain.PaymentMethod;
import com.afyaquik.hms.billing.dto.PaymentMethodDto;
import com.afyaquik.hms.billing.repository.PaymentMethodRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

@Service
@Transactional
public class PaymentMethodService {

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    public List<PaymentMethodDto> getAllActivePaymentMethods() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<PaymentMethod> methods = paymentMethodRepository.findActiveByTenantId(tenantId);
        return methods.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<PaymentMethodDto> getAllPaymentMethods() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<PaymentMethod> methods = paymentMethodRepository.findByTenantId(tenantId);
        return methods.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public PaymentMethodDto createPaymentMethod(PaymentMethodDto dto) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Check if code already exists
        if (paymentMethodRepository.existsByCodeAndTenantId(dto.getCode(), tenantId)) {
            throw new IllegalArgumentException("Payment method with code '" + dto.getCode() + "' already exists");
        }

        PaymentMethod method = new PaymentMethod();
        method.setTenantId(tenantId);
        method.setName(dto.getName());
        method.setCode(dto.getCode());
        method.setDescription(dto.getDescription());
        method.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        method.setRequiresAuthorization(dto.getRequiresAuthorization() != null ? dto.getRequiresAuthorization() : false);
        method.setProcessingFeePercentage(dto.getProcessingFeePercentage() != null ? dto.getProcessingFeePercentage() : 0.0);
        method.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);

        PaymentMethod saved = paymentMethodRepository.save(method);
        return convertToDto(saved);
    }

    public PaymentMethodDto updatePaymentMethod(Long id, PaymentMethodDto dto) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        PaymentMethod method = paymentMethodRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found"));

        // Check if code already exists for another method
        if (paymentMethodRepository.existsByCodeAndTenantIdAndIdNot(dto.getCode(), tenantId, id)) {
            throw new IllegalArgumentException("Payment method with code '" + dto.getCode() + "' already exists");
        }

        method.setName(dto.getName());
        method.setCode(dto.getCode());
        method.setDescription(dto.getDescription());
        method.setIsActive(dto.getIsActive());
        method.setRequiresAuthorization(dto.getRequiresAuthorization());
        method.setProcessingFeePercentage(dto.getProcessingFeePercentage());
        method.setSortOrder(dto.getSortOrder());

        PaymentMethod saved = paymentMethodRepository.save(method);
        return convertToDto(saved);
    }

    public void deletePaymentMethod(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        PaymentMethod method = paymentMethodRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found"));
        
        paymentMethodRepository.delete(method);
    }

    public PaymentMethodDto getPaymentMethodById(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        PaymentMethod method = paymentMethodRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found"));
        
        return convertToDto(method);
    }

    private PaymentMethodDto convertToDto(PaymentMethod method) {
        PaymentMethodDto dto = new PaymentMethodDto();
        dto.setId(method.getId());
        dto.setName(method.getName());
        dto.setCode(method.getCode());
        dto.setDescription(method.getDescription());
        dto.setIsActive(method.getIsActive());
        dto.setRequiresAuthorization(method.getRequiresAuthorization());
        dto.setProcessingFeePercentage(method.getProcessingFeePercentage());
        dto.setSortOrder(method.getSortOrder());
        return dto;
    }
}
