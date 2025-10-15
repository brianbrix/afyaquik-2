package com.afyaquik.hms.billing.domain;

public enum PaymentMethodType {
    CASH("Cash"),
    CREDIT_CARD("Credit Card"),
    DEBIT_CARD("Debit Card"),
    MOBILE_MONEY("Mobile Money"),
    BANK_TRANSFER("Bank Transfer"),
    INSURANCE("Insurance"),
    CHEQUE("Cheque"),
    OTHER("Other");

    private final String displayName;

    PaymentMethodType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
