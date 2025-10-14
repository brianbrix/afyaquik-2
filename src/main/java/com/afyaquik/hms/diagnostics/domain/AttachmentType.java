package com.afyaquik.hms.diagnostics.domain;

public enum AttachmentType {
    IMAGE("Image"),
    PDF("PDF"),
    DOCUMENT("Document"),
    AUDIO("Audio"),
    VIDEO("Video"),
    OTHER("Other");
    
    private final String displayName;
    
    AttachmentType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
