package com.afyaquik.hms.diagnostics.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.diagnostics.domain.DiagnosticNote;
import com.afyaquik.hms.diagnostics.dto.CreateDiagnosticNoteRequest;
import com.afyaquik.hms.diagnostics.dto.DiagnosticNoteDto;
import com.afyaquik.hms.diagnostics.repository.DiagnosticNoteRepository;

@Service
@Transactional
public class DiagnosticNoteService {

    @Autowired
    private DiagnosticNoteRepository diagnosticNoteRepository;

    public DiagnosticNoteDto createNote(CreateDiagnosticNoteRequest request) {
        DiagnosticNote note = new DiagnosticNote();
        note.setDiagnosticItemId(request.getDiagnosticItemId());
        note.setNoteText(request.getNoteText());
        note.setAddedAt(OffsetDateTime.now());
        note.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        
        // Get current user info
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            String username = authentication.getName();
            note.setAddedBy(username);
            note.setAddedByName(username); // TODO: Get display name from user service
        } else {
            note.setAddedBy("system");
            note.setAddedByName("System");
        }
        
        DiagnosticNote savedNote = diagnosticNoteRepository.save(note);
        return convertToDto(savedNote);
    }

    @Transactional(readOnly = true)
    public List<DiagnosticNoteDto> getNotesByDiagnosticItemId(Long diagnosticItemId) {
        return diagnosticNoteRepository.findByDiagnosticItemIdAndDeletedFalseOrderByAddedAtDesc(diagnosticItemId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DiagnosticNoteDto> getNotesByDiagnosticItemIds(List<Long> diagnosticItemIds) {
        return diagnosticNoteRepository.findByDiagnosticItemIdInAndDeletedFalseOrderByAddedAtDesc(diagnosticItemIds)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void deleteNote(Long noteId) {
        DiagnosticNote note = diagnosticNoteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));
        
        if (!note.getTenantId().equals(TenantHeaderInterceptor.getCurrentTenant())) {
            throw new SecurityException("Access denied to note in another tenant.");
        }
        
        note.softDelete();
        diagnosticNoteRepository.save(note);
    }

    private DiagnosticNoteDto convertToDto(DiagnosticNote note) {
        DiagnosticNoteDto dto = new DiagnosticNoteDto();
        dto.setId(note.getId());
        dto.setDiagnosticItemId(note.getDiagnosticItemId());
        dto.setNoteText(note.getNoteText());
        dto.setAddedBy(note.getAddedBy());
        dto.setAddedByName(note.getAddedByName());
        dto.setAddedAt(note.getAddedAt());
        return dto;
    }
}
