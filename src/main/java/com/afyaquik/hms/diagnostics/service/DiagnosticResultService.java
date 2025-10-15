package com.afyaquik.hms.diagnostics.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.diagnostics.domain.DiagnosticItem;
import com.afyaquik.hms.diagnostics.domain.DiagnosticOrder;
import com.afyaquik.hms.diagnostics.domain.DiagnosticResult;
import com.afyaquik.hms.diagnostics.domain.ResultTemplate;
import com.afyaquik.hms.diagnostics.domain.Sample;
import com.afyaquik.hms.diagnostics.dto.DiagnosticFileAttachmentDto;
import com.afyaquik.hms.diagnostics.dto.DiagnosticNoteDto;
import com.afyaquik.hms.diagnostics.dto.DiagnosticResultDto;
import com.afyaquik.hms.diagnostics.repository.DiagnosticFileAttachmentRepository;
import com.afyaquik.hms.diagnostics.repository.DiagnosticItemRepository;
import com.afyaquik.hms.diagnostics.repository.DiagnosticNoteRepository;
import com.afyaquik.hms.diagnostics.repository.DiagnosticOrderRepository;
import com.afyaquik.hms.diagnostics.repository.DiagnosticResultRepository;
import com.afyaquik.hms.diagnostics.repository.ResultTemplateRepository;
import com.afyaquik.hms.diagnostics.repository.SampleRepository;

@Service
@Transactional
public class DiagnosticResultService {
    
    private final DiagnosticResultRepository diagnosticResultRepository;
    private final DiagnosticOrderRepository diagnosticOrderRepository;
    private final DiagnosticItemRepository diagnosticItemRepository;
    private final SampleRepository sampleRepository;
    private final ResultTemplateRepository resultTemplateRepository;
    private final DiagnosticNoteRepository diagnosticNoteRepository;
    private final DiagnosticFileAttachmentRepository diagnosticFileAttachmentRepository;
    
    public DiagnosticResultService(DiagnosticResultRepository diagnosticResultRepository,
                                  DiagnosticOrderRepository diagnosticOrderRepository,
                                  DiagnosticItemRepository diagnosticItemRepository,
                                  SampleRepository sampleRepository,
                                  ResultTemplateRepository resultTemplateRepository,
                                  DiagnosticNoteRepository diagnosticNoteRepository,
                                  DiagnosticFileAttachmentRepository diagnosticFileAttachmentRepository) {
        this.diagnosticResultRepository = diagnosticResultRepository;
        this.diagnosticOrderRepository = diagnosticOrderRepository;
        this.diagnosticItemRepository = diagnosticItemRepository;
        this.sampleRepository = sampleRepository;
        this.resultTemplateRepository = resultTemplateRepository;
        this.diagnosticNoteRepository = diagnosticNoteRepository;
        this.diagnosticFileAttachmentRepository = diagnosticFileAttachmentRepository;
    }
    
