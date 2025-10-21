package com.afyaquik.hms.snapshot.domain;

import java.util.List;
import java.util.Map;

import com.afyaquik.hms.auth.domain.Department;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.pharmacy.domain.Medication;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import com.afyaquik.hms.scheduling.domain.StaffShift;

public class SnapshotData {
    
    private List<Patient> patients;
    private List<Map<String, Object>> staff;
    private List<Department> departments;
    private List<StaffShift> staffShifts;
    private List<Map<String, Object>> appointments;
    private List<Medication> medications;
    private List<VisitQueueItem> queueItems;
    private Map<String, Object> systemData;
    
    // Constructors
    public SnapshotData() {}
    
    // Getters and Setters
    public List<Patient> getPatients() {
        return patients;
    }
    
    public void setPatients(List<Patient> patients) {
        this.patients = patients;
    }
    
    public List<Map<String, Object>> getStaff() {
        return staff;
    }
    
    public void setStaff(List<Map<String, Object>> staff) {
        this.staff = staff;
    }
    
    public List<Department> getDepartments() {
        return departments;
    }
    
    public void setDepartments(List<Department> departments) {
        this.departments = departments;
    }
    
    public List<StaffShift> getStaffShifts() {
        return staffShifts;
    }
    
    public void setStaffShifts(List<StaffShift> staffShifts) {
        this.staffShifts = staffShifts;
    }
    
    public List<Map<String, Object>> getAppointments() {
        return appointments;
    }
    
    public void setAppointments(List<Map<String, Object>> appointments) {
        this.appointments = appointments;
    }
    
    public List<Medication> getMedications() {
        return medications;
    }
    
    public void setMedications(List<Medication> medications) {
        this.medications = medications;
    }
    
    public List<VisitQueueItem> getQueueItems() {
        return queueItems;
    }
    
    public void setQueueItems(List<VisitQueueItem> queueItems) {
        this.queueItems = queueItems;
    }
    
    public Map<String, Object> getSystemData() {
        return systemData;
    }
    
    public void setSystemData(Map<String, Object> systemData) {
        this.systemData = systemData;
    }
    
    // Utility methods
    public int getTotalRecords() {
        int total = 0;
        if (patients != null) total += patients.size();
        if (staff != null) total += staff.size();
        if (departments != null) total += departments.size();
        if (staffShifts != null) total += staffShifts.size();
        if (appointments != null) total += appointments.size();
        if (medications != null) total += medications.size();
        if (queueItems != null) total += queueItems.size();
        return total;
    }
    
    public boolean isEmpty() {
        return getTotalRecords() == 0;
    }
    
    @Override
    public String toString() {
        return "SnapshotData{" +
                "patients=" + (patients != null ? patients.size() : 0) +
                ", staff=" + (staff != null ? staff.size() : 0) +
                ", departments=" + (departments != null ? departments.size() : 0) +
                ", staffShifts=" + (staffShifts != null ? staffShifts.size() : 0) +
                ", appointments=" + (appointments != null ? appointments.size() : 0) +
                ", medications=" + (medications != null ? medications.size() : 0) +
                ", queueItems=" + (queueItems != null ? queueItems.size() : 0) +
                ", totalRecords=" + getTotalRecords() +
                '}';
    }
}
