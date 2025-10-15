package com.afyaquik.hms.scheduling.dto;

import com.afyaquik.hms.scheduling.domain.TimeOffStatus;
import com.afyaquik.hms.scheduling.domain.TimeOffType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TimeOffRequestDto(
        Long id,
        Long userId,
        String userDisplayName,
        Long supervisorId,
        String supervisorDisplayName,
        TimeOffType requestType,
        LocalDate startDate,
        LocalDate endDate,
        Integer totalDays,
        String reason,
        TimeOffStatus status,
        LocalDateTime submittedAt,
        LocalDateTime reviewedAt,
        Long reviewedBy,
        String reviewerDisplayName,
        String reviewNotes,
        String emergencyContact,
        String emergencyPhone
) {}
