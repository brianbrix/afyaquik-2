package com.afyaquik.hms.billing.domain;

/**
 * Enum representing the payment method.
 */
public enum PaymentMethod {
    CASH("Cash"),
    CARD("Card"),
    BANK_TRANSFER("Bank Transfer"),
    MOBILE_MONEY("Mobile Money"),
    INSURANCE("Insurance"),
    CHEQUE("Cheque"),
    OTHER("Other");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
