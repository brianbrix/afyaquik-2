package com.afyaquik.hms.appointment.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

/**
 * JPA Attribute Converter to handle timezone-aware database timestamps
 * and convert them to LocalDateTime for Java entities.
 */
@Converter(autoApply = true)
public class LocalDateTimeConverter implements AttributeConverter<LocalDateTime, OffsetDateTime> {

    @Override
    public OffsetDateTime convertToDatabaseColumn(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        // Convert LocalDateTime to OffsetDateTime with UTC timezone
        return localDateTime.atOffset(ZoneOffset.UTC);
    }

    @Override
    public LocalDateTime convertToEntityAttribute(OffsetDateTime offsetDateTime) {
        if (offsetDateTime == null) {
            return null;
        }
        // Convert OffsetDateTime to LocalDateTime, ignoring timezone
        return offsetDateTime.toLocalDateTime();
    }
}
