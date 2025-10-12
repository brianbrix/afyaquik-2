package com.afyaquik.hms.scheduling.dto;

import java.time.LocalTime;

public record ShiftTypeDto(
    Long id,
    String name,
    String description,
    LocalTime startTime,
    LocalTime endTime
) {}
