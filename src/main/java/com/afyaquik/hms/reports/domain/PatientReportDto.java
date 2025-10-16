package com.afyaquik.hms.reports.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for JPQL patient report queries.
 * This class is specifically designed for JPQL constructor expressions.
 */
public class PatientReportDto {
    
    private String medicalRecordNumber;
    private String patientName;
    private String phone;
    private String email;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String city;
    private String state;
    private String country;
    private LocalDateTime registrationDate;
    private LocalDateTime lastVisitDate;
    private int totalVisits;
    private int totalBills;
    private String lastDepartment;
    private String status;
    
    // Constructor for JPQL queries
    public PatientReportDto(String medicalRecordNumber, String patientName, String phone, String email,
                           LocalDate dateOfBirth, String gender, String address, String city, String state, String country,
                           LocalDateTime registrationDate, LocalDateTime lastVisitDate, int totalVisits, int totalBills,
                           String lastDepartment, String status) {
        this.medicalRecordNumber = medicalRecordNumber;
        this.patientName = patientName;
        this.phone = phone;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.address = address;
        this.city = city;
        this.state = state;
        this.country = country;
        this.registrationDate = registrationDate;
        this.lastVisitDate = lastVisitDate;
        this.totalVisits = totalVisits;
        this.totalBills = totalBills;
        this.lastDepartment = lastDepartment;
        this.status = status;
    }
    
    // Getters
    public String getMedicalRecordNumber() { return medicalRecordNumber; }
    public String getPatientName() { return patientName; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public String getGender() { return gender; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
    public String getState() { return state; }
    public String getCountry() { return country; }
    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public LocalDateTime getLastVisitDate() { return lastVisitDate; }
    public int getTotalVisits() { return totalVisits; }
    public int getTotalBills() { return totalBills; }
    public String getLastDepartment() { return lastDepartment; }
    public String getStatus() { return status; }
    
    // Convert to PatientReport
    public PatientReport toPatientReport() {
        return PatientReport.builder()
                .medicalRecordNumber(medicalRecordNumber)
                .patientName(patientName)
                .phone(phone)
                .email(email)
                .dateOfBirth(dateOfBirth)
                .gender(gender)
                .address(address)
                .city(city)
                .state(state)
                .country(country)
                .registrationDate(registrationDate)
                .lastVisitDate(lastVisitDate)
                .totalVisits(totalVisits)
                .totalBills(totalBills)
                .lastDepartment(lastDepartment)
                .status(status)
                .recentVisits(null)
                .recentBills(null)
                .build();
    }
}
