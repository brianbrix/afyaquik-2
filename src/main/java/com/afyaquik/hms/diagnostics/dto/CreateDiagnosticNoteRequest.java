package com.afyaquik.hms.diagnostics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateDiagnosticNoteRequest {
    
    @NotNull(message = "Diagnostic item ID is required")
    private Long diagnosticItemId;
    
    @NotBlank(message = "Note text is required")
    private String noteText;
}
