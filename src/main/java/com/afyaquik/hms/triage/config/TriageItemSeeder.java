package com.afyaquik.hms.triage.config;

import com.afyaquik.hms.triage.domain.TriageItem;
import com.afyaquik.hms.triage.repository.TriageItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TriageItemSeeder implements CommandLineRunner {

    private final TriageItemRepository triageItemRepository;

    @Override
    public void run(String... args) throws Exception {
        seedTriageItems();
    }

    private void seedTriageItems() {
        String tenantId = "clinic-a";
        
        // Check if triage items already exist
        if (triageItemRepository.findByTenantIdAndActiveTrueAndDeletedFalseOrderByDisplayOrderAsc(tenantId).isEmpty()) {
            log.info("Seeding triage items for tenant: {}", tenantId);
            
            List<TriageItem> triageItems = Arrays.asList(
                // Vital Signs
                createTriageItem("Body Temperature", "Core body temperature measurement", "Vital Signs", 
                    TriageItem.TriageDataType.NUMERIC, "°C", "{\"min\": 30, \"max\": 45, \"step\": 0.1}", 
                    true, 1, 36.0, 37.5, 35.0, 38.0, 34.0, 39.0, "Temperature", "Normal: 36-37.5°C"),
                
                createTriageItem("Heart Rate", "Pulse rate per minute", "Vital Signs", 
                    TriageItem.TriageDataType.NUMERIC, "bpm", "{\"min\": 30, \"max\": 200, \"step\": 1}", 
                    true, 2, 60.0, 100.0, 50.0, 110.0, 40.0, 120.0, "Heart Rate", "Normal: 60-100 bpm"),
                
                createTriageItem("Blood Pressure (Systolic)", "Systolic blood pressure", "Vital Signs", 
                    TriageItem.TriageDataType.NUMERIC, "mmHg", "{\"min\": 70, \"max\": 250, \"step\": 1}", 
                    true, 3, 90.0, 140.0, 80.0, 160.0, 70.0, 180.0, "Systolic BP", "Normal: 90-140 mmHg"),
                
                createTriageItem("Blood Pressure (Diastolic)", "Diastolic blood pressure", "Vital Signs", 
                    TriageItem.TriageDataType.NUMERIC, "mmHg", "{\"min\": 40, \"max\": 150, \"step\": 1}", 
                    true, 4, 60.0, 90.0, 50.0, 100.0, 40.0, 110.0, "Diastolic BP", "Normal: 60-90 mmHg"),
                
                createTriageItem("Respiratory Rate", "Breaths per minute", "Vital Signs", 
                    TriageItem.TriageDataType.NUMERIC, "bpm", "{\"min\": 8, \"max\": 40, \"step\": 1}", 
                    true, 5, 12.0, 20.0, 10.0, 24.0, 8.0, 30.0, "Respiratory Rate", "Normal: 12-20 bpm"),
                
                createTriageItem("Oxygen Saturation", "Blood oxygen saturation", "Vital Signs", 
                    TriageItem.TriageDataType.NUMERIC, "%", "{\"min\": 70, \"max\": 100, \"step\": 1}", 
                    true, 6, 95.0, 100.0, 90.0, 100.0, 85.0, 100.0, "SpO2", "Normal: 95-100%"),
                
                // Pain Assessment
                createTriageItem("Pain Level", "Patient reported pain intensity", "Pain Assessment", 
                    TriageItem.TriageDataType.NUMERIC, "0-10", "{\"min\": 0, \"max\": 10, \"step\": 1}", 
                    true, 7, 0.0, 3.0, 4.0, 6.0, 7.0, 10.0, "Pain Scale", "0-3: Mild, 4-6: Moderate, 7-10: Severe"),
                
                createTriageItem("Pain Location", "Location of pain", "Pain Assessment", 
                    TriageItem.TriageDataType.SELECT, null, "{\"options\": [\"Head\", \"Chest\", \"Abdomen\", \"Back\", \"Extremities\", \"Other\"]}", 
                    true, 8, null, null, null, null, null, null, null, "Pain Location"),
                
                // Mental Status
                createTriageItem("Glasgow Coma Scale", "Level of consciousness", "Mental Status", 
                    TriageItem.TriageDataType.NUMERIC, "3-15", "{\"min\": 3, \"max\": 15, \"step\": 1}", 
                    true, 9, 13.0, 15.0, 9.0, 12.0, 3.0, 8.0, "GCS", "13-15: Mild, 9-12: Moderate, 3-8: Severe"),
                
                createTriageItem("Alertness", "Patient alertness level", "Mental Status", 
                    TriageItem.TriageDataType.SELECT, null, "{\"options\": [\"Alert\", \"Drowsy\", \"Confused\", \"Unresponsive\"]}", 
                    true, 10, null, null, null, null, null, null, null, "Alertness Level"),
                
                // Physical Assessment
                createTriageItem("Weight", "Patient weight", "Physical Assessment", 
                    TriageItem.TriageDataType.NUMERIC, "kg", "{\"min\": 10, \"max\": 300, \"step\": 0.1}", 
                    true, 11, null, null, null, null, null, null, null, "Weight in kg"),
                
                createTriageItem("Height", "Patient height", "Physical Assessment", 
                    TriageItem.TriageDataType.NUMERIC, "cm", "{\"min\": 50, \"max\": 250, \"step\": 1}", 
                    true, 12, null, null, null, null, null, null, null, "Height in cm"),
                
                createTriageItem("BMI", "Body Mass Index", "Physical Assessment", 
                    TriageItem.TriageDataType.NUMERIC, "kg/m²", "{\"min\": 10, \"max\": 60, \"step\": 0.1}", 
                    true, 13, 18.5, 24.9, 17.0, 29.9, 15.0, 35.0, "BMI = weight(kg) / height(m)²", "Normal: 18.5-24.9"),
                
                // Symptoms
                createTriageItem("Nausea", "Presence of nausea", "Symptoms", 
                    TriageItem.TriageDataType.BOOLEAN, null, null, 
                    true, 14, null, null, null, null, null, null, null, "Nausea present"),
                
                createTriageItem("Vomiting", "Presence of vomiting", "Symptoms", 
                    TriageItem.TriageDataType.BOOLEAN, null, null, 
                    true, 15, null, null, null, null, null, null, null, "Vomiting present"),
                
                createTriageItem("Dizziness", "Presence of dizziness", "Symptoms", 
                    TriageItem.TriageDataType.BOOLEAN, null, null, 
                    true, 16, null, null, null, null, null, null, null, "Dizziness present"),
                
                createTriageItem("Shortness of Breath", "Difficulty breathing", "Symptoms", 
                    TriageItem.TriageDataType.SELECT, null, "{\"options\": [\"None\", \"Mild\", \"Moderate\", \"Severe\"]}", 
                    true, 17, null, null, null, null, null, null, null, "Breathing difficulty level"),
                
                // Calculations
                createTriageItem("Mean Arterial Pressure", "Calculated MAP", "Calculations", 
                    TriageItem.TriageDataType.NUMERIC, "mmHg", "{\"min\": 40, \"max\": 150, \"step\": 1}", 
                    true, 18, 70.0, 100.0, 60.0, 110.0, 50.0, 120.0, "MAP = (2×DBP + SBP) / 3", "Normal: 70-100 mmHg"),
                
                createTriageItem("Shock Index", "Heart rate / Systolic BP", "Calculations", 
                    TriageItem.TriageDataType.NUMERIC, null, "{\"min\": 0.3, \"max\": 2.0, \"step\": 0.01}", 
                    true, 19, 0.5, 0.7, 0.4, 0.9, 0.3, 1.0, "SI = HR / SBP", "Normal: 0.5-0.7"),
                
                createTriageItem("Modified Early Warning Score", "MEWS calculation", "Calculations", 
                    TriageItem.TriageDataType.NUMERIC, "0-17", "{\"min\": 0, \"max\": 17, \"step\": 1}", 
                    true, 20, 0.0, 2.0, 3.0, 4.0, 5.0, 17.0, "MEWS", "0-2: Low risk, 3-4: Medium risk, 5+: High risk"),
                
                createTriageItem("Triage Priority", "Overall triage priority", "Calculations", 
                    TriageItem.TriageDataType.SELECT, null, "{\"options\": [\"Immediate\", \"High\", \"Medium\", \"Low\"]}", 
                    true, 21, null, null, null, null, null, null, null, "Triage Priority Level")
            );
            
            triageItemRepository.saveAll(triageItems);
            log.info("Successfully seeded {} triage items for tenant: {}", triageItems.size(), tenantId);
        } else {
            log.info("Triage items already exist for tenant: {}", tenantId);
        }
    }

    private TriageItem createTriageItem(String name, String description, String category, 
                                       TriageItem.TriageDataType dataType, String unit, String inputConfig,
                                       Boolean active, Integer displayOrder, 
                                       Double normalRangeMin, Double normalRangeMax,
                                       Double warningThresholdMin, Double warningThresholdMax,
                                       Double criticalThresholdMin, Double criticalThresholdMax,
                                       String calculationFormula, String assessmentNotes) {
        TriageItem item = new TriageItem();
        item.setTenantId("clinic-a");
        item.setName(name);
        item.setDescription(description);
        item.setCategory(category);
        item.setDataType(dataType);
        item.setUnit(unit);
        item.setInputConfig(inputConfig);
        item.setActive(active);
        item.setDisplayOrder(displayOrder);
        item.setNormalRangeMin(normalRangeMin);
        item.setNormalRangeMax(normalRangeMax);
        item.setWarningThresholdMin(warningThresholdMin);
        item.setWarningThresholdMax(warningThresholdMax);
        item.setCriticalThresholdMin(criticalThresholdMin);
        item.setCriticalThresholdMax(criticalThresholdMax);
        item.setCalculationFormula(calculationFormula);
        return item;
    }
}