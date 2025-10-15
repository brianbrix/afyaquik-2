package com.afyaquik.hms.diagnostics.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.diagnostics.dto.CreateDiagnosticNoteRequest;
import com.afyaquik.hms.diagnostics.dto.DiagnosticNoteDto;
import com.afyaquik.hms.diagnostics.service.DiagnosticNoteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/diagnostics/notes")
public class DiagnosticNoteController {

    @Autowired
    private DiagnosticNoteService diagnosticNoteService;

    @PostMapping
    public ResponseEntity<ApiResponse<DiagnosticNoteDto>> createNote(@Valid @RequestBody CreateDiagnosticNoteRequest request) {
        try {
            DiagnosticNoteDto note = diagnosticNoteService.createNote(request);
            return ResponseEntity.ok(ApiResponse.success(note));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create note: " + e.getMessage()));
        }
    }

    @GetMapping("/diagnostic-item/{diagnosticItemId}")
    public ResponseEntity<ApiResponse<List<DiagnosticNoteDto>>> getNotesByDiagnosticItem(@PathVariable Long diagnosticItemId) {
        try {
            List<DiagnosticNoteDto> notes = diagnosticNoteService.getNotesByDiagnosticItemId(diagnosticItemId);
            return ResponseEntity.ok(ApiResponse.success(notes));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch notes: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable Long noteId) {
        try {
            diagnosticNoteService.deleteNote(noteId);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete note: " + e.getMessage()));
        }
    }
}
