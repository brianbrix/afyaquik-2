package com.afyaquik.hms.billing.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.billing.domain.Bill;
import com.afyaquik.hms.billing.domain.BillItem;
import com.afyaquik.hms.billing.domain.BillStatus;
import com.afyaquik.hms.billing.domain.Payment;
import com.afyaquik.hms.billing.domain.PaymentMethod;
import com.afyaquik.hms.billing.domain.PaymentStatus;
import com.afyaquik.hms.billing.dto.BillDto;
import com.afyaquik.hms.billing.dto.BillItemDto;
import com.afyaquik.hms.billing.dto.CreateBillItemRequest;
import com.afyaquik.hms.billing.dto.CreateBillRequest;
import com.afyaquik.hms.billing.dto.CreatePaymentRequest;
import com.afyaquik.hms.billing.dto.PaymentDto;
import com.afyaquik.hms.billing.dto.PaymentMethodDto;
import com.afyaquik.hms.billing.repository.BillRepository;
import com.afyaquik.hms.billing.repository.PaymentMethodRepository;

/**
 * Service for billing operations.
 */
@Service
@Transactional(readOnly = true)
public class BillingService {

    private static final Logger log = LoggerFactory.getLogger(BillingService.class);

    private final BillRepository billRepository;
    private final PaymentMethodRepository paymentMethodRepository;

    public BillingService(BillRepository billRepository, PaymentMethodRepository paymentMethodRepository) {
        this.billRepository = billRepository;
        this.paymentMethodRepository = paymentMethodRepository;
    }

    /**
     * Create a new bill.
     */
    @Transactional
    public BillDto createBill(String tenantId, CreateBillRequest request) {
        log.info("Creating bill for patient {} in tenant {}", request.patientId(), tenantId);

        // Generate unique bill number
        String billNumber = generateBillNumber();

        // Create bill entity
        Bill bill = new Bill();
        bill.setTenantId(tenantId);
        bill.setBillNumber(billNumber);
        bill.setPatientId(request.patientId());
        bill.setPatientName(request.patientName());
        bill.setQueueItemId(request.queueItemId());
        bill.setStatus(BillStatus.DRAFT);
        bill.setBillingDate(request.billingDate() != null ? request.billingDate() : OffsetDateTime.now());
        bill.setDueDate(request.dueDate());
        bill.setPaymentTerms(request.paymentTerms());
        bill.setNotes(request.notes());

        // Add bill items
        if (request.items() != null) {
            for (CreateBillItemRequest itemRequest : request.items()) {
                BillItem item = new BillItem();
                item.setItemCode(itemRequest.itemCode());
                item.setDescription(itemRequest.description());
                item.setQuantity(itemRequest.quantity());
                item.setUnitPrice(itemRequest.unitPrice());
                item.setDiscountPercentage(itemRequest.discountPercentage() != null ? itemRequest.discountPercentage() : BigDecimal.ZERO);
                item.setDiscountAmount(itemRequest.discountAmount() != null ? itemRequest.discountAmount() : BigDecimal.ZERO);
                item.setTaxRate(itemRequest.taxRate() != null ? itemRequest.taxRate() : BigDecimal.ZERO);
                item.setServiceCategory(itemRequest.serviceCategory());
                item.setNotes(itemRequest.notes());
                item.calculateLineTotal();
                bill.addItem(item);
            }
        }

        // Recalculate amounts
        bill.recalculateAmounts();

        // Save bill
        Bill savedBill = billRepository.save(bill);
        log.info("Created bill {} for patient {}", savedBill.getBillNumber(), savedBill.getPatientId());

        return toDto(savedBill);
    }

    /**
     * Get bill by ID.
     */
    public BillDto getBill(String tenantId, Long billId) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        if (!bill.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Bill not found");
        }

