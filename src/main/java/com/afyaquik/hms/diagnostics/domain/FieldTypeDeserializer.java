package com.afyaquik.hms.diagnostics.domain;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

public class FieldTypeDeserializer extends JsonDeserializer<FieldType> {
    
    @Override
    public FieldType deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        if (value == null) {
            return null;
        }
        
        try {
            return FieldType.valueOf(value);
        } catch (IllegalArgumentException e) {
            // If the value doesn't match any enum constant, try to find by display name
            for (FieldType type : FieldType.values()) {
                if (type.getDisplayName().equals(value)) {
                    return type;
                }
            }
            throw new IOException("Invalid FieldType value: " + value, e);
        }
    }
}
