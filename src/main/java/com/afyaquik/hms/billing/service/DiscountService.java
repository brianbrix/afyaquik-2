package com.afyaquik.hms.billing.service;

import com.afyaquik.hms.billing.domain.Bill;
import com.afyaquik.hms.billing.domain.Discount;
import com.afyaquik.hms.billing.dto.CreateDiscountRequest;
import com.afyaquik.hms.billing.dto.DiscountDto;
import com.afyaquik.hms.billing.repository.BillRepository;
import com.afyaquik.hms.billing.repository.DiscountRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiscountService {

    @Autowired
    private DiscountRepository discountRepository;

    @Autowired
    private BillRepository billRepository;

    @Transactional
    public DiscountDto createDiscount(Long billId, CreateDiscountRequest request, String appliedBy) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + billId));

        // Check tenant access
        if (!bill.getTenantId().equals(TenantHeaderInterceptor.getCurrentTenant())) {
            throw new SecurityException("Access denied to bill in another tenant.");
        }

        // Calculate discount amount
        BigDecimal discountAmount = calculateDiscountAmount(bill.getSubtotal(), request.getType(), request.getDiscountValue());

        // Create discount
        Discount discount = new Discount();
        discount.setBill(bill);
        discount.setDescription(request.getDescription());
        discount.setType(request.getType());
        discount.setDiscountValue(request.getDiscountValue());
        discount.setDiscountAmount(discountAmount);
        discount.setAppliedBy(appliedBy);
        discount.setAppliedAt(java.time.OffsetDateTime.now());
        discount.setTenantId(TenantHeaderInterceptor.getCurrentTenant());

        Discount savedDiscount = discountRepository.save(discount);

        // Update bill totals
        updateBillTotals(bill);

        return convertToDto(savedDiscount);
    }

    @Transactional(readOnly = true)
    public List<DiscountDto> getDiscountsByBillId(Long billId) {
        return discountRepository.findByBillIdAndDeletedFalse(billId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteDiscount(Long discountId) {
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new RuntimeException("Discount not found with id: " + discountId));

        if (!discount.getTenantId().equals(TenantHeaderInterceptor.getCurrentTenant())) {
            throw new SecurityException("Access denied to discount in another tenant.");
        }

        discount.softDelete();
        discountRepository.save(discount);

        // Update bill totals
        updateBillTotals(discount.getBill());
    }

    private BigDecimal calculateDiscountAmount(BigDecimal subtotal, Discount.DiscountType type, BigDecimal value) {
        if (type == Discount.DiscountType.PERCENTAGE) {
            return subtotal.multiply(value).divide(BigDecimal.valueOf(100));
        } else {
            return value;
        }
    }

    private void updateBillTotals(Bill bill) {
        // Calculate total discount amount
        BigDecimal totalDiscountAmount = discountRepository.findByBillIdAndDeletedFalse(bill.getId())
                .stream()
                .map(Discount::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate total paid amount
        BigDecimal totalPaidAmount = bill.getPayments().stream()
                .filter(payment -> payment.getStatus() == com.afyaquik.hms.billing.domain.PaymentStatus.COMPLETED)
                .map(com.afyaquik.hms.billing.domain.Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Update bill
        bill.setDiscountAmount(totalDiscountAmount);
        bill.setTotalAmount(bill.getSubtotal().subtract(totalDiscountAmount));
        bill.setPaidAmount(totalPaidAmount);
        bill.setBalanceDue(bill.getTotalAmount().subtract(totalPaidAmount));

        // Update status
        if (bill.getBalanceDue().compareTo(BigDecimal.ZERO) <= 0) {
            bill.setStatus(com.afyaquik.hms.billing.domain.BillStatus.PAID);
        } else if (bill.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            bill.setStatus(com.afyaquik.hms.billing.domain.BillStatus.PARTIALLY_PAID);
        }

        billRepository.save(bill);
    }

    private DiscountDto convertToDto(Discount discount) {
        DiscountDto dto = new DiscountDto();
        dto.setId(discount.getId());
        dto.setBillId(discount.getBill().getId());
        dto.setDescription(discount.getDescription());
        dto.setType(discount.getType());
        dto.setDiscountValue(discount.getDiscountValue());
        dto.setDiscountAmount(discount.getDiscountAmount());
        dto.setAppliedBy(discount.getAppliedBy());
        dto.setAppliedAt(discount.getAppliedAt());
        return dto;
    }
}
