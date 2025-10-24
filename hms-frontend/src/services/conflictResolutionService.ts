/**
 * Conflict Resolution Service
 * Handles conflict detection and resolution on the frontend
 */

export interface ConflictData {
  id: string;
  entityType: string;
  entityId: string;
  localData: any;
  serverData: any;
  conflictReason: string;
  timestamp: number;
  status: 'pending' | 'resolved' | 'auto-resolved' | 'escalated' | 'cancelled';
}

export interface ConflictResolution {
  id: string;
  resolution: 'use_local' | 'use_server' | 'merge' | 'manual';
  mergedData?: any;
  reason?: string;
  resolvedBy: string;
  resolvedAt: number;
}

export interface ConflictStatistics {
  totalConflicts: number;
  pendingConflicts: number;
  resolvedConflicts: number;
  autoResolvedConflicts: number;
}

class ConflictResolutionService {
  private conflicts: Map<string, ConflictData> = new Map();
  private listeners: ((conflict: ConflictData) => void)[] = [];
  private resolutionListeners: ((resolution: ConflictResolution) => void)[] = [];

  /**
   * Detect conflicts between local and server data
   */
  detectConflict(entityType: string, entityId: string, localData: any, serverData: any): ConflictData | null {
    const conflictReasons = this.analyzeConflictReasons(localData, serverData);
    
    if (conflictReasons.length === 0) {
      return null; // No conflict
    }

    const conflict: ConflictData = {
      id: this.generateConflictId(),
      entityType,
      entityId,
      localData,
      serverData,
      conflictReason: conflictReasons.join('; '),
      timestamp: Date.now(),
      status: 'pending'
    };

    this.conflicts.set(conflict.id, conflict);
    this.notifyListeners(conflict);

    return conflict;
  }

  /**
   * Analyze conflict reasons between local and server data
   */
  private analyzeConflictReasons(localData: any, serverData: any): string[] {
    const reasons: string[] = [];

    if (!localData || !serverData) {
      return reasons;
    }

    // Check for timestamp conflicts
    if (localData.updatedAt && serverData.updatedAt) {
      const localTime = new Date(localData.updatedAt).getTime();
      const serverTime = new Date(serverData.updatedAt).getTime();
      
      if (Math.abs(localTime - serverTime) > 1000) { // More than 1 second difference
        reasons.push('Timestamp conflict: Local and server data have different update times');
      }
    }

    // Check for version conflicts
    if (localData.version && serverData.version) {
      if (localData.version !== serverData.version) {
        reasons.push(`Version conflict: Local version ${localData.version} vs Server version ${serverData.version}`);
      }
    }

    // Check for data conflicts in key fields
    const keyFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'status'];
    for (const field of keyFields) {
      if (localData[field] !== undefined && serverData[field] !== undefined) {
        if (localData[field] !== serverData[field]) {
          reasons.push(`Data conflict in ${field}: Local "${localData[field]}" vs Server "${serverData[field]}"`);
        }
      }
    }

    // Check for deletion conflicts
    if (localData.deleted !== serverData.deleted) {
      reasons.push('Deletion conflict: One version is deleted while the other is not');
    }

