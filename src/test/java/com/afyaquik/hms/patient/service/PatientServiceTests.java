package com.afyaquik.hms.patient.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.afyaquik.hms.patient.api.CreatePatientRequest;
import com.afyaquik.hms.patient.api.PatientResponse;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.repository.PatientRepository;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

@DataJpaTest
@Import(PatientService.class)
class PatientServiceTests {

    @Autowired
    private PatientService patientService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private VisitQueueItemRepository queueRepository;

    @BeforeEach
    void clearDb() {
        queueRepository.deleteAll();
        patientRepository.deleteAll();
    }

    @Test
    void registerPersistsPatientAndQueue() {
        CreatePatientRequest request = new CreatePatientRequest(
                "MRN-123",
                "John",
                "Doe",
                null,
                null,
                LocalDate.of(1985, 3, 25),
                "ID-456",
                "MALE",
                "Fever and cough",
                "NORMAL" ,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        PatientResponse response = patientService.register("tenantA", request);

        assertThat(response.medicalRecordNumber()).isEqualTo("MRN-123");
        assertThat(response.ticketNumber()).isNotBlank();
        assertThat(queueRepository.findAll()).hasSize(1);
    Patient saved = patientRepository.findAll().get(0);
        assertThat(saved.getTenantId()).isEqualTo("tenantA");
    }

    @Test
    void registerDuplicateMrnThrowsConflict() {
        CreatePatientRequest request = new CreatePatientRequest(
                "MRN-123",
                "John",
                "Doe",
                null,
                null,
                LocalDate.of(1985, 3, 25),
                "ID-456",
                "MALE",
                "Fever and cough",
                "NORMAL" ,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        patientService.register("tenantA", request);

        assertThatThrownBy(() -> patientService.register("tenantA", request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Patient with MRN already exists");
    }
}
