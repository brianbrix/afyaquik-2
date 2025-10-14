package com.afyaquik.hms.diagnostics.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.diagnostics.domain.DiagnosticItem;
import com.afyaquik.hms.diagnostics.domain.DiagnosticOrder;
import com.afyaquik.hms.diagnostics.domain.Sample;
import com.afyaquik.hms.diagnostics.dto.SampleDto;
import com.afyaquik.hms.diagnostics.repository.DiagnosticItemRepository;
import com.afyaquik.hms.diagnostics.repository.DiagnosticOrderRepository;
import com.afyaquik.hms.diagnostics.repository.SampleRepository;

@Service
@Transactional
public class SampleService {
    
    private final SampleRepository sampleRepository;
    private final DiagnosticOrderRepository diagnosticOrderRepository;
    private final DiagnosticItemRepository diagnosticItemRepository;
    
    public SampleService(SampleRepository sampleRepository,
                        DiagnosticOrderRepository diagnosticOrderRepository,
                        DiagnosticItemRepository diagnosticItemRepository) {
        this.sampleRepository = sampleRepository;
        this.diagnosticOrderRepository = diagnosticOrderRepository;
        this.diagnosticItemRepository = diagnosticItemRepository;
    }
    
    public List<SampleDto> getAllSamples() {
        List<Sample> samples = sampleRepository.findAll();
        return samples.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<SampleDto> getSamplesByDiagnosticOrder(Long diagnosticOrderId) {
        List<Sample> samples = sampleRepository.findByDiagnosticOrderIdOrderByCollectedAtDesc(diagnosticOrderId);
        return samples.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<SampleDto> getSamplesByDiagnosticItem(Long diagnosticItemId) {
        List<Sample> samples = sampleRepository.findByDiagnosticItemIdOrderByCollectedAtDesc(diagnosticItemId);
        return samples.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<SampleDto> getSamplesByPatient(Long patientId) {
        List<Sample> samples = sampleRepository.findByPatientIdOrderByCollectedAtDesc(patientId);
        return samples.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<SampleDto> getSamplesByQueueItem(Long queueItemId) {
        List<Sample> samples = sampleRepository.findByQueueItemIdOrderByCollectedAtDesc(queueItemId);
        return samples.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<SampleDto> getSamplesByStatus(String status) {
        List<Sample> samples = sampleRepository.findByStatusOrderByCollectedAtDesc(
            com.afyaquik.hms.diagnostics.domain.SampleStatus.valueOf(status));
        return samples.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public Optional<SampleDto> getSampleById(Long id) {
        return sampleRepository.findById(id).map(this::convertToDto);
    }
    
    public Optional<SampleDto> getSampleByBarcode(String barcode) {
        return sampleRepository.findByBarcode(barcode).map(this::convertToDto);
    }
    
    public SampleDto createSample(SampleDto dto, String collectedBy, String collectedByName) {
        Sample sample = convertToEntity(dto);
        sample.setCollectedBy(collectedBy);
        sample.setCollectedByName(collectedByName);
        sample.setCollectedAt(LocalDateTime.now());
        sample.setStatus(com.afyaquik.hms.diagnostics.domain.SampleStatus.COLLECTED);
        sample.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        
        // Generate barcode if not provided
        if (sample.getBarcode() == null || sample.getBarcode().trim().isEmpty()) {
            sample.setBarcode(generateBarcode());
        }
        
        Sample saved = sampleRepository.save(sample);
        return convertToDto(saved);
    }
    
    public Optional<SampleDto> updateSampleStatus(Long id, String status, String receivedBy, String receivedByName) {
        return sampleRepository.findById(id).map(sample -> {
            sample.setStatus(com.afyaquik.hms.diagnostics.domain.SampleStatus.valueOf(status));
            if (receivedBy != null && receivedByName != null) {
                sample.setReceivedBy(receivedBy);
                sample.setReceivedByName(receivedByName);
                sample.setReceivedAt(LocalDateTime.now());
            }
            Sample saved = sampleRepository.save(sample);
            return convertToDto(saved);
        });
    }
    
    public Optional<SampleDto> updateSample(Long id, SampleDto dto) {
        return sampleRepository.findById(id).map(existing -> {
            Sample updated = convertToEntity(dto);
            updated.setId(id);
            updated.setTenantId(existing.getTenantId()); // Preserve existing tenant ID
            Sample saved = sampleRepository.save(updated);
            return convertToDto(saved);
        });
    }
    
    public boolean deleteSample(Long id) {
        if (!sampleRepository.existsById(id)) {
            return false;
        }
        sampleRepository.deleteById(id);
        return true;
    }
    
    private String generateBarcode() {
        return "BC" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
    
    private SampleDto convertToDto(Sample sample) {
        SampleDto dto = new SampleDto();
        dto.setId(sample.getId());
        dto.setDiagnosticOrderId(sample.getDiagnosticOrder().getId());
        dto.setDiagnosticItemId(sample.getDiagnosticItem().getId());
        dto.setBarcode(sample.getBarcode());
        dto.setSampleType(sample.getSampleType());
        dto.setStatus(sample.getStatus());
        dto.setCollectedBy(sample.getCollectedBy());
        dto.setCollectedByName(sample.getCollectedByName());
        dto.setCollectedAt(sample.getCollectedAt());
        dto.setReceivedBy(sample.getReceivedBy());
        dto.setReceivedByName(sample.getReceivedByName());
        dto.setReceivedAt(sample.getReceivedAt());
        dto.setNotes(sample.getNotes());
        dto.setRejectionReason(sample.getRejectionReason());
        return dto;
    }
    
    private Sample convertToEntity(SampleDto dto) {
        Sample sample = new Sample();
        sample.setId(dto.getId());
        sample.setBarcode(dto.getBarcode());
        sample.setSampleType(dto.getSampleType());
        sample.setStatus(dto.getStatus());
        sample.setCollectedBy(dto.getCollectedBy());
        sample.setCollectedByName(dto.getCollectedByName());
        sample.setCollectedAt(dto.getCollectedAt());
        sample.setReceivedBy(dto.getReceivedBy());
        sample.setReceivedByName(dto.getReceivedByName());
        sample.setReceivedAt(dto.getReceivedAt());
        sample.setNotes(dto.getNotes());
        sample.setRejectionReason(dto.getRejectionReason());
        
        // Set diagnostic order
        if (dto.getDiagnosticOrderId() != null) {
            DiagnosticOrder order = diagnosticOrderRepository.findById(dto.getDiagnosticOrderId())
                .orElseThrow(() -> new RuntimeException("Diagnostic order not found: " + dto.getDiagnosticOrderId()));
            sample.setDiagnosticOrder(order);
        }
        
        // Set diagnostic item
        if (dto.getDiagnosticItemId() != null) {
            DiagnosticItem item = diagnosticItemRepository.findById(dto.getDiagnosticItemId())
                .orElseThrow(() -> new RuntimeException("Diagnostic item not found: " + dto.getDiagnosticItemId()));
            sample.setDiagnosticItem(item);
        }
        
        return sample;
    }
}
