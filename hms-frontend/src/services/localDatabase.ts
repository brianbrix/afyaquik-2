import initSqlJs from 'sql.js';
import { encryptionService } from './encryptionService';

export interface LocalPatient {
  id: number;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  dateOfBirth?: string;
  nationalId?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  allergies?: string;
  medications?: string;
  medicalHistory?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalStaff {
  id: number;
  username: string;
  displayName: string;
  email?: string;
  enabled: boolean;
  roles: string[];
  supervisorId?: number;
  supervisorDisplayName?: string;
  isTenantSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocalDepartment {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocalAppointment {
  id: number;
  patientId: number;
  providerId: number;
  departmentId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalMedication {
  id: number;
  name: string;
  description?: string;
  dosage?: string;
  unit?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocalQueueItem {
  id: number;
  patientId: number;
  currentStatus: string;
  currentAssigneeId?: number;
  visitReason?: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

class LocalDatabaseService {
  private db: any = null;
  private isInitialized = false;
  private readonly CHUNK_SIZE = 1000; // Process data in chunks
  private readonly MAX_MEMORY_ITEMS = 5000; // Max items in memory

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const SQL = await initSqlJs({
        // You can load sql.js from a CDN or local file
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });

      // Try to load existing database from IndexedDB
      const existingData = await this.loadFromIndexedDB();
      if (existingData) {
        this.db = new SQL.Database(existingData);
        console.log('Local database loaded from IndexedDB');
      } else {
        this.db = new SQL.Database();
        console.log('Local database created fresh');
      }
      
      this.createTables();
      this.isInitialized = true;
      console.log('Local database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize local database:', error);
      throw error;
    }
  }

  /**
   * Clear all data from the local database
   */
  async clearAllData(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      this.db.exec(`
        DELETE FROM patients;
        DELETE FROM staff;
        DELETE FROM departments;
        DELETE FROM appointments;
        DELETE FROM medications;
        DELETE FROM queue_items;
      `);
      console.log('Local database cleared successfully');
    } catch (error) {
      console.error('Failed to clear local database:', error);
      throw error;
    }
  }

  private createTables(): void {
    const createTablesSQL = `
      -- Patients table
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY,
        medical_record_number TEXT UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        middle_name TEXT,
        phone TEXT,
        alternate_phone TEXT,
        email TEXT,
        date_of_birth TEXT,
        national_id TEXT,
        gender TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        emergency_contact_relationship TEXT,
        allergies TEXT,
        medications TEXT,
        medical_history TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Staff table
      CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        email TEXT,
        enabled BOOLEAN NOT NULL,
        roles TEXT NOT NULL, -- JSON array
        supervisor_id INTEGER,
        supervisor_display_name TEXT,
        is_tenant_super_admin BOOLEAN NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Departments table
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Appointments table
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        provider_id INTEGER NOT NULL,
        department_id INTEGER NOT NULL,
        appointment_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        status TEXT NOT NULL,
        reason TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (provider_id) REFERENCES staff(id),
        FOREIGN KEY (department_id) REFERENCES departments(id)
      );

      -- Medications table
      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        dosage TEXT,
        unit TEXT,
        is_active BOOLEAN NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Queue items table
      CREATE TABLE IF NOT EXISTS queue_items (
        id INTEGER PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        current_status TEXT NOT NULL,
        current_assignee_id INTEGER,
        visit_reason TEXT,
        priority TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (current_assignee_id) REFERENCES staff(id)
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(first_name, last_name);
      CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
      CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
      CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(medical_record_number);
      
      CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
      CREATE INDEX IF NOT EXISTS idx_staff_display_name ON staff(display_name);
      
      CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments(provider_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
      
      CREATE INDEX IF NOT EXISTS idx_queue_patient ON queue_items(patient_id);
      CREATE INDEX IF NOT EXISTS idx_queue_status ON queue_items(current_status);
    `;

    this.db.exec(createTablesSQL);
  }

  // Patient operations
  async savePatients(patients: LocalPatient[]): Promise<void> {
    // Process in chunks to prevent memory issues
    if (patients.length > this.CHUNK_SIZE) {
      await this.savePatientsInChunks(patients);
      return;
    }

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO patients (
        id, medical_record_number, first_name, last_name, middle_name,
        phone, alternate_phone, email, date_of_birth, national_id, gender,
        address, city, state, postal_code, country,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
        allergies, medications, medical_history, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const patient of patients) {
      stmt.run([
        patient.id,
        patient.medicalRecordNumber,
        patient.firstName,
        patient.lastName,
        patient.middleName || null,
        patient.phone || null,
        patient.alternatePhone || null,
        patient.email || null,
        patient.dateOfBirth || null,
        patient.nationalId || null,
        patient.gender || null,
        patient.address || null,
        patient.city || null,
        patient.state || null,
        patient.postalCode || null,
        patient.country || null,
        patient.emergencyContactName || null,
        patient.emergencyContactPhone || null,
        patient.emergencyContactRelationship || null,
        patient.allergies || null,
        patient.medications || null,
        patient.medicalHistory || null,
        patient.notes || null,
        patient.createdAt,
        patient.updatedAt
      ]);
    }
    stmt.free();
    
    // Auto-save to IndexedDB
    await this.autoSave();
  }

  /**
   * Save patients in chunks to prevent memory issues
   */
  private async savePatientsInChunks(patients: LocalPatient[]): Promise<void> {
    for (let i = 0; i < patients.length; i += this.CHUNK_SIZE) {
      const chunk = patients.slice(i, i + this.CHUNK_SIZE);
      await this.savePatients(chunk);
      
      // Force garbage collection hint for large datasets
      if (i % (this.CHUNK_SIZE * 5) === 0) {
        await this.forceGarbageCollection();
      }
    }
  }

  /**
   * Force garbage collection hint
   */
  private async forceGarbageCollection(): Promise<void> {
    // Force garbage collection by creating and releasing large objects
    const temp = new Array(1000000).fill(0);
    temp.length = 0;
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  async searchPatients(query: string): Promise<LocalPatient[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM patients 
      WHERE first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ? OR medical_record_number LIKE ?
      ORDER BY first_name, last_name
    `);
    
    const searchTerm = `%${query}%`;
    const results = stmt.all([searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]);
    stmt.free();
    
    return results.map(this.mapPatientFromDb);
  }

  async getPatientById(id: number): Promise<LocalPatient | null> {
    const stmt = this.db.prepare('SELECT * FROM patients WHERE id = ?');
    const result = stmt.get([id]);
    stmt.free();
    
    return result ? this.mapPatientFromDb(result) : null;
  }

  // Staff operations
  async saveStaff(staff: LocalStaff[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO staff (
        id, username, display_name, email, enabled, roles,
        supervisor_id, supervisor_display_name, is_tenant_super_admin,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const member of staff) {
      stmt.run([
        member.id,
        member.username,
        member.displayName,
        member.email || null,
        member.enabled,
        JSON.stringify(member.roles),
        member.supervisorId || null,
        member.supervisorDisplayName || null,
        member.isTenantSuperAdmin,
        member.createdAt,
        member.updatedAt
      ]);
    }
    stmt.free();
    
    // Auto-save to IndexedDB
    await this.autoSave();
  }

  async searchStaff(query: string): Promise<LocalStaff[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM staff 
      WHERE username LIKE ? OR display_name LIKE ? OR email LIKE ?
      ORDER BY display_name
    `);
    
    const searchTerm = `%${query}%`;
    const results = stmt.all([searchTerm, searchTerm, searchTerm]);
    stmt.free();
    
    return results.map(this.mapStaffFromDb);
  }

  // Department operations
  async saveDepartments(departments: LocalDepartment[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO departments (id, name, description, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const dept of departments) {
      stmt.run([
        dept.id,
        dept.name,
        dept.description || null,
        dept.isActive,
        dept.createdAt,
        dept.updatedAt
      ]);
    }
    stmt.free();
  }

  async getDepartments(): Promise<LocalDepartment[]> {
    const stmt = this.db.prepare('SELECT * FROM departments WHERE is_active = 1 ORDER BY name');
    const results = stmt.all();
    stmt.free();
    
    return results.map(this.mapDepartmentFromDb);
  }

  // Appointment operations
  async saveAppointments(appointments: LocalAppointment[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO appointments (
        id, patient_id, provider_id, department_id, appointment_date,
        start_time, end_time, status, reason, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const appointment of appointments) {
      stmt.run([
        appointment.id,
        appointment.patientId,
        appointment.providerId,
        appointment.departmentId,
        appointment.appointmentDate,
        appointment.startTime,
        appointment.endTime,
        appointment.status,
        appointment.reason || null,
        appointment.notes || null,
        appointment.createdAt,
        appointment.updatedAt
      ]);
    }
    stmt.free();
  }

  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<LocalAppointment[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM appointments 
      WHERE appointment_date BETWEEN ? AND ?
      ORDER BY appointment_date, start_time
    `);
    
    const results = stmt.all([startDate, endDate]);
    stmt.free();
    
    return results.map(this.mapAppointmentFromDb);
  }

  // Medication operations
  async saveMedications(medications: LocalMedication[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO medications (id, name, description, dosage, unit, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const med of medications) {
      stmt.run([
        med.id,
        med.name,
        med.description || null,
        med.dosage || null,
        med.unit || null,
        med.isActive,
        med.createdAt,
        med.updatedAt
      ]);
    }
    stmt.free();
  }

  async searchMedications(query: string): Promise<LocalMedication[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM medications 
      WHERE name LIKE ? OR description LIKE ?
      ORDER BY name
    `);
    
    const searchTerm = `%${query}%`;
    const results = stmt.all([searchTerm, searchTerm]);
    stmt.free();
    
    return results.map(this.mapMedicationFromDb);
  }

  // Queue operations
  async saveQueueItems(queueItems: LocalQueueItem[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO queue_items (
        id, patient_id, current_status, current_assignee_id,
        visit_reason, priority, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of queueItems) {
      stmt.run([
        item.id,
        item.patientId,
        item.currentStatus,
        item.currentAssigneeId || null,
        item.visitReason || null,
        item.priority,
        item.createdAt,
        item.updatedAt
      ]);
    }
    stmt.free();
  }

  async getQueueItemsByStatus(status: string): Promise<LocalQueueItem[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM queue_items 
      WHERE current_status = ?
      ORDER BY created_at
    `);
    
    const results = stmt.all([status]);
    stmt.free();
    
    return results.map(this.mapQueueItemFromDb);
  }

  // Utility methods
  private mapPatientFromDb(row: any): LocalPatient {
    return {
      id: row.id,
      medicalRecordNumber: row.medical_record_number,
      firstName: row.first_name,
      lastName: row.last_name,
      middleName: row.middle_name,
      phone: row.phone,
      alternatePhone: row.alternate_phone,
      email: row.email,
      dateOfBirth: row.date_of_birth,
      nationalId: row.national_id,
      gender: row.gender,
      address: row.address,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      country: row.country,
      emergencyContactName: row.emergency_contact_name,
      emergencyContactPhone: row.emergency_contact_phone,
      emergencyContactRelationship: row.emergency_contact_relationship,
      allergies: row.allergies,
      medications: row.medications,
      medicalHistory: row.medical_history,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapStaffFromDb(row: any): LocalStaff {
    return {
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      email: row.email,
      enabled: Boolean(row.enabled),
      roles: JSON.parse(row.roles),
      supervisorId: row.supervisor_id,
      supervisorDisplayName: row.supervisor_display_name,
      isTenantSuperAdmin: Boolean(row.is_tenant_super_admin),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapDepartmentFromDb(row: any): LocalDepartment {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapAppointmentFromDb(row: any): LocalAppointment {
    return {
      id: row.id,
      patientId: row.patient_id,
      providerId: row.provider_id,
      departmentId: row.department_id,
      appointmentDate: row.appointment_date,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      reason: row.reason,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapMedicationFromDb(row: any): LocalMedication {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      dosage: row.dosage,
      unit: row.unit,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapQueueItemFromDb(row: any): LocalQueueItem {
    return {
      id: row.id,
      patientId: row.patient_id,
      currentStatus: row.current_status,
      currentAssigneeId: row.current_assignee_id,
      visitReason: row.visit_reason,
      priority: row.priority,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Database management

  async getDatabaseSize(): Promise<number> {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM (
        SELECT 1 FROM patients
        UNION ALL SELECT 1 FROM staff
        UNION ALL SELECT 1 FROM departments
        UNION ALL SELECT 1 FROM appointments
        UNION ALL SELECT 1 FROM medications
        UNION ALL SELECT 1 FROM queue_items
      )
    `);
    const result = stmt.get();
    stmt.free();
    return result.count;
  }

  async exportData(): Promise<string> {
    return this.db.export();
  }

  async importData(data: Uint8Array): Promise<void> {
    this.db = new (await initSqlJs()).Database(data);
  }

  /**
   * Save database to IndexedDB for persistence
   */
  async saveToIndexedDB(): Promise<void> {
    if (!this.db) return;

    try {
      const data = this.db.export();
      const dbName = 'afyaquik-hms-local-db';
      const storeName = 'database';
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const putRequest = store.put(data, 'main');
          
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        };
      });
    } catch (error) {
      console.error('Failed to save database to IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Load database from IndexedDB
   */
  async loadFromIndexedDB(): Promise<Uint8Array | null> {
    try {
      const dbName = 'afyaquik-hms-local-db';
      const storeName = 'database';
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const getRequest = store.get('main');
          
          getRequest.onsuccess = () => {
            resolve(getRequest.result || null);
          };
          getRequest.onerror = () => reject(getRequest.error);
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        };
      });
    } catch (error) {
      console.error('Failed to load database from IndexedDB:', error);
      return null;
    }
  }

  /**
   * Auto-save database after operations
   */
  private async autoSave(): Promise<void> {
    try {
      await this.saveToIndexedDB();
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  }

  /**
   * Encrypt sensitive data before storing
   */
  async encryptDataForStorage(data: any, dataType: string): Promise<any> {
    try {
      const key = await encryptionService.retrieveKey('device');
      if (!key) {
        console.warn('No encryption key available, storing data unencrypted');
        return data;
      }
      
      return await encryptionService.encryptDataByType(data, dataType, key);
    } catch (error) {
      console.error('Failed to encrypt data for storage:', error);
      return data; // Store unencrypted if encryption fails
    }
  }

  /**
   * Decrypt sensitive data after retrieving
   */
  async decryptDataFromStorage(encryptedData: any, dataType: string): Promise<any> {
    try {
      const key = await encryptionService.retrieveKey('device');
      if (!key) {
        console.warn('No encryption key available, returning encrypted data');
        return encryptedData;
      }
      
      return await encryptionService.decryptDataByType(encryptedData, dataType, key);
    } catch (error) {
      console.error('Failed to decrypt data from storage:', error);
      return encryptedData; // Return encrypted data if decryption fails
    }
  }

  // Get all methods for upload functionality
  async getAllPatients(): Promise<LocalPatient[]> {
    const stmt = this.db.prepare('SELECT * FROM patients ORDER BY first_name, last_name');
    const results = stmt.all();
    stmt.free();
    return results.map(this.mapPatientFromDb);
  }

  async getAllStaff(): Promise<LocalStaff[]> {
    const stmt = this.db.prepare('SELECT * FROM staff ORDER BY display_name');
    const results = stmt.all();
    stmt.free();
    return results.map(this.mapStaffFromDb);
  }

  async getAllDepartments(): Promise<LocalDepartment[]> {
    const stmt = this.db.prepare('SELECT * FROM departments ORDER BY name');
    const results = stmt.all();
    stmt.free();
    return results.map(this.mapDepartmentFromDb);
  }

  async getAllAppointments(): Promise<LocalAppointment[]> {
    const stmt = this.db.prepare('SELECT * FROM appointments ORDER BY appointment_date, start_time');
    const results = stmt.all();
    stmt.free();
    return results.map(this.mapAppointmentFromDb);
  }

  async getAllMedications(): Promise<LocalMedication[]> {
    const stmt = this.db.prepare('SELECT * FROM medications ORDER BY name');
    const results = stmt.all();
    stmt.free();
    return results.map(this.mapMedicationFromDb);
  }

  async getAllQueueItems(): Promise<LocalQueueItem[]> {
    const stmt = this.db.prepare('SELECT * FROM queue_items ORDER BY created_at');
    const results = stmt.all();
    stmt.free();
    return results.map(this.mapQueueItemFromDb);
  }
}

export const localDatabaseService = new LocalDatabaseService();
