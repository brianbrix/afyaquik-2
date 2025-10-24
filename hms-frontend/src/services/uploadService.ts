/**
 * Upload Service for Offline Data Synchronization
 * Handles uploading local changes back to the remote server
 */

import { localDatabaseService, LocalPatient, LocalStaff, LocalAppointment, LocalMedication, LocalQueueItem, LocalDepartment } from './localDatabase';
import { API_BASE_URL } from './baseUrls';
import { offlinePermissionService } from './offlinePermissionService';
import { offlineAuditService } from './offlineAuditService';

export interface UploadResult {
  success: boolean;
  uploadedCount: number;
  failedCount: number;
  errors: string[];
}

export interface UploadStatus {
  isUploading: boolean;
  progress: number;
  currentOperation: string;
  results: UploadResult[];
}

class UploadService {
  private uploadStatus: UploadStatus = {
    isUploading: false,
    progress: 0,
    currentOperation: '',
    results: []
  };

  private listeners: ((status: UploadStatus) => void)[] = [];

  /**
   * Subscribe to upload status updates
   */
  onStatusUpdate(callback: (status: UploadStatus) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Update upload status and notify listeners
   */
  private updateStatus(updates: Partial<UploadStatus>): void {
    this.uploadStatus = { ...this.uploadStatus, ...updates };
    this.listeners.forEach(listener => listener(this.uploadStatus));
  }

  /**
   * Get current upload status
   */
  getStatus(): UploadStatus {
    return { ...this.uploadStatus };
  }

  /**
   * Upload all local changes to remote server
   */
  async uploadAllChanges(): Promise<UploadResult[]> {
    if (this.uploadStatus.isUploading) {
      throw new Error('Upload already in progress');
    }

    // Validate offline permissions before starting upload
    const sessionValidation = offlinePermissionService.isSessionValid();
    if (!sessionValidation) {
      throw new Error('Session expired. Please go online to refresh your session.');
    }

    // Log upload start
    offlineAuditService.logSync('UPLOAD', true, undefined, { 
      operation: 'upload_all_changes',
      timestamp: new Date().toISOString()
    });

    this.updateStatus({
      isUploading: true,
      progress: 0,
      currentOperation: 'Starting upload...',
      results: []
    });

    const results: UploadResult[] = [];
    const totalOperations = 6; // patients, staff, departments, appointments, medications, queue items
    let completedOperations = 0;

    try {
      // Upload patients
      this.updateStatus({ currentOperation: 'Uploading patients...' });
      const patientResult = await this.uploadPatients();
      results.push(patientResult);
      completedOperations++;
      this.updateStatus({ progress: (completedOperations / totalOperations) * 100 });

      // Upload staff
      this.updateStatus({ currentOperation: 'Uploading staff...' });
      const staffResult = await this.uploadStaff();
      results.push(staffResult);
      completedOperations++;
      this.updateStatus({ progress: (completedOperations / totalOperations) * 100 });

      // Upload departments
      this.updateStatus({ currentOperation: 'Uploading departments...' });
      const departmentResult = await this.uploadDepartments();
      results.push(departmentResult);
      completedOperations++;
      this.updateStatus({ progress: (completedOperations / totalOperations) * 100 });

      // Upload appointments
      this.updateStatus({ currentOperation: 'Uploading appointments...' });
      const appointmentResult = await this.uploadAppointments();
      results.push(appointmentResult);
      completedOperations++;
      this.updateStatus({ progress: (completedOperations / totalOperations) * 100 });

      // Upload medications
      this.updateStatus({ currentOperation: 'Uploading medications...' });
      const medicationResult = await this.uploadMedications();
      results.push(medicationResult);
      completedOperations++;
      this.updateStatus({ progress: (completedOperations / totalOperations) * 100 });

      // Upload queue items
      this.updateStatus({ currentOperation: 'Uploading queue items...' });
      const queueResult = await this.uploadQueueItems();
      results.push(queueResult);
      completedOperations++;
      this.updateStatus({ progress: (completedOperations / totalOperations) * 100 });

      this.updateStatus({
        isUploading: false,
        progress: 100,
        currentOperation: 'Upload completed',
        results
      });

      return results;

    } catch (error) {
      this.updateStatus({
        isUploading: false,
        currentOperation: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        results
      });
      throw error;
    }
  }

  /**
   * Upload patients to remote server
   */
  private async uploadPatients(): Promise<UploadResult> {
    try {
      // Validate upload permissions for patients
      const permissionValidation = offlinePermissionService.validateUploadPermissions('patients');
      if (!permissionValidation.valid) {
        return {
          success: false,
          uploadedCount: 0,
          failedCount: 0,
          errors: [permissionValidation.error || 'Permission validation failed']
        };
      }

      const patients = await localDatabaseService.getAllPatients();
      const result: UploadResult = {
        success: true,
        uploadedCount: 0,
        failedCount: 0,
        errors: []
      };

      for (const patient of patients) {
        try {
          await this.uploadPatient(patient);
          result.uploadedCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push(`Patient ${patient.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.failedCount === 0;
      return result;

    } catch (error) {
      return {
        success: false,
        uploadedCount: 0,
        failedCount: 0,
        errors: [`Failed to upload patients: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Upload a single patient
   */
  private async uploadPatient(patient: LocalPatient): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({
        medicalRecordNumber: patient.medicalRecordNumber,
        firstName: patient.firstName,
        lastName: patient.lastName,
        middleName: patient.middleName,
        phone: patient.phone,
        alternatePhone: patient.alternatePhone,
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
        nationalId: patient.nationalId,
        gender: patient.gender,
        address: patient.address,
        city: patient.city,
        state: patient.state,
        postalCode: patient.postalCode,
        country: patient.country,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone,
        emergencyContactRelationship: patient.emergencyContactRelationship,
        allergies: patient.allergies,
        medications: patient.medications,
        medicalHistory: patient.medicalHistory,
        notes: patient.notes
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Upload staff to remote server
   */
  private async uploadStaff(): Promise<UploadResult> {
    try {
      // Validate upload permissions for staff
      const permissionValidation = offlinePermissionService.validateUploadPermissions('staff');
      if (!permissionValidation.valid) {
        return {
          success: false,
          uploadedCount: 0,
          failedCount: 0,
          errors: [permissionValidation.error || 'Permission validation failed']
        };
      }

      const staff = await localDatabaseService.getAllStaff();
      const result: UploadResult = {
        success: true,
        uploadedCount: 0,
        failedCount: 0,
        errors: []
      };

      for (const member of staff) {
        try {
          await this.uploadStaffMember(member);
          result.uploadedCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push(`Staff ${member.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.failedCount === 0;
      return result;

    } catch (error) {
      return {
        success: false,
        uploadedCount: 0,
        failedCount: 0,
        errors: [`Failed to upload staff: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Upload a single staff member
   */
  private async uploadStaffMember(staff: LocalStaff): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({
        username: staff.username,
        displayName: staff.displayName,
        email: staff.email,
        enabled: staff.enabled,
        roles: staff.roles,
        supervisorId: staff.supervisorId,
        isTenantSuperAdmin: staff.isTenantSuperAdmin
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Upload departments to remote server
   */
  private async uploadDepartments(): Promise<UploadResult> {
    try {
      // Validate upload permissions for departments
      const permissionValidation = offlinePermissionService.validateUploadPermissions('departments');
      if (!permissionValidation.valid) {
        return {
          success: false,
          uploadedCount: 0,
          failedCount: 0,
          errors: [permissionValidation.error || 'Permission validation failed']
        };
      }

      const departments = await localDatabaseService.getAllDepartments();
      const result: UploadResult = {
        success: true,
        uploadedCount: 0,
        failedCount: 0,
        errors: []
      };

      for (const department of departments) {
        try {
          await this.uploadDepartment(department);
          result.uploadedCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push(`Department ${department.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.failedCount === 0;
      return result;

    } catch (error) {
      return {
        success: false,
        uploadedCount: 0,
        failedCount: 0,
        errors: [`Failed to upload departments: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Upload a single department
   */
  private async uploadDepartment(department: LocalDepartment): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({
        name: department.name,
        description: department.description,
        isActive: department.isActive
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Upload appointments to remote server
   */
  private async uploadAppointments(): Promise<UploadResult> {
    try {
      // Validate upload permissions for appointments
      const permissionValidation = offlinePermissionService.validateUploadPermissions('appointments');
      if (!permissionValidation.valid) {
        return {
          success: false,
          uploadedCount: 0,
          failedCount: 0,
          errors: [permissionValidation.error || 'Permission validation failed']
        };
      }

      const appointments = await localDatabaseService.getAllAppointments();
      const result: UploadResult = {
        success: true,
        uploadedCount: 0,
        failedCount: 0,
        errors: []
      };

      for (const appointment of appointments) {
        try {
          await this.uploadAppointment(appointment);
          result.uploadedCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push(`Appointment ${appointment.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.failedCount === 0;
      return result;

    } catch (error) {
      return {
        success: false,
        uploadedCount: 0,
        failedCount: 0,
        errors: [`Failed to upload appointments: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Upload a single appointment
   */
  private async uploadAppointment(appointment: LocalAppointment): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({
        patientId: appointment.patientId,
        providerId: appointment.providerId,
        departmentId: appointment.departmentId,
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        reason: appointment.reason,
        notes: appointment.notes
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Upload medications to remote server
   */
  private async uploadMedications(): Promise<UploadResult> {
    try {
      // Validate upload permissions for medications
      const permissionValidation = offlinePermissionService.validateUploadPermissions('medications');
      if (!permissionValidation.valid) {
        return {
          success: false,
          uploadedCount: 0,
          failedCount: 0,
          errors: [permissionValidation.error || 'Permission validation failed']
        };
      }

      const medications = await localDatabaseService.getAllMedications();
      const result: UploadResult = {
        success: true,
        uploadedCount: 0,
        failedCount: 0,
        errors: []
      };

      for (const medication of medications) {
        try {
          await this.uploadMedication(medication);
          result.uploadedCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push(`Medication ${medication.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.failedCount === 0;
      return result;

    } catch (error) {
      return {
        success: false,
        uploadedCount: 0,
        failedCount: 0,
        errors: [`Failed to upload medications: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Upload a single medication
   */
  private async uploadMedication(medication: LocalMedication): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/medications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({
        name: medication.name,
        description: medication.description,
        dosage: medication.dosage,
        unit: medication.unit,
        isActive: medication.isActive
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Upload queue items to remote server
   */
  private async uploadQueueItems(): Promise<UploadResult> {
    try {
      // Validate upload permissions for queue items
      const permissionValidation = offlinePermissionService.validateUploadPermissions('queue');
      if (!permissionValidation.valid) {
        return {
          success: false,
          uploadedCount: 0,
          failedCount: 0,
          errors: [permissionValidation.error || 'Permission validation failed']
        };
      }

      const queueItems = await localDatabaseService.getAllQueueItems();
      const result: UploadResult = {
        success: true,
        uploadedCount: 0,
        failedCount: 0,
        errors: []
      };

      for (const item of queueItems) {
        try {
          await this.uploadQueueItem(item);
          result.uploadedCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push(`Queue item ${item.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.failedCount === 0;
      return result;

    } catch (error) {
      return {
        success: false,
        uploadedCount: 0,
        failedCount: 0,
        errors: [`Failed to upload queue items: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Upload a single queue item
   */
  private async uploadQueueItem(item: LocalQueueItem): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({
        patientId: item.patientId,
        currentStatus: item.currentStatus,
        currentAssigneeId: item.currentAssigneeId,
        visitReason: item.visitReason,
        priority: item.priority
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    try {
      return offlinePermissionService.getAuthHeaders();
    } catch (error) {
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel ongoing upload
   */
  cancelUpload(): void {
    this.updateStatus({
      isUploading: false,
      currentOperation: 'Upload cancelled',
      progress: 0
    });
  }
}

export const uploadService = new UploadService();
