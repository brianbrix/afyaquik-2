package com.afyaquik.hms.diagnostics.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.diagnostics.domain.DiagnosticItem;
import com.afyaquik.hms.diagnostics.domain.DiagnosticOrder;
import com.afyaquik.hms.diagnostics.domain.DiagnosticOrderStatus;
import com.afyaquik.hms.diagnostics.domain.TestCatalog;
import com.afyaquik.hms.diagnostics.dto.CreateDiagnosticOrderRequest;
import com.afyaquik.hms.diagnostics.dto.DiagnosticItemDto;
import com.afyaquik.hms.diagnostics.dto.DiagnosticItemRequest;
import com.afyaquik.hms.diagnostics.dto.DiagnosticOrderDto;
import com.afyaquik.hms.diagnostics.repository.DiagnosticOrderRepository;
import com.afyaquik.hms.diagnostics.repository.TestCatalogRepository;

@Service
@Transactional
public class DiagnosticOrderService {
    
    private final DiagnosticOrderRepository diagnosticOrderRepository;
    private final TestCatalogRepository testCatalogRepository;
    private final DiagnosticBillingService diagnosticBillingService;
    
    public DiagnosticOrderService(DiagnosticOrderRepository diagnosticOrderRepository, 
                                 TestCatalogRepository testCatalogRepository,
                                 DiagnosticBillingService diagnosticBillingService) {
        this.diagnosticOrderRepository = diagnosticOrderRepository;
        this.testCatalogRepository = testCatalogRepository;
        this.diagnosticBillingService = diagnosticBillingService;
    }
    
    public DiagnosticOrderDto createDiagnosticOrder(CreateDiagnosticOrderRequest request, 
                                                   String orderedBy, String orderedByName) {
        // Generate order number
        String orderNumber = generateOrderNumber();
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Create diagnostic order
        DiagnosticOrder order = new DiagnosticOrder(orderNumber, request.getPatientId(), 
                                                  request.getQueueItemId(), orderedBy, orderedByName);
        order.setClinicalNotes(request.getClinicalNotes());
        order.setInstructions(request.getInstructions());
        order.setUrgency(request.getUrgency());
        order.setOrderedAt(LocalDateTime.now());
        order.setTenantId(tenantId);
        
        // Create diagnostic items
        if (request.getDiagnosticItems() != null && !request.getDiagnosticItems().isEmpty()) {
            for (DiagnosticItemRequest itemRequest : request.getDiagnosticItems()) {
                TestCatalog testCatalog = testCatalogRepository.findById(itemRequest.getTestCatalogId())
                    .orElseThrow(() -> new RuntimeException("Test catalog not found: " + itemRequest.getTestCatalogId()));
                
                DiagnosticItem item = new DiagnosticItem(order, testCatalog, orderedBy, orderedByName);
                item.setNotes(itemRequest.getNotes());
                item.setTenantId(tenantId);
                item.setCost(testCatalog.getCost());
                order.getDiagnosticItems().add(item);
            }
        }
        
        DiagnosticOrder savedOrder = diagnosticOrderRepository.save(order);
        return convertToDto(savedOrder);
    }
    
    public DiagnosticOrderDto getDiagnosticOrder(Long id) {
        DiagnosticOrder order = diagnosticOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Diagnostic order not found: " + id));
        return convertToDto(order);
    }
    
