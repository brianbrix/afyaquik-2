/**
 * Encryption Service for Frontend Data Security
 * Handles encryption/decryption of sensitive data
 */

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  tag: string;
}

export interface DecryptionResult {
  decryptedData: string;
  success: boolean;
  error?: string;
}

class EncryptionService {
  private readonly algorithm = 'AES-GCM';
  private readonly keyLength = 256;
  private readonly ivLength = 12;
  private readonly tagLength = 16;

  /**
   * Generate a new encryption key
   */
  async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Import a key from raw bytes
   */
  async importKey(rawKey: Uint8Array): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'raw',
      rawKey.buffer as ArrayBuffer,
      { name: this.algorithm },
      false, // not extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export a key to raw bytes
   */
  async exportKey(key: CryptoKey): Promise<ArrayBuffer> {
    return await crypto.subtle.exportKey('raw', key);
  }

  /**
   * Encrypt data using AES-GCM
   */
  async encrypt(data: string, key: CryptoKey): Promise<EncryptionResult> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
      
      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv,
          tagLength: this.tagLength * 8
        },
        key,
        dataBuffer
      );

      // Convert to base64 strings
      const encryptedData = this.arrayBufferToBase64(encryptedBuffer);
      const ivString = this.arrayBufferToBase64(iv.buffer);
      
      // Extract tag from encrypted data (last 16 bytes)
      const tag = encryptedData.slice(-24); // Base64 of 16 bytes
      const dataWithoutTag = encryptedData.slice(0, -24);

      return {
        encryptedData: dataWithoutTag,
        iv: ivString,
        tag: tag
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt data using AES-GCM
   */
  async decrypt(encryptedData: string, iv: string, tag: string, key: CryptoKey): Promise<DecryptionResult> {
    try {
      // Convert base64 strings back to ArrayBuffers
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
      const ivBuffer = this.base64ToArrayBuffer(iv);
      const tagBuffer = this.base64ToArrayBuffer(tag);
      
      // Combine encrypted data with tag
      const combinedBuffer = new Uint8Array(encryptedBuffer.byteLength + tagBuffer.byteLength);
      combinedBuffer.set(new Uint8Array(encryptedBuffer));
      combinedBuffer.set(new Uint8Array(tagBuffer), encryptedBuffer.byteLength);

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: ivBuffer,
          tagLength: this.tagLength * 8
        },
        key,
        combinedBuffer
      );

      const decoder = new TextDecoder();
      const decryptedData = decoder.decode(decryptedBuffer);

      return {
        decryptedData,
        success: true
      };
    } catch (error) {
      console.error('Decryption failed:', error);
      return {
        decryptedData: '',
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed'
      };
    }
  }

  /**
   * Hash data using SHA-256
   */
  async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return this.arrayBufferToBase64(hashBuffer);
  }

  /**
   * Generate a secure random token
   */
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return this.arrayBufferToBase64(array.buffer);
  }

  /**
   * Encrypt sensitive fields in patient data
   */
  async encryptPatientData(patientData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'dateOfBirth', 'gender', 'medicalRecordNumber'];
    return await this.encryptSensitiveFields(patientData, sensitiveFields, key);
  }

  /**
   * Encrypt sensitive fields in staff data
   */
  async encryptStaffData(staffData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'employeeId', 'specialization'];
    return await this.encryptSensitiveFields(staffData, sensitiveFields, key);
  }

  /**
   * Encrypt sensitive fields in appointment data
   */
  async encryptAppointmentData(appointmentData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['notes', 'diagnosis', 'treatment', 'prescription', 'followUpNotes'];
    return await this.encryptSensitiveFields(appointmentData, sensitiveFields, key);
  }

  /**
   * Encrypt sensitive fields in medication data
   */
  async encryptMedicationData(medicationData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['name', 'description', 'dosage', 'instructions', 'sideEffects', 'contraindications'];
    return await this.encryptSensitiveFields(medicationData, sensitiveFields, key);
  }

  /**
   * Encrypt sensitive fields in prescription data
   */
  async encryptPrescriptionData(prescriptionData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['dosage', 'instructions', 'notes', 'sideEffects', 'contraindications'];
    return await this.encryptSensitiveFields(prescriptionData, sensitiveFields, key);
  }

  /**
   * Encrypt sensitive fields in queue item data
   */
  async encryptQueueItemData(queueItemData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['notes', 'symptoms', 'complaints', 'vitalSigns', 'assessment', 'treatment'];
    return await this.encryptSensitiveFields(queueItemData, sensitiveFields, key);
  }

  /**
   * Encrypt sensitive fields in department data
   */
  async encryptDepartmentData(departmentData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['name', 'description', 'location', 'contactInfo'];
    return await this.encryptSensitiveFields(departmentData, sensitiveFields, key);
  }

  /**
   * Generic method to encrypt sensitive fields in any data type
   */
  private async encryptSensitiveFields(data: any, sensitiveFields: string[], key: CryptoKey): Promise<any> {
    const encryptedData = { ...data };

    for (const field of sensitiveFields) {
      if (data[field] && typeof data[field] === 'string' && data[field].trim() !== '') {
        try {
          const encryptionResult = await this.encrypt(data[field], key);
          encryptedData[field] = {
            encrypted: true,
            data: encryptionResult.encryptedData,
            iv: encryptionResult.iv,
            tag: encryptionResult.tag
          };
        } catch (error) {
          console.error(`Failed to encrypt field ${field}:`, error);
          // Keep original value if encryption fails
          encryptedData[field] = data[field];
        }
      }
    }

    return encryptedData;
  }

  /**
   * Decrypt sensitive fields in patient data
   */
  async decryptPatientData(encryptedPatientData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'dateOfBirth', 'gender', 'medicalRecordNumber'];
    return await this.decryptSensitiveFields(encryptedPatientData, sensitiveFields, key);
  }

  /**
   * Decrypt sensitive fields in staff data
   */
  async decryptStaffData(encryptedStaffData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'employeeId', 'specialization'];
    return await this.decryptSensitiveFields(encryptedStaffData, sensitiveFields, key);
  }

  /**
   * Decrypt sensitive fields in appointment data
   */
  async decryptAppointmentData(encryptedAppointmentData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['notes', 'diagnosis', 'treatment', 'prescription', 'followUpNotes'];
    return await this.decryptSensitiveFields(encryptedAppointmentData, sensitiveFields, key);
  }

  /**
   * Decrypt sensitive fields in medication data
   */
  async decryptMedicationData(encryptedMedicationData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['name', 'description', 'dosage', 'instructions', 'sideEffects', 'contraindications'];
    return await this.decryptSensitiveFields(encryptedMedicationData, sensitiveFields, key);
  }

  /**
   * Decrypt sensitive fields in prescription data
   */
  async decryptPrescriptionData(encryptedPrescriptionData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['dosage', 'instructions', 'notes', 'sideEffects', 'contraindications'];
    return await this.decryptSensitiveFields(encryptedPrescriptionData, sensitiveFields, key);
  }

  /**
   * Decrypt sensitive fields in queue item data
   */
  async decryptQueueItemData(encryptedQueueItemData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['notes', 'symptoms', 'complaints', 'vitalSigns', 'assessment', 'treatment'];
    return await this.decryptSensitiveFields(encryptedQueueItemData, sensitiveFields, key);
  }

  /**
   * Decrypt sensitive fields in department data
   */
  async decryptDepartmentData(encryptedDepartmentData: any, key: CryptoKey): Promise<any> {
    const sensitiveFields = ['name', 'description', 'location', 'contactInfo'];
    return await this.decryptSensitiveFields(encryptedDepartmentData, sensitiveFields, key);
  }

  /**
   * Generic method to decrypt sensitive fields in any data type
   */
  private async decryptSensitiveFields(encryptedData: any, sensitiveFields: string[], key: CryptoKey): Promise<any> {
    const decryptedData = { ...encryptedData };

    for (const field of sensitiveFields) {
      if (encryptedData[field] && encryptedData[field].encrypted) {
        const fieldData = encryptedData[field];
        try {
          const decryptionResult = await this.decrypt(
            fieldData.data,
            fieldData.iv,
            fieldData.tag,
            key
          );

          if (decryptionResult.success) {
            decryptedData[field] = decryptionResult.decryptedData;
          } else {
            console.error(`Failed to decrypt field ${field}:`, decryptionResult.error);
            decryptedData[field] = '[DECRYPTION_FAILED]';
          }
        } catch (error) {
          console.error(`Error decrypting field ${field}:`, error);
          decryptedData[field] = '[DECRYPTION_ERROR]';
        }
      }
    }

    return decryptedData;
  }

  /**
   * Encrypt any data type based on its type
   */
  async encryptDataByType(data: any, dataType: string, key: CryptoKey): Promise<any> {
    switch (dataType.toLowerCase()) {
      case 'patient':
        return await this.encryptPatientData(data, key);
      case 'staff':
      case 'user':
        return await this.encryptStaffData(data, key);
      case 'appointment':
        return await this.encryptAppointmentData(data, key);
      case 'medication':
        return await this.encryptMedicationData(data, key);
      case 'prescription':
        return await this.encryptPrescriptionData(data, key);
      case 'queueitem':
      case 'queue_item':
        return await this.encryptQueueItemData(data, key);
      case 'department':
        return await this.encryptDepartmentData(data, key);
      default:
        console.warn(`Unknown data type for encryption: ${dataType}`);
        return data;
    }
  }

  /**
   * Decrypt any data type based on its type
   */
  async decryptDataByType(encryptedData: any, dataType: string, key: CryptoKey): Promise<any> {
    switch (dataType.toLowerCase()) {
      case 'patient':
        return await this.decryptPatientData(encryptedData, key);
      case 'staff':
      case 'user':
        return await this.decryptStaffData(encryptedData, key);
      case 'appointment':
        return await this.decryptAppointmentData(encryptedData, key);
      case 'medication':
        return await this.decryptMedicationData(encryptedData, key);
      case 'prescription':
        return await this.decryptPrescriptionData(encryptedData, key);
      case 'queueitem':
      case 'queue_item':
        return await this.decryptQueueItemData(encryptedData, key);
      case 'department':
        return await this.decryptDepartmentData(encryptedData, key);
      default:
        console.warn(`Unknown data type for decryption: ${dataType}`);
        return encryptedData;
    }
  }

  /**
   * Encrypt snapshot data
   */
  async encryptSnapshotData(snapshotData: string, key: CryptoKey): Promise<EncryptionResult> {
    return await this.encrypt(snapshotData, key);
  }

  /**
   * Decrypt snapshot data
   */
  async decryptSnapshotData(encryptedSnapshotData: string, iv: string, tag: string, key: CryptoKey): Promise<DecryptionResult> {
    return await this.decrypt(encryptedSnapshotData, iv, tag, key);
  }

  /**
   * Verify data integrity using hash
   */
  async verifyIntegrity(data: string, expectedHash: string): Promise<boolean> {
    const actualHash = await this.hash(data);
    return actualHash === expectedHash;
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Generate a device-specific encryption key
   */
  async generateDeviceKey(deviceId: string): Promise<CryptoKey> {
    // Use device ID as seed for key generation
    const seed = await this.hash(deviceId + Date.now().toString());
    const seedBuffer = this.base64ToArrayBuffer(seed);
    
    // Import the seed as a key
    return await this.importKey(new Uint8Array(seedBuffer));
  }

  /**
   * Store encryption key securely
   */
  async storeKey(key: CryptoKey, keyName: string): Promise<void> {
    try {
      const exportedKey = await this.exportKey(key);
      const keyString = this.arrayBufferToBase64(exportedKey);
      localStorage.setItem(`hms_encryption_key_${keyName}`, keyString);
    } catch (error) {
      console.error('Failed to store encryption key:', error);
      throw new Error('Key storage failed');
    }
  }

  /**
   * Retrieve encryption key
   */
  async retrieveKey(keyName: string): Promise<CryptoKey | null> {
    try {
      const keyString = localStorage.getItem(`hms_encryption_key_${keyName}`);
      if (!keyString) {
        return null;
      }
      
      const keyBuffer = this.base64ToArrayBuffer(keyString);
      return await this.importKey(new Uint8Array(keyBuffer));
    } catch (error) {
      console.error('Failed to retrieve encryption key:', error);
      return null;
    }
  }

  /**
   * Remove encryption key
   */
  removeKey(keyName: string): void {
    localStorage.removeItem(`hms_encryption_key_${keyName}`);
  }
}

export const encryptionService = new EncryptionService();