    return reasons;
  }

  /**
   * Resolve a conflict
   */
  resolveConflict(conflictId: string, resolution: ConflictResolution): boolean {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      console.error('Conflict not found:', conflictId);
      return false;
    }

    // Update conflict status
    conflict.status = 'resolved';
    this.conflicts.set(conflictId, conflict);

    // Create resolution record
    const conflictResolution: ConflictResolution = {
      id: this.generateResolutionId(),
      resolution: resolution.resolution,
      mergedData: resolution.mergedData,
      reason: resolution.reason,
      resolvedBy: 'user', // Could be 'user', 'system', 'auto'
      resolvedAt: Date.now()
    };

    this.notifyResolutionListeners(conflictResolution);

    return true;
  }

  /**
   * Auto-resolve simple conflicts
   */
  autoResolveConflict(conflictId: string): ConflictResolution | null {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      return null;
    }

    // Auto-resolution strategies
    const resolution = this.determineAutoResolution(conflict);
    if (resolution) {
      conflict.status = 'auto-resolved';
      this.conflicts.set(conflictId, conflict);

      const conflictResolution: ConflictResolution = {
        id: this.generateResolutionId(),
        resolution: resolution.resolution,
        mergedData: resolution.mergedData,
        reason: 'Auto-resolved based on timestamp and version',
        resolvedBy: 'system',
        resolvedAt: Date.now()
      };

      this.notifyResolutionListeners(conflictResolution);
      return conflictResolution;
    }

    return null;
  }

  /**
   * Determine auto-resolution strategy
   */
  private determineAutoResolution(conflict: ConflictData): { resolution: string; mergedData?: any } | null {
    const { localData, serverData } = conflict;

    // Strategy 1: Use most recent timestamp
    if (localData.updatedAt && serverData.updatedAt) {
      const localTime = new Date(localData.updatedAt).getTime();
      const serverTime = new Date(serverData.updatedAt).getTime();
      
      if (localTime > serverTime) {
        return { resolution: 'use_local' };
      } else if (serverTime > localTime) {
        return { resolution: 'use_server' };
      }
    }

    // Strategy 2: Use higher version number
    if (localData.version && serverData.version) {
      if (localData.version > serverData.version) {
        return { resolution: 'use_local' };
      } else if (serverData.version > localData.version) {
        return { resolution: 'use_server' };
      }
    }

    // Strategy 3: Merge non-conflicting fields
    const mergedData = this.mergeNonConflictingFields(localData, serverData);
    if (mergedData) {
      return { resolution: 'merge', mergedData };
    }

    return null; // Cannot auto-resolve
  }

  /**
   * Merge non-conflicting fields
   */
  private mergeNonConflictingFields(localData: any, serverData: any): any | null {
    const merged = { ...localData };

    // Merge fields that don't conflict
    for (const [key, serverValue] of Object.entries(serverData)) {
      if (localData[key] === undefined || localData[key] === null) {
        merged[key] = serverValue;
      } else if (localData[key] === serverValue) {
        // Same value, keep it
        merged[key] = localData[key];
      } else {
        // Conflict exists, cannot merge
        return null;
      }
    }

    return merged;
  }

  /**
   * Get all conflicts
   */
  getConflicts(): ConflictData[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * Get conflicts by entity type
   */
  getConflictsByEntityType(entityType: string): ConflictData[] {
    return this.getConflicts().filter(conflict => conflict.entityType === entityType);
  }

  /**
   * Get pending conflicts
   */
  getPendingConflicts(): ConflictData[] {
    return this.getConflicts().filter(conflict => conflict.status === 'pending');
  }

  /**
   * Get conflict by ID
   */
  getConflictById(conflictId: string): ConflictData | null {
    return this.conflicts.get(conflictId) || null;
  }

  /**
   * Clear resolved conflicts
   */
  clearResolvedConflicts(): void {
    const resolvedConflicts = this.getConflicts().filter(conflict => 
      conflict.status === 'resolved' || conflict.status === 'auto-resolved'
    );
    
    resolvedConflicts.forEach(conflict => {
      this.conflicts.delete(conflict.id);
    });
  }

  /**
   * Get conflict statistics
   */
  getConflictStatistics(): ConflictStatistics {
    const conflicts = this.getConflicts();
    
    return {
      totalConflicts: conflicts.length,
      pendingConflicts: conflicts.filter(c => c.status === 'pending').length,
      resolvedConflicts: conflicts.filter(c => c.status === 'resolved').length,
      autoResolvedConflicts: conflicts.filter(c => c.status === 'auto-resolved').length
    };
  }

  /**
   * Add conflict listener
   */
  addConflictListener(listener: (conflict: ConflictData) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove conflict listener
   */
  removeConflictListener(listener: (conflict: ConflictData) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Add resolution listener
   */
  addResolutionListener(listener: (resolution: ConflictResolution) => void): void {
    this.resolutionListeners.push(listener);
  }

  /**
   * Remove resolution listener
   */
  removeResolutionListener(listener: (resolution: ConflictResolution) => void): void {
    this.resolutionListeners = this.resolutionListeners.filter(l => l !== listener);
  }

  /**
   * Notify conflict listeners
   */
  private notifyListeners(conflict: ConflictData): void {
    this.listeners.forEach(listener => listener(conflict));
  }

  /**
   * Notify resolution listeners
   */
  private notifyResolutionListeners(resolution: ConflictResolution): void {
    this.resolutionListeners.forEach(listener => listener(resolution));
  }

  /**
   * Generate conflict ID
   */
  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Generate resolution ID
   */
  private generateResolutionId(): string {
    return `resolution_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

export const conflictResolutionService = new ConflictResolutionService();

