import { localDatabaseService, LocalPatient, LocalStaff, LocalDepartment, LocalAppointment, LocalMedication, LocalQueueItem } from './localDatabase';
import { snapshotApiService, SnapshotData } from './snapshotApi';
import { websocketService } from './websocketService';
import { conflictResolutionService, ConflictData } from './conflictResolutionService';
import { deviceIdManager } from './deviceIdManager';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  lastBackgroundSyncTime: number | null;
  pendingOperations: number;
  error: string | null;
  isManualOffline: boolean;
}

export interface SyncProgress {
  current: number;
  total: number;
  message: string;
}

class SyncManagerService {
  private isOnline = navigator.onLine;
  private isManualOffline = false;
  private isSyncing = false;
  private lastSyncTime: number | null = null;
  private syncInterval: number | null = null;
  private backgroundSyncInterval: number | null = null;
  private listeners: ((status: SyncStatus) => void)[] = [];
  private progressListeners: ((progress: SyncProgress) => void)[] = [];

  constructor() {
    this.initializeEventListeners();
    this.loadLastSyncTime();
    this.setupWebSocketListeners();
    this.setupConflictListeners();
  }

  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.autoSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });

    // Auto-sync every 5 minutes when online (normal mode)
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing && !this.isManualOffline) {
        this.autoSync();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Background sync every 15 minutes even in manual offline mode (when internet is available)
    this.backgroundSyncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.backgroundSync();
      }
    }, 15 * 60 * 1000); // 15 minutes
  }

  private loadLastSyncTime(): void {
    const stored = localStorage.getItem('hms_last_sync_time');
    this.lastSyncTime = stored ? parseInt(stored, 10) : null;
  }

  private getLastBackgroundSyncTime(): number | null {
    const stored = localStorage.getItem('hms_last_background_sync');
    return stored ? parseInt(stored, 10) : null;
  }

  private saveLastSyncTime(): void {
    this.lastSyncTime = Date.now();
    localStorage.setItem('hms_last_sync_time', this.lastSyncTime.toString());
  }

  /**
   * Setup WebSocket listeners for real-time synchronization
   */
  private setupWebSocketListeners(): void {
    // Listen for data change notifications
    websocketService.addDataChangeListener((notification) => {
      console.log('Real-time data change detected:', notification);
      this.handleRealTimeDataChange(notification);
    });

    // Listen for conflict notifications
    websocketService.addConflictListener((notification) => {
      console.log('Conflict resolution notification:', notification);
      this.handleConflictNotification(notification);
    });
  }

  /**
   * Setup conflict resolution listeners
   */
  private setupConflictListeners(): void {
    // Listen for new conflicts
    conflictResolutionService.addConflictListener((conflict) => {
      console.log('New conflict detected:', conflict);
      this.handleNewConflict(conflict);
    });

    // Listen for conflict resolutions
    conflictResolutionService.addResolutionListener((resolution) => {
      console.log('Conflict resolved:', resolution);
      this.handleConflictResolution(resolution);
    });
  }

  /**
   * Handle real-time data changes
   */
  private handleRealTimeDataChange(notification: any): void {
    if (this.isOnline && !this.isSyncing) {
      // Trigger incremental sync when real-time changes are detected
      this.performIncrementalSync();
    }
  }

  /**
   * Handle conflict notifications
   */
  private handleConflictNotification(notification: any): void {
    // Update UI to show conflict resolution options
    console.log('Conflict notification received:', notification);
  }

  /**
   * Handle new conflicts
   */
  private handleNewConflict(conflict: ConflictData): void {
    // Show conflict resolution UI
    console.log('New conflict requires resolution:', conflict);
  }

  /**
   * Handle conflict resolution
   */
  private handleConflictResolution(resolution: any): void {
    // Apply the resolution and continue sync
    console.log('Conflict resolution applied:', resolution);
  }

  private notifyListeners(): void {
    const lastBackgroundSyncTime = this.getLastBackgroundSyncTime();
    const status: SyncStatus = {
      isOnline: this.isOnline && !this.isManualOffline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      lastBackgroundSyncTime: lastBackgroundSyncTime,
      pendingOperations: 0, // TODO: Implement pending operations tracking
      error: null,
      isManualOffline: this.isManualOffline
    };

    this.listeners.forEach(listener => listener(status));
  }

  private notifyProgress(progress: SyncProgress): void {
    this.progressListeners.forEach(listener => listener(progress));
  }

  /**
   * Register a device for snapshot service
   * This should only be called after user authentication
   */
  async registerDevice(): Promise<void> {
    try {
      if (snapshotApiService.isDeviceRegistered()) {
        console.log('Device already registered');
        return;
      }

      console.log('Registering device for authenticated user...');
      const deviceInfo = snapshotApiService.getDeviceInfo();
      const request = {
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        description: `HMS Client - ${navigator.userAgent}`
      };

      await snapshotApiService.registerDevice(request);
      console.log('Device registered successfully for authenticated user');
    } catch (error) {
      console.error('Failed to register device:', error);
      throw error;
    }
  }

  /**
   * Perform initial sync (full snapshot)
   */
  async performInitialSync(): Promise<void> {
    if (this.isSyncing) return;

    this.isSyncing = true;
    this.notifyListeners();

    try {
      console.log('Starting initial sync...');
      this.notifyProgress({ current: 0, total: 100, message: 'Starting initial sync...' });

      // Register device if not already registered
      await this.registerDevice();

      // Connect WebSocket for real-time updates
      websocketService.connect();

      this.notifyProgress({ current: 20, total: 100, message: 'Creating initial snapshot...' });

      // Create initial snapshot (this will be the first snapshot for the device)
      const snapshot = await snapshotApiService.createFullSnapshot();
      const snapshotData = snapshotApiService.parseSnapshotData(snapshot.snapshotData);

      this.notifyProgress({ current: 40, total: 100, message: 'Processing snapshot data...' });

      // Save data to local database
      await this.saveSnapshotData(snapshotData);

      this.notifyProgress({ current: 80, total: 100, message: 'Finalizing sync...' });

      this.saveLastSyncTime();
      console.log('Initial sync completed successfully');

      this.notifyProgress({ current: 100, total: 100, message: 'Sync completed successfully' });

    } catch (error) {
      console.error('Initial sync failed:', error);
      throw error;
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Perform incremental sync
   */
  async performIncrementalSync(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;

    this.isSyncing = true;
    this.notifyListeners();

    try {
      console.log('Starting incremental sync...');
      this.notifyProgress({ current: 0, total: 100, message: 'Starting incremental sync...' });

      const since = this.lastSyncTime ? new Date(this.lastSyncTime).toISOString() : undefined;
      
      this.notifyProgress({ current: 20, total: 100, message: 'Checking for changes...' });

      // Check if data has changed
      if (since) {
        const hasChanges = await snapshotApiService.checkDataChanges(since);
        if (!hasChanges) {
          console.log('No changes detected, skipping sync');
          this.notifyProgress({ current: 100, total: 100, message: 'No changes to sync' });
          return;
        }
      }

      this.notifyProgress({ current: 40, total: 100, message: 'Fetching incremental snapshot...' });

      // Get incremental snapshot
      const snapshot = await snapshotApiService.getIncrementalSnapshot(since);
      const snapshotData = snapshotApiService.parseSnapshotData(snapshot.snapshotData);

      this.notifyProgress({ current: 60, total: 100, message: 'Processing changes...' });

      // Save incremental data to local database
      await this.saveSnapshotData(snapshotData);

      this.notifyProgress({ current: 80, total: 100, message: 'Finalizing sync...' });

      this.saveLastSyncTime();
      console.log('Incremental sync completed successfully');

      this.notifyProgress({ current: 100, total: 100, message: 'Sync completed successfully' });

    } catch (error) {
      console.error('Incremental sync failed:', error);
      throw error;
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Auto-sync when online
   */
  async autoSync(): Promise<void> {
    if (!this.isOnline || this.isSyncing) return;

    try {
      if (this.lastSyncTime) {
        await this.performIncrementalSync();
      } else {
        await this.performInitialSync();
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  }

  /**
   * Background sync that runs even in manual offline mode
   * This ensures data stays fresh while respecting user's offline preference
   */
  async backgroundSync(): Promise<void> {
    if (!this.isOnline || this.isSyncing) return;

    try {
      console.log('Background sync: Updating data in offline mode');
      
      // Only perform incremental sync in background
      if (this.lastSyncTime) {
        await this.performIncrementalSync();
      }
      
      // Update last background sync time
      localStorage.setItem('hms_last_background_sync', Date.now().toString());
      
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  /**
   * Save snapshot data to local database
   */
  private async saveSnapshotData(snapshotData: SnapshotData): Promise<void> {
    try {
      // Initialize local database if not already done
      await localDatabaseService.initialize();

      // Clear existing data to avoid schema conflicts
      await localDatabaseService.clearAllData();

      // Save patients
      if (snapshotData.patients && snapshotData.patients.length > 0) {
        try {
          console.log('Processing patients data:', snapshotData.patients.length);
          const patients = snapshotData.patients.map(patient => {
            console.log('Original patient data:', patient);
            const mapped = this.mapToLocalPatient(patient);
            console.log('Mapped patient data:', mapped);
            return mapped;
          });
          await localDatabaseService.savePatients(patients);
          console.log(`Saved ${patients.length} patients to local database`);
        } catch (error) {
          console.error('Failed to save patients:', error);
          throw error;
        }
      }

      // Save staff
      if (snapshotData.staff && snapshotData.staff.length > 0) {
        try {
          const staff = snapshotData.staff.map(staff => this.mapToLocalStaff(staff));
          await localDatabaseService.saveStaff(staff);
          console.log(`Saved ${staff.length} staff members to local database`);
        } catch (error) {
          console.error('Failed to save staff:', error);
          throw error;
        }
      }

      // Save departments
      if (snapshotData.departments && snapshotData.departments.length > 0) {
        try {
          const departments = snapshotData.departments.map(dept => this.mapToLocalDepartment(dept));
          await localDatabaseService.saveDepartments(departments);
          console.log(`Saved ${departments.length} departments to local database`);
        } catch (error) {
          console.error('Failed to save departments:', error);
          throw error;
        }
      }

      // Save appointments
      if (snapshotData.appointments && snapshotData.appointments.length > 0) {
        try {
          const appointments = snapshotData.appointments.map(appt => this.mapToLocalAppointment(appt));
          await localDatabaseService.saveAppointments(appointments);
          console.log(`Saved ${appointments.length} appointments to local database`);
        } catch (error) {
          console.error('Failed to save appointments:', error);
          throw error;
        }
      }

      // Save medications
      if (snapshotData.medications && snapshotData.medications.length > 0) {
        try {
          const medications = snapshotData.medications.map(med => this.mapToLocalMedication(med));
          await localDatabaseService.saveMedications(medications);
          console.log(`Saved ${medications.length} medications to local database`);
        } catch (error) {
          console.error('Failed to save medications:', error);
          throw error;
        }
      }

      // Save queue items
      if (snapshotData.queueItems && snapshotData.queueItems.length > 0) {
        try {
          const queueItems = snapshotData.queueItems.map(item => this.mapToLocalQueueItem(item));
          await localDatabaseService.saveQueueItems(queueItems);
          console.log(`Saved ${queueItems.length} queue items to local database`);
        } catch (error) {
          console.error('Failed to save queue items:', error);
          throw error;
        }
      }

    } catch (error) {
      console.error('Failed to save snapshot data:', error);
      throw error;
    }
  }

  // Helper function to safely handle undefined values
  private safeValue(value: any, fallback: any = null): any {
    if (value === undefined || value === null) {
      return fallback;
    }
    return value;
  }

  // Mapping functions
  private mapToLocalPatient(patient: any): LocalPatient {
    return {
      id: this.safeValue(patient.id, 0),
      medicalRecordNumber: this.safeValue(patient.medicalRecordNumber, ''),
      firstName: this.safeValue(patient.firstName, ''),
      lastName: this.safeValue(patient.lastName, ''),
      middleName: this.safeValue(patient.middleName),
      phone: this.safeValue(patient.phone),
      alternatePhone: this.safeValue(patient.alternatePhone),
      email: this.safeValue(patient.email),
      dateOfBirth: this.safeValue(patient.dateOfBirth),
      nationalId: this.safeValue(patient.nationalId),
      gender: this.safeValue(patient.gender),
      address: this.safeValue(patient.address),
      city: this.safeValue(patient.city),
      state: this.safeValue(patient.state),
      postalCode: this.safeValue(patient.postalCode),
      country: this.safeValue(patient.country),
      emergencyContactName: this.safeValue(patient.emergencyContactName),
      emergencyContactPhone: this.safeValue(patient.emergencyContactPhone),
      emergencyContactRelationship: this.safeValue(patient.emergencyContactRelationship),
      allergies: this.safeValue(patient.allergies),
      medications: this.safeValue(patient.medications),
      medicalHistory: this.safeValue(patient.medicalHistory),
      notes: this.safeValue(patient.notes),
      createdAt: this.safeValue(patient.createdAt, new Date().toISOString()),
      updatedAt: this.safeValue(patient.updatedAt, new Date().toISOString())
    };
  }

  private mapToLocalStaff(staff: any): LocalStaff {
    return {
      id: this.safeValue(staff.id, 0),
      username: this.safeValue(staff.username, ''),
      displayName: this.safeValue(staff.displayName, ''),
      email: this.safeValue(staff.email),
      enabled: this.safeValue(staff.enabled, false),
      roles: this.safeValue(staff.roles, []),
      supervisorId: this.safeValue(staff.supervisorId),
      supervisorDisplayName: this.safeValue(staff.supervisorDisplayName),
      isTenantSuperAdmin: this.safeValue(staff.isTenantSuperAdmin, false),
      createdAt: this.safeValue(staff.createdAt, new Date().toISOString()),
      updatedAt: this.safeValue(staff.updatedAt, new Date().toISOString())
    };
  }

  private mapToLocalDepartment(department: any): LocalDepartment {
    return {
      id: this.safeValue(department.id, 0),
      name: this.safeValue(department.name, ''),
      description: this.safeValue(department.description),
      isActive: this.safeValue(department.isActive, false),
      createdAt: this.safeValue(department.createdAt, new Date().toISOString()),
      updatedAt: this.safeValue(department.updatedAt, new Date().toISOString())
    };
  }

  private mapToLocalAppointment(appointment: any): LocalAppointment {
    return {
      id: this.safeValue(appointment.id, 0),
      patientId: this.safeValue(appointment.patientId, 0),
      providerId: this.safeValue(appointment.providerId, 0),
      departmentId: this.safeValue(appointment.departmentId, 0),
      appointmentDate: this.safeValue(appointment.appointmentDate, ''),
      startTime: this.safeValue(appointment.startTime, ''),
      endTime: this.safeValue(appointment.endTime, ''),
      status: this.safeValue(appointment.status, ''),
      reason: this.safeValue(appointment.reason),
      notes: this.safeValue(appointment.notes),
      createdAt: this.safeValue(appointment.createdAt, new Date().toISOString()),
      updatedAt: this.safeValue(appointment.updatedAt, new Date().toISOString())
    };
  }

  private mapToLocalMedication(medication: any): LocalMedication {
    return {
      id: this.safeValue(medication.id, 0),
      name: this.safeValue(medication.name, ''),
      description: this.safeValue(medication.description),
      dosage: this.safeValue(medication.dosage),
      unit: this.safeValue(medication.unit),
      isActive: this.safeValue(medication.isActive, false),
      createdAt: this.safeValue(medication.createdAt, new Date().toISOString()),
      updatedAt: this.safeValue(medication.updatedAt, new Date().toISOString())
    };
  }

  private mapToLocalQueueItem(queueItem: any): LocalQueueItem {
    return {
      id: this.safeValue(queueItem.id, 0),
      patientId: this.safeValue(queueItem.patientId, 0),
      currentStatus: this.safeValue(queueItem.currentStatus, ''),
      currentAssigneeId: this.safeValue(queueItem.currentAssigneeId),
      visitReason: this.safeValue(queueItem.visitReason),
      priority: this.safeValue(queueItem.priority, ''),
      createdAt: this.safeValue(queueItem.createdAt, new Date().toISOString()),
      updatedAt: this.safeValue(queueItem.updatedAt, new Date().toISOString())
    };
  }

  // Public API
  async sync(): Promise<void> {
    if (this.lastSyncTime) {
      await this.performIncrementalSync();
    } else {
      await this.performInitialSync();
    }
  }

  getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      lastBackgroundSyncTime: this.getLastBackgroundSyncTime(),
      isManualOffline: this.isManualOffline,
      pendingOperations: 0,
      error: null
    };
  }

  addStatusListener(listener: (status: SyncStatus) => void): void {
    this.listeners.push(listener);
  }

  removeStatusListener(listener: (status: SyncStatus) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  addProgressListener(listener: (progress: SyncProgress) => void): void {
    this.progressListeners.push(listener);
  }

  removeProgressListener(listener: (progress: SyncProgress) => void): void {
    this.progressListeners = this.progressListeners.filter(l => l !== listener);
  }

  // Manual offline/online control
  setManualOffline(offline: boolean): void {
    this.isManualOffline = offline;
    this.notifyListeners();
    
    if (!offline && this.isOnline) {
      // Switching back to online - trigger sync
      this.autoSync();
    }
  }

  isActuallyOffline(): boolean {
    return !this.isOnline || this.isManualOffline;
  }

  /**
   * Cleanup intervals and listeners
   */
  cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (this.backgroundSyncInterval) {
      clearInterval(this.backgroundSyncInterval);
      this.backgroundSyncInterval = null;
    }
    
    this.listeners = [];
    this.progressListeners = [];
  }

  isManualOfflineMode(): boolean {
    return this.isManualOffline;
  }

  /**
   * Check if device is registered and authenticated
   */
  isDeviceRegistered(): boolean {
    // Check if device has credentials and is authenticated
    try {
      const deviceInfo = deviceIdManager.getDeviceInfo();
      return deviceInfo.deviceId !== null && deviceInfo.deviceId !== undefined;
    } catch (error) {
      console.error('Error checking device registration:', error);
      return false;
    }
  }

  // Backend data access when online
  async fetchFromBackend<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (this.isActuallyOffline()) {
      throw new Error('Cannot fetch from backend while offline');
    }

    try {
      const response = await fetch(`/api/v1${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Backend fetch error:', error);
      throw error;
    }
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.listeners = [];
    this.progressListeners = [];
  }
}

export const syncManagerService = new SyncManagerService();
