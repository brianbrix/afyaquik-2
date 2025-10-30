import { localDatabaseService, LocalPatient, LocalStaff, LocalDepartment, LocalAppointment, LocalMedication, LocalQueueItem } from './localDatabase';

export interface SearchResult<T> {
  data: T[];
  source: 'local' | 'server';
  total: number;
  timestamp: number;
}

export interface PatientSearchResult {
  id: number;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  displayName: string;
}

export interface StaffSearchResult {
  id: number;
  username: string;
  displayName: string;
  email: string;
  roles: string[];
}

export interface DepartmentSearchResult {
  id: number;
  name: string;
  description?: string;
}

export interface AppointmentSearchResult {
  id: number;
  patientId: number;
  patientName: string;
  providerId: number;
  providerName: string;
  appointmentDate: string;
  startTime: string;
  status: string;
  reason: string;
}

export interface MedicationSearchResult {
  id: number;
  name: string;
  description?: string;
  dosage?: string;
  unit?: string;
}

export interface QueueItemSearchResult {
  id: number;
  patientId: number;
  patientName: string;
  currentStatus: string;
  visitReason: string;
  priority: string;
  createdAt: string;
}

class LocalSearchService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await localDatabaseService.initialize();
    this.isInitialized = true;
  }

  /**
   * Search patients locally
   */
  async searchPatients(query: string): Promise<SearchResult<PatientSearchResult>> {
    await this.initialize();
    
    const startTime = Date.now();
    const patients = await localDatabaseService.searchPatients(query);
    
    const results: PatientSearchResult[] = patients.map(patient => ({
      id: patient.id,
      medicalRecordNumber: patient.medicalRecordNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone,
      email: patient.email,
      displayName: `${patient.firstName} ${patient.lastName}`
    }));

    return {
      data: results,
      source: 'local',
      total: results.length,
      timestamp: Date.now() - startTime
    };
  }

  /**
   * Search staff locally
   */
  async searchStaff(query: string): Promise<SearchResult<StaffSearchResult>> {
    await this.initialize();
    
    const startTime = Date.now();
    const staff = await localDatabaseService.searchStaff(query);
    
    const results: StaffSearchResult[] = staff.map(member => ({
      id: member.id,
      username: member.username,
      displayName: member.displayName,
      email: member.email,
      roles: member.roles
    }));

    return {
      data: results,
      source: 'local',
      total: results.length,
      timestamp: Date.now() - startTime
    };
  }

  /**
   * Get all departments locally
   */
  async getDepartments(): Promise<SearchResult<DepartmentSearchResult>> {
    await this.initialize();
    
    const startTime = Date.now();
    const departments = await localDatabaseService.getDepartments();
    
    const results: DepartmentSearchResult[] = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description
    }));

    return {
      data: results,
      source: 'local',
      total: results.length,
      timestamp: Date.now() - startTime
    };
  }

  /**
   * Search appointments locally
   */
  async searchAppointments(query: string, startDate?: string, endDate?: string): Promise<SearchResult<AppointmentSearchResult>> {
    await this.initialize();
    
    const startTime = Date.now();
    let appointments: LocalAppointment[] = [];
    
    if (startDate && endDate) {
      appointments = await localDatabaseService.getAppointmentsByDateRange(startDate, endDate);
    } else {
      // For now, get all appointments and filter by query
      // In a real implementation, you'd want to add query support to the database
      appointments = await localDatabaseService.getAppointmentsByDateRange(
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      );
    }
    
    // Filter by query if provided
    if (query) {
      appointments = appointments.filter(apt => 
        apt.reason.toLowerCase().includes(query.toLowerCase()) ||
        apt.notes?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    const results: AppointmentSearchResult[] = appointments.map(appointment => ({
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: 'Unknown Patient', // Would need to join with patients table
      providerId: appointment.providerId,
      providerName: 'Unknown Provider', // Would need to join with staff table
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      status: appointment.status,
      reason: appointment.reason
    }));

    return {
      data: results,
      source: 'local',
      total: results.length,
      timestamp: Date.now() - startTime
    };
  }

  /**
   * Search medications locally
   */
  async searchMedications(query: string): Promise<SearchResult<MedicationSearchResult>> {
    await this.initialize();
    
    const startTime = Date.now();
    const medications = await localDatabaseService.searchMedications(query);
    
    const results: MedicationSearchResult[] = medications.map(med => ({
      id: med.id,
      name: med.name,
      description: med.description,
      dosage: med.dosage,
      unit: med.unit
    }));

    return {
      data: results,
      source: 'local',
      total: results.length,
      timestamp: Date.now() - startTime
    };
  }

  /**
   * Search queue items locally
   */
  async searchQueueItems(query: string, status?: string): Promise<SearchResult<QueueItemSearchResult>> {
    await this.initialize();
    
    const startTime = Date.now();
    let queueItems: LocalQueueItem[] = [];
    
    if (status) {
      queueItems = await localDatabaseService.getQueueItemsByStatus(status);
    } else {
      // Get all queue items - would need to implement getAllQueueItems method
      queueItems = await localDatabaseService.getQueueItemsByStatus('WAITING');
    }
    
    // Filter by query if provided
    if (query) {
      queueItems = queueItems.filter(item => 
        item.visitReason.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    const results: QueueItemSearchResult[] = queueItems.map(item => ({
      id: item.id,
      patientId: item.patientId,
      patientName: 'Unknown Patient', // Would need to join with patients table
      currentStatus: item.currentStatus,
      visitReason: item.visitReason,
      priority: item.priority,
      createdAt: item.createdAt
    }));

    return {
      data: results,
      source: 'local',
      total: results.length,
      timestamp: Date.now() - startTime
    };
  }

  /**
   * Get patient by ID locally
   */
  async getPatientById(id: number): Promise<LocalPatient | null> {
    await this.initialize();
    return await localDatabaseService.getPatientById(id);
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    totalRecords: number;
    lastSyncTime: number | null;
    databaseSize: number;
  }> {
    await this.initialize();
    
    const totalRecords = await localDatabaseService.getDatabaseSize();
    const lastSyncTime = localStorage.getItem('hms_last_sync_time') 
      ? parseInt(localStorage.getItem('hms_last_sync_time')!, 10) 
      : null;
    
    return {
      totalRecords,
      lastSyncTime,
      databaseSize: 0 // Would need to implement size calculation
    };
  }

  /**
   * Clear all local data
   */
  async clearAllData(): Promise<void> {
    await this.initialize();
    await localDatabaseService.clearAllData();
  }

  /**
   * Export local data
   */
  async exportData(): Promise<string> {
    await this.initialize();
    return await localDatabaseService.exportData();
  }

  /**
   * Import local data
   */
  async importData(data: Uint8Array): Promise<void> {
    await this.initialize();
    await localDatabaseService.importData(data);
  }
}

export const localSearchService = new LocalSearchService();


