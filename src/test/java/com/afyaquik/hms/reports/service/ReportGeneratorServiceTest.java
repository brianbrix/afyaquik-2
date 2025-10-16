package com.afyaquik.hms.reports.service;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.afyaquik.hms.analytics.domain.AnalyticsMetrics;
import com.afyaquik.hms.analytics.service.AnalyticsService;
import com.afyaquik.hms.reports.domain.ReportRequest;
import com.afyaquik.hms.reports.domain.ReportResponse;

@ExtendWith(MockitoExtension.class)
class ReportGeneratorServiceTest {

    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private ReportGeneratorService reportGeneratorService;

    private ReportRequest reportRequest;
    private AnalyticsMetrics analyticsMetrics;

    @BeforeEach
    void setUp() {
        reportRequest = ReportRequest.builder()
            .reportType("COMPREHENSIVE")
            .startDate(LocalDate.now().minusDays(30))
            .endDate(LocalDate.now())
            .format("JSON")
            .includeCharts(true)
            .build();

        analyticsMetrics = AnalyticsMetrics.builder()
            .systemOverview(AnalyticsMetrics.SystemOverview.builder()
                .totalUsers(100)
                .activeUsers(80)
                .totalPatients(500)
                .totalBills(200)
                .totalRevenue(BigDecimal.valueOf(50000))
                .systemUptime("99.9%")
                .build())
            .build();
    }

    @Test
    void generateComprehensiveReport_Success() {
        // Given
        when(analyticsService.getSystemAnalytics()).thenReturn(analyticsMetrics);

        // When
        ReportResponse response = reportGeneratorService.generateComprehensiveReport(reportRequest);

        // Then
        assertNotNull(response);
        assertEquals("COMPREHENSIVE", response.getReportType());
        assertEquals("Comprehensive System Report", response.getTitle());
        assertEquals("COMPLETED", response.getStatus());
        assertNotNull(response.getSummary());
        assertNotNull(response.getSections());
        assertFalse(response.getSections().isEmpty());
        
        verify(analyticsService).getSystemAnalytics();
    }

    @Test
    void generateComprehensiveReport_NullAnalytics() {
        // Given
        when(analyticsService.getSystemAnalytics()).thenReturn(null);

        // When
        ReportResponse response = reportGeneratorService.generateComprehensiveReport(reportRequest);

        // Then
        assertNotNull(response);
        assertEquals("ERROR", response.getReportType());
        assertEquals("Report Generation Error", response.getTitle());
        assertEquals("FAILED", response.getStatus());
        assertTrue(response.getSections().get(0).getSectionTitle().equals("Error"));
        
        verify(analyticsService).getSystemAnalytics();
    }

    @Test
    void generateComprehensiveReport_Exception() {
        // Given
        when(analyticsService.getSystemAnalytics()).thenThrow(new RuntimeException("Database error"));

        // When
        ReportResponse response = reportGeneratorService.generateComprehensiveReport(reportRequest);

        // Then
        assertNotNull(response);
        assertEquals("ERROR", response.getReportType());
        assertEquals("Report Generation Error", response.getTitle());
        assertEquals("FAILED", response.getStatus());
        assertTrue(response.getSections().get(0).getData().get(0).getValue().toString().contains("Database error"));
        
        verify(analyticsService).getSystemAnalytics();
    }
}