    public List<DiagnosticResultDto> getAllDiagnosticResults() {
        List<DiagnosticResult> results = diagnosticResultRepository.findAll();
        return results.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<DiagnosticResultDto> getDiagnosticResultsByOrder(Long diagnosticOrderId) {
        List<DiagnosticResult> results = diagnosticResultRepository.findByDiagnosticOrderIdOrderByPerformedAtDesc(diagnosticOrderId);
        return results.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<DiagnosticResultDto> getDiagnosticResultsByItem(Long diagnosticItemId) {
        List<DiagnosticResult> results = diagnosticResultRepository.findByDiagnosticItemIdOrderByPerformedAtDesc(diagnosticItemId);
        return results.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<DiagnosticResultDto> getDiagnosticResultsByPatient(Long patientId) {
        List<DiagnosticResult> results = diagnosticResultRepository.findByPatientIdOrderByPerformedAtDesc(patientId);
        return results.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<DiagnosticResultDto> getDiagnosticResultsByQueueItem(Long queueItemId) {
        List<DiagnosticResult> results = diagnosticResultRepository.findByQueueItemIdOrderByPerformedAtDesc(queueItemId);
        return results.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<DiagnosticResultDto> getDiagnosticResultsByStatus(String status) {
        List<DiagnosticResult> results = diagnosticResultRepository.findByStatusOrderByPerformedAtDesc(
            com.afyaquik.hms.diagnostics.domain.ResultStatus.valueOf(status));
        return results.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public Optional<DiagnosticResultDto> getDiagnosticResultById(Long id) {
        return diagnosticResultRepository.findById(id).map(this::convertToDto);
    }
    
    public DiagnosticResultDto createDiagnosticResult(DiagnosticResultDto dto, String performedBy, String performedByName) {
        DiagnosticResult result = convertToEntity(dto);
        result.setPerformedBy(performedBy);
        result.setPerformedByName(performedByName);
        result.setPerformedAt(LocalDateTime.now());
        result.setStatus(com.afyaquik.hms.diagnostics.domain.ResultStatus.COMPLETED);
        result.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        
        // Set default values for validation fields to avoid NOT NULL constraint
        result.setValidatedBy("PENDING");
        result.setValidatedByName("PENDING");
        
        DiagnosticResult saved = diagnosticResultRepository.save(result);
        return convertToDto(saved);
    }
    
    public Optional<DiagnosticResultDto> updateDiagnosticResult(Long id, DiagnosticResultDto dto) {
        return diagnosticResultRepository.findById(id).map(existing -> {
            DiagnosticResult updated = convertToEntity(dto);
            updated.setId(id);
            updated.setTenantId(existing.getTenantId()); // Preserve existing tenant ID
            DiagnosticResult saved = diagnosticResultRepository.save(updated);
            return convertToDto(saved);
        });
    }
    
    public Optional<DiagnosticResultDto> validateDiagnosticResult(Long id, String validatedBy, String validatedByName, String validationNotes) {
        return diagnosticResultRepository.findById(id).map(result -> {
            result.setValidatedBy(validatedBy);
            result.setValidatedByName(validatedByName);
            result.setValidatedAt(LocalDateTime.now());
            result.setValidationNotes(validationNotes);
            result.setStatus(com.afyaquik.hms.diagnostics.domain.ResultStatus.VALIDATED);
            DiagnosticResult saved = diagnosticResultRepository.save(result);
            return convertToDto(saved);
        });
    }
    
    public boolean deleteDiagnosticResult(Long id) {
        if (!diagnosticResultRepository.existsById(id)) {
            return false;
        }
        diagnosticResultRepository.deleteById(id);
        return true;
    }
    
    private DiagnosticResultDto convertToDto(DiagnosticResult result) {
        DiagnosticResultDto dto = new DiagnosticResultDto();
        dto.setId(result.getId());
        dto.setDiagnosticOrderId(result.getDiagnosticOrder().getId());
        dto.setDiagnosticItemId(result.getDiagnosticItem().getId());
        dto.setSampleId(result.getSample() != null ? result.getSample().getId() : null);
        dto.setResultTemplateId(result.getResultTemplate() != null ? result.getResultTemplate().getId() : null);
        dto.setFieldName(result.getFieldName());
        dto.setFieldLabel(result.getFieldLabel());
        dto.setTestCatalogId(result.getTestCatalogId());
        dto.setStatus(result.getStatus());
        dto.setResultValue(result.getResultValue());
        dto.setResultText(result.getResultText());
        dto.setInterpretation(result.getInterpretation());
        dto.setComments(result.getComments());
        dto.setPerformedBy(result.getPerformedBy());
        dto.setPerformedByName(result.getPerformedByName());
        dto.setPerformedAt(result.getPerformedAt());
        dto.setValidatedBy(result.getValidatedBy());
        dto.setValidatedByName(result.getValidatedByName());
        dto.setValidatedAt(result.getValidatedAt());
        dto.setValidationNotes(result.getValidationNotes());
        
        // Set item notes and files from the diagnostic item
        DiagnosticItem diagnosticItem = result.getDiagnosticItem();
        if (diagnosticItem != null) {
            dto.setItemNotes(diagnosticItem.getNotes());
            
            // Load notes for this diagnostic item
            List<DiagnosticNoteDto> notes = diagnosticNoteRepository.findByDiagnosticItemIdAndDeletedFalseOrderByAddedAtDesc(diagnosticItem.getId())
                .stream()
                .map(this::convertNoteToDto)
                .collect(Collectors.toList());
            dto.setItemNotesList(notes);
            
            // Load files for this diagnostic item
            List<DiagnosticFileAttachmentDto> files = diagnosticFileAttachmentRepository.findByDiagnosticItemIdAndDeletedFalseOrderByUploadedAtDesc(diagnosticItem.getId())
                .stream()
                .map(this::convertFileToDto)
                .collect(Collectors.toList());
            dto.setItemFiles(files);
        }
        
        return dto;
    }
    
    private DiagnosticResult convertToEntity(DiagnosticResultDto dto) {
        DiagnosticResult result = new DiagnosticResult();
        result.setId(dto.getId());
        result.setStatus(dto.getStatus());
        result.setFieldName(dto.getFieldName());
        result.setFieldLabel(dto.getFieldLabel());
        result.setTestCatalogId(dto.getTestCatalogId());
        result.setResultValue(dto.getResultValue());
        result.setResultText(dto.getResultText());
        result.setInterpretation(dto.getInterpretation());
        result.setComments(dto.getComments());
        result.setPerformedBy(dto.getPerformedBy());
        result.setPerformedByName(dto.getPerformedByName());
        result.setPerformedAt(dto.getPerformedAt());
        result.setValidatedBy(dto.getValidatedBy() != null ? dto.getValidatedBy() : "PENDING");
        result.setValidatedByName(dto.getValidatedByName() != null ? dto.getValidatedByName() : "PENDING");
        result.setValidatedAt(dto.getValidatedAt());
        result.setValidationNotes(dto.getValidationNotes());
        
        // Set diagnostic order
        if (dto.getDiagnosticOrderId() != null) {
            DiagnosticOrder order = diagnosticOrderRepository.findById(dto.getDiagnosticOrderId())
                .orElseThrow(() -> new RuntimeException("Diagnostic order not found: " + dto.getDiagnosticOrderId()));
            result.setDiagnosticOrder(order);
        }
        
        // Set diagnostic item
        if (dto.getDiagnosticItemId() != null) {
            DiagnosticItem item = diagnosticItemRepository.findById(dto.getDiagnosticItemId())
                .orElseThrow(() -> new RuntimeException("Diagnostic item not found: " + dto.getDiagnosticItemId()));
            result.setDiagnosticItem(item);
        }
        
        // Set sample
        if (dto.getSampleId() != null) {
            Sample sample = sampleRepository.findById(dto.getSampleId())
                .orElseThrow(() -> new RuntimeException("Sample not found: " + dto.getSampleId()));
            result.setSample(sample);
        }
        
        // Set result template
        if (dto.getResultTemplateId() != null) {
            ResultTemplate template = resultTemplateRepository.findById(dto.getResultTemplateId())
                .orElseThrow(() -> new RuntimeException("Result template not found: " + dto.getResultTemplateId()));
            result.setResultTemplate(template);
        }
        
        return result;
    }
    
    private DiagnosticNoteDto convertNoteToDto(com.afyaquik.hms.diagnostics.domain.DiagnosticNote note) {
        DiagnosticNoteDto dto = new DiagnosticNoteDto();
        dto.setId(note.getId());
        dto.setDiagnosticItemId(note.getDiagnosticItemId());
        dto.setNoteText(note.getNoteText());
        dto.setAddedBy(note.getAddedBy());
        dto.setAddedByName(note.getAddedByName());
        dto.setAddedAt(note.getAddedAt());
        return dto;
    }
    
    private DiagnosticFileAttachmentDto convertFileToDto(com.afyaquik.hms.diagnostics.domain.DiagnosticFileAttachment file) {
        DiagnosticFileAttachmentDto dto = new DiagnosticFileAttachmentDto();
        dto.setId(file.getId());
        dto.setDiagnosticItemId(file.getDiagnosticItemId());
        dto.setOriginalFilename(file.getOriginalFilename());
        dto.setObjectName(file.getObjectName());
        dto.setFileSize(file.getFileSize());
        dto.setContentType(file.getContentType());
        dto.setFileUrl(file.getFileUrl());
        dto.setUploadedBy(file.getUploadedBy());
        dto.setUploadedByName(file.getUploadedByName());
        dto.setUploadedAt(file.getUploadedAt());
        return dto;
    }
}
