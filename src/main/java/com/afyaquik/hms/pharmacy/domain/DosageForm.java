package com.afyaquik.hms.pharmacy.domain;

public enum DosageForm {
    TABLET("Tablet"),
    CAPSULE("Capsule"),
    SYRUP("Syrup"),
    INJECTION("Injection"),
    CREAM("Cream"),
    OINTMENT("Ointment"),
    DROPS("Drops"),
    INHALER("Inhaler"),
    PATCH("Patch"),
    SUPPOSITORY("Suppository"),
    POWDER("Powder"),
    SOLUTION("Solution"),
    SUSPENSION("Suspension"),
    GEL("Gel"),
    LOTION("Lotion"),
    SPRAY("Spray"),
    FOAM("Foam"),
    PESSARY("Pessary"),
    ENEMA("Enema"),
    INHALATION_POWDER("Inhalation Powder"),
    NEBULIZER_SOLUTION("Nebulizer Solution"),
    TRANSDERMAL_PATCH("Transdermal Patch"),
    EYE_DROPS("Eye Drops"),
    EAR_DROPS("Ear Drops"),
    NASAL_DROPS("Nasal Drops"),
    MOUTHWASH("Mouthwash"),
    GARGLES("Gargles"),
    LOZENGES("Lozenges"),
    CHEWABLE_TABLET("Chewable Tablet"),
    DISPERSIBLE_TABLET("Dispersible Tablet"),
    SUSTAINED_RELEASE_TABLET("Sustained Release Tablet"),
    EXTENDED_RELEASE_TABLET("Extended Release Tablet"),
    IMMEDIATE_RELEASE_TABLET("Immediate Release Tablet"),
    DELAYED_RELEASE_TABLET("Delayed Release Tablet"),
    ENTERIC_COATED_TABLET("Enteric Coated Tablet"),
    FILM_COATED_TABLET("Film Coated Tablet"),
    OTHER("Other");

    private final String displayName;

    DosageForm(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}

