package com.afyaquik.hms.diagnostics.dto;

import java.time.OffsetDateTime;

import lombok.Data;

@Data
public class DiagnosticNoteDto {
    private Long id;
    private Long diagnosticItemId;
    private String noteText;
    private String addedBy;
    private String addedByName;
    private OffsetDateTime addedAt;
}
