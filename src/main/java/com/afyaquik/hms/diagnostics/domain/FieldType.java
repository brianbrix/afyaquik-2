package com.afyaquik.hms.diagnostics.domain;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

@JsonDeserialize(using = FieldTypeDeserializer.class)
public enum FieldType {
    TEXT("Text"),
    NUMBER("Number"),
    DECIMAL("Decimal"),
    BOOLEAN("Boolean"),
    DATE("Date"),
    TIME("Time"),
    DATETIME("DateTime"),
    DROPDOWN("Dropdown"),
    MULTI_SELECT("Multi Select"),
    TEXTAREA("Text Area"),
    RICH_TEXT("Rich Text"),
    FILE("File"),
    IMAGE("Image");
    
    private final String displayName;
    
    FieldType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
