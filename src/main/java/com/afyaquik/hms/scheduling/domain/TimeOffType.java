package com.afyaquik.hms.scheduling.domain;

public enum TimeOffType {
    VACATION("Vacation"),
    SICK_LEAVE("Sick Leave"),
    PERSONAL_LEAVE("Personal Leave"),
    EMERGENCY_LEAVE("Emergency Leave"),
    MATERNITY_LEAVE("Maternity Leave"),
    PATERNITY_LEAVE("Paternity Leave"),
    BEREAVEMENT_LEAVE("Bereavement Leave"),
    STUDY_LEAVE("Study Leave"),
    UNPAID_LEAVE("Unpaid Leave"),
    OTHER("Other");

    private final String displayName;

    TimeOffType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
