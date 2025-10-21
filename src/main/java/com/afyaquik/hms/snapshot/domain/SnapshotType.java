package com.afyaquik.hms.snapshot.domain;

public enum SnapshotType {
    FULL,           // Complete snapshot of all essential data
    INCREMENTAL,    // Only changed data since last snapshot
    EMERGENCY,      // Emergency snapshot for critical updates
    VERIFICATION    // Verification snapshot to ensure data consistency
}