        return toDto(bill);
    }

    /**
     * Get bills by patient ID.
     */
    public List<BillDto> getBillsByPatient(String tenantId, Long patientId) {
        List<Bill> bills = billRepository.findByTenantIdAndPatientIdOrderByCreatedAtDesc(tenantId, patientId);
        return bills.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get bills by queue item ID.
     */
    public List<BillDto> getBillsByQueueItem(String tenantId, Long queueItemId) {
        List<Bill> bills = billRepository.findByTenantIdAndQueueItemIdOrderByCreatedAtDesc(tenantId, queueItemId);
        return bills.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Add payment to bill.
     */
    @Transactional
    public BillDto addPayment(String tenantId, Long billId, CreatePaymentRequest request) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        if (!bill.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Bill not found");
        }

        // Fetch payment method
        PaymentMethod paymentMethod = paymentMethodRepository.findById(request.paymentMethodId())
                .orElseThrow(() -> new RuntimeException("Payment method not found with id: " + request.paymentMethodId()));

        // Create payment
        Payment payment = new Payment();
        payment.setPaymentNumber(generatePaymentNumber());
        payment.setAmount(request.amount());
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentDate(request.paymentDate());
        payment.setReferenceNumber(request.referenceNumber());
        payment.setNotes(request.notes());
        payment.setProcessedBy(request.processedBy());
        payment.setStatus(PaymentStatus.COMPLETED);

        bill.addPayment(payment);

        // Update bill status based on balance
        if (bill.getBalanceDue().compareTo(BigDecimal.ZERO) <= 0) {
            bill.setStatus(BillStatus.PAID);
        } else if (bill.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            bill.setStatus(BillStatus.PARTIALLY_PAID);
        }

        Bill savedBill = billRepository.save(bill);
        log.info("Added payment {} to bill {}", payment.getPaymentNumber(), bill.getBillNumber());

        return toDto(savedBill);
    }

    /**
     * Update bill status.
     */
    @Transactional
    public BillDto updateBillStatus(String tenantId, Long billId, BillStatus status) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        if (!bill.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Bill not found");
        }

        bill.setStatus(status);
        Bill savedBill = billRepository.save(bill);
        log.info("Updated bill {} status to {}", savedBill.getBillNumber(), status);

        return toDto(savedBill);
    }

    /**
     * Generate unique bill number.
     */
    private String generateBillNumber() {
        return "BILL-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Generate unique payment number.
     */
    private String generatePaymentNumber() {
        return "PAY-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Convert Bill entity to DTO.
     */
    private BillDto toDto(Bill bill) {
        return new BillDto(
            bill.getId(),
            bill.getBillNumber(),
            bill.getPatientId(),
            bill.getPatientName(),
            bill.getQueueItemId(),
            bill.getStatus(),
            bill.getSubtotal(),
            bill.getTaxAmount(),
            bill.getDiscountAmount(),
            bill.getTotalAmount(),
            bill.getPaidAmount(),
            bill.getBalanceDue(),
            bill.getBillingDate(),
            bill.getDueDate(),
            bill.getPaymentTerms(),
            bill.getNotes(),
            bill.getItems().stream().map(this::toItemDto).collect(Collectors.toList()),
            bill.getPayments().stream().map(this::toPaymentDto).collect(Collectors.toList()),
            bill.getCreatedAt(),
            bill.getUpdatedAt()
        );
    }

    /**
     * Convert BillItem entity to DTO.
     */
    private BillItemDto toItemDto(BillItem item) {
        return new BillItemDto(
            item.getId(),
            item.getItemCode(),
            item.getDescription(),
            item.getQuantity(),
            item.getUnitPrice(),
            item.getDiscountPercentage(),
            item.getDiscountAmount(),
            item.getTaxRate(),
            item.getTaxAmount(),
            item.getLineTotal(),
            item.getServiceCategory(),
            item.getNotes()
        );
    }

    /**
     * Convert Payment entity to DTO.
     */
    private PaymentDto toPaymentDto(Payment payment) {
        return new PaymentDto(
            payment.getId(),
            payment.getPaymentNumber(),
            payment.getAmount(),
            toPaymentMethodDto(payment.getPaymentMethod()),
            payment.getPaymentDate(),
            payment.getReferenceNumber(),
            payment.getNotes(),
            payment.getProcessedBy(),
            payment.getStatus(),
            payment.getCreatedAt(),
            payment.getUpdatedAt()
        );
    }

    /**
     * Convert PaymentMethod entity to DTO.
     */
    private PaymentMethodDto toPaymentMethodDto(PaymentMethod paymentMethod) {
        PaymentMethodDto dto = new PaymentMethodDto();
        dto.setId(paymentMethod.getId());
        dto.setName(paymentMethod.getName());
        dto.setCode(paymentMethod.getCode());
        dto.setDescription(paymentMethod.getDescription());
        dto.setIsActive(paymentMethod.getIsActive());
        dto.setRequiresAuthorization(paymentMethod.getRequiresAuthorization());
        dto.setProcessingFeePercentage(paymentMethod.getProcessingFeePercentage());
        dto.setSortOrder(paymentMethod.getSortOrder());
        return dto;
    }
}
