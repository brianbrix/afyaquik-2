package com.afyaquik.hms.pharmacy.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;

public class DosageFormTest {

    @Test
    public void testDosageFormValues() {
        // Test that all expected dosage forms are present
        assertNotNull(DosageForm.TABLET);
        assertNotNull(DosageForm.CAPSULE);
        assertNotNull(DosageForm.SYRUP);
        assertNotNull(DosageForm.INJECTION);
        assertNotNull(DosageForm.CREAM);
        assertNotNull(DosageForm.OTHER);
    }

    @Test
    public void testDisplayNames() {
        assertEquals("Tablet", DosageForm.TABLET.getDisplayName());
        assertEquals("Capsule", DosageForm.CAPSULE.getDisplayName());
        assertEquals("Syrup", DosageForm.SYRUP.getDisplayName());
        assertEquals("Injection", DosageForm.INJECTION.getDisplayName());
        assertEquals("Other", DosageForm.OTHER.getDisplayName());
    }

    @Test
    public void testToString() {
        assertEquals("Tablet", DosageForm.TABLET.toString());
        assertEquals("Capsule", DosageForm.CAPSULE.toString());
        assertEquals("Other", DosageForm.OTHER.toString());
    }
}

