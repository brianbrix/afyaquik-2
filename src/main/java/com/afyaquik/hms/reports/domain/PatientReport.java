package com.afyaquik.hms.reports.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Patient-specific report data.
 */
@Data
@NoArgsConstructor
public class PatientReport {
    
    // Constructor for JPQL queries
    public PatientReport(String medicalRecordNumber, String patientName, String phone, String email,
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
        this.recentVisits = null;
        this.recentBills = null;
    }
    
    // Builder method
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
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
        private List<VisitSummary> recentVisits;
        private List<BillSummary> recentBills;
        
        public Builder medicalRecordNumber(String medicalRecordNumber) {
            this.medicalRecordNumber = medicalRecordNumber;
            return this;
        }
        
        public Builder patientName(String patientName) {
            this.patientName = patientName;
            return this;
        }
        
        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }
        
        public Builder email(String email) {
            this.email = email;
            return this;
        }
        
        public Builder dateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
            return this;
        }
        
        public Builder gender(String gender) {
            this.gender = gender;
            return this;
        }
        
        public Builder address(String address) {
            this.address = address;
            return this;
        }
        
        public Builder city(String city) {
            this.city = city;
            return this;
        }
        
        public Builder state(String state) {
            this.state = state;
            return this;
        }
        
        public Builder country(String country) {
            this.country = country;
            return this;
        }
        
        public Builder registrationDate(LocalDateTime registrationDate) {
            this.registrationDate = registrationDate;
            return this;
        }
        
        public Builder lastVisitDate(LocalDateTime lastVisitDate) {
            this.lastVisitDate = lastVisitDate;
            return this;
        }
        
        public Builder totalVisits(int totalVisits) {
            this.totalVisits = totalVisits;
            return this;
        }
        
        public Builder totalBills(int totalBills) {
            this.totalBills = totalBills;
            return this;
        }
        
        public Builder lastDepartment(String lastDepartment) {
            this.lastDepartment = lastDepartment;
            return this;
        }
        
        public Builder status(String status) {
            this.status = status;
            return this;
        }
        
        public Builder recentVisits(List<VisitSummary> recentVisits) {
            this.recentVisits = recentVisits;
            return this;
        }
        
        public Builder recentBills(List<BillSummary> recentBills) {
            this.recentBills = recentBills;
            return this;
        }
        
        public PatientReport build() {
            PatientReport report = new PatientReport();
            report.medicalRecordNumber = this.medicalRecordNumber;
            report.patientName = this.patientName;
            report.phone = this.phone;
            report.email = this.email;
            report.dateOfBirth = this.dateOfBirth;
            report.gender = this.gender;
            report.address = this.address;
            report.city = this.city;
            report.state = this.state;
            report.country = this.country;
            report.registrationDate = this.registrationDate;
            report.lastVisitDate = this.lastVisitDate;
            report.totalVisits = this.totalVisits;
            report.totalBills = this.totalBills;
            report.lastDepartment = this.lastDepartment;
            report.status = this.status;
            report.recentVisits = this.recentVisits;
            report.recentBills = this.recentBills;
            return report;
        }
    }
    
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
    private List<VisitSummary> recentVisits;
    private List<BillSummary> recentBills;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisitSummary {
        private LocalDateTime visitDate;
        private String department;
        private String doctor;
        private String status;
        private String diagnosis;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BillSummary {
        private String billNumber;
        private LocalDateTime billDate;
        private String status;
        private String amount;
        private String paidAmount;
        private String balance;
    }
}