    public DiagnosticOrderDto getDiagnosticOrderByOrderNumber(String orderNumber) {
        DiagnosticOrder order = diagnosticOrderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new RuntimeException("Diagnostic order not found: " + orderNumber));
        return convertToDto(order);
    }
    
    public List<DiagnosticOrderDto> getDiagnosticOrdersByPatient(Long patientId) {
        List<DiagnosticOrder> orders = diagnosticOrderRepository.findByPatientIdOrderByOrderedAtDesc(patientId);
        return orders.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<DiagnosticOrderDto> getDiagnosticOrdersByQueueItem(Long queueItemId) {
        List<DiagnosticOrder> orders = diagnosticOrderRepository.findByQueueItemIdOrderByOrderedAtDesc(queueItemId);
        return orders.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<DiagnosticOrderDto> getAllDiagnosticOrders() {
        List<DiagnosticOrder> orders = diagnosticOrderRepository.findAll();
        return orders.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public DiagnosticOrderDto updateDiagnosticOrder(Long id, DiagnosticOrderDto orderDto) {
        DiagnosticOrder order = diagnosticOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Diagnostic order not found"));
        
        // Only allow updating certain fields
        if (orderDto.getClinicalNotes() != null) {
            order.setClinicalNotes(orderDto.getClinicalNotes());
        }
        if (orderDto.getUrgency() != null) {
            order.setUrgency(orderDto.getUrgency());
        }
        
        // Set tenant ID explicitly
        order.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        
        DiagnosticOrder savedOrder = diagnosticOrderRepository.save(order);
        return convertToDto(savedOrder);
    }
    
    public DiagnosticOrderDto updateDiagnosticOrderStatus(Long id, DiagnosticOrderStatus status) {
        DiagnosticOrder order = diagnosticOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Diagnostic order not found: " + id));
        
        DiagnosticOrderStatus previousStatus = order.getStatus();
        order.setStatus(status);
        
        if (status == DiagnosticOrderStatus.COMPLETED) {
            order.setCompletedAt(LocalDateTime.now());
            // Add diagnostic items to bill when order is completed
            diagnosticBillingService.addDiagnosticItemsToBill(id);
        } else if (status == DiagnosticOrderStatus.CANCELLED) {
            order.setCancelledAt(LocalDateTime.now());
        } else if (previousStatus == DiagnosticOrderStatus.COMPLETED && status != DiagnosticOrderStatus.COMPLETED) {
            // Remove diagnostic items from bill when order is reopened (status changed from COMPLETED to something else)
            diagnosticBillingService.removeDiagnosticItemsFromBill(id);
        }
        
        DiagnosticOrder savedOrder = diagnosticOrderRepository.save(order);
        return convertToDto(savedOrder);
    }
    
    private String generateOrderNumber() {
        return "DX-" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
    
    private DiagnosticOrderDto convertToDto(DiagnosticOrder order) {
        DiagnosticOrderDto dto = new DiagnosticOrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setPatientId(order.getPatientId());
        dto.setQueueItemId(order.getQueueItemId());
        dto.setOrderedBy(order.getOrderedBy());
        dto.setOrderedByName(order.getOrderedByName());
        dto.setStatus(order.getStatus());
        dto.setUrgency(order.getUrgency());
        dto.setClinicalNotes(order.getClinicalNotes());
        dto.setInstructions(order.getInstructions());
        dto.setOrderedAt(order.getOrderedAt());
        dto.setCompletedAt(order.getCompletedAt());
        dto.setCancelledAt(order.getCancelledAt());
        
        // Convert diagnostic items
        if (order.getDiagnosticItems() != null) {
            dto.setDiagnosticItems(order.getDiagnosticItems().stream()
                .map(this::convertItemToDto)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    private DiagnosticItemDto convertItemToDto(DiagnosticItem item) {
        DiagnosticItemDto dto = new DiagnosticItemDto();
        dto.setId(item.getId());
        dto.setDiagnosticOrderId(item.getDiagnosticOrder().getId());
        dto.setTestCatalogId(item.getTestCatalog().getId());
        dto.setTestCode(item.getTestCatalog().getTestCode());
        dto.setTestName(item.getTestCatalog().getTestName());
        dto.setTestDescription(item.getTestCatalog().getDescription());
        dto.setTestType(item.getTestCatalog().getTestType().getDisplayName());
        dto.setDepartment(item.getTestCatalog().getDepartment());
        dto.setDepartmentName(item.getTestCatalog().getDepartmentName());
        dto.setStatus(item.getStatus());
        dto.setNotes(item.getNotes());
        dto.setCost(item.getCost());
        dto.setOrderedBy(item.getOrderedBy());
        dto.setOrderedByName(item.getOrderedByName());
        return dto;
    }
}
