package com.afyaquik.hms.billing.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.billing.domain.Bill;
import com.afyaquik.hms.billing.domain.Payment;
import com.afyaquik.hms.billing.repository.BillRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.repository.PatientRepository;

@Service
@Transactional(readOnly = true)
public class BillingDocumentService {

    private BillRepository billRepository;
    private PatientRepository patientRepository;

    public BillingDocumentService(BillRepository billRepository, PatientRepository patientRepository) {
        this.billRepository = billRepository;
        this.patientRepository = patientRepository;
    }

    public Map<String, Object> generateInvoice(Long billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + billId));

        if (!bill.getTenantId().equals(TenantHeaderInterceptor.getCurrentTenant())) {
            throw new SecurityException("Access denied to bill in another tenant.");
        }

        Map<String, Object> invoice = new HashMap<>();
        
        // Header information
        invoice.put("invoiceNumber", "INV-" + String.format("%06d", bill.getId()));
        invoice.put("invoiceDate", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        invoice.put("dueDate", bill.getDueDate() != null ? 
            bill.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A");
        
        // Patient information
        invoice.put("patientName", bill.getPatientName());
        invoice.put("patientId", bill.getPatientId());
        invoice.put("patientPhone", "N/A"); // Bill entity doesn't store phone
        invoice.put("patientEmail", "N/A"); // Bill entity doesn't store email
        
        // Bill details
        invoice.put("subtotal", bill.getSubtotal());
        invoice.put("discountAmount", bill.getDiscountAmount() != null ? bill.getDiscountAmount() : BigDecimal.ZERO);
        invoice.put("totalAmount", bill.getTotalAmount());
        invoice.put("paidAmount", bill.getPaidAmount() != null ? bill.getPaidAmount() : BigDecimal.ZERO);
        invoice.put("balanceDue", bill.getBalanceDue() != null ? bill.getBalanceDue() : bill.getTotalAmount());
        invoice.put("status", bill.getStatus().name());
        
        // Bill items
        invoice.put("items", bill.getItems().stream().map(item -> {
            Map<String, Object> itemData = new HashMap<>();
            itemData.put("description", item.getDescription());
            itemData.put("quantity", item.getQuantity());
            itemData.put("unitPrice", item.getUnitPrice());
            itemData.put("totalPrice", item.getLineTotal());
            return itemData;
        }).toList());
        
        // Payments
        List<Payment> payments = bill.getPayments();
        invoice.put("payments", payments.stream().map(payment -> {
            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("amount", payment.getAmount());
            paymentData.put("paymentDate", payment.getPaymentDate() != null ? 
                payment.getPaymentDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A");
            paymentData.put("paymentMethod", payment.getPaymentMethod() != null ? 
                payment.getPaymentMethod().getCode() : "N/A");
            paymentData.put("status", payment.getStatus().name());
            return paymentData;
        }).toList());
        
        return invoice;
    }

    public Map<String, Object> generateReceipt(Long paymentId) {
        // Find payment through bill repository
        Bill bill = billRepository.findByPaymentsId(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));
        
        Payment payment = bill.getPayments().stream()
                .filter(p -> p.getId().equals(paymentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));
        Patient patient = patientRepository.findById(bill.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + bill.getPatientId()));
                
        if (!bill.getTenantId().equals(TenantHeaderInterceptor.getCurrentTenant())) {
            throw new SecurityException("Access denied to payment in another tenant.");
        }

        Map<String, Object> receipt = new HashMap<>();
        
        // Header information
        receipt.put("receiptNumber", "RCP-" + String.format("%06d", payment.getId()));
        receipt.put("receiptDate", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        receipt.put("paymentDate", payment.getPaymentDate() != null ? 
            payment.getPaymentDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A");
        
        // Patient information
        receipt.put("patientName", bill.getPatientName());
        receipt.put("patientId", bill.getPatientId());
        receipt.put("patientPhone", patient.getPhone());
        receipt.put("patientEmail", patient.getEmail());
        
        // Payment details
        receipt.put("amount", payment.getAmount());
        receipt.put("paymentMethod", payment.getPaymentMethod() != null ? 
            payment.getPaymentMethod().getCode() : "N/A");
        receipt.put("status", payment.getStatus().name());
        receipt.put("reference", payment.getReferenceNumber());
        receipt.put("notes", payment.getNotes());
        
        // Bill summary
        receipt.put("billNumber", "BILL-" + String.format("%06d", bill.getId()));
        receipt.put("billTotal", bill.getTotalAmount());
        receipt.put("billBalance", bill.getBalanceDue() != null ? bill.getBalanceDue() : BigDecimal.ZERO);
        
        return receipt;
    }
}
