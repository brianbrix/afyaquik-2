/**
 * WebSocket Service for Real-time Synchronization
 */

import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { deviceIdManager } from './deviceIdManager';
import { WS_BASE_URL } from './baseUrls';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  deviceId: string;
}

export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastConnected: number | null;
}

export interface DataChangeNotification {
  type: string;
  sourceDeviceId: string;
  timestamp: string;
  message: string;
}

export interface ConflictResolutionNotification {
  type: string;
  resolvedByDeviceId: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

class WebSocketService {
  private client: Client | null = null;
  private connectionStatus: ConnectionStatus = {
    connected: false,
    connecting: false,
    error: null,
    lastConnected: null
  };
  private listeners: ((status: ConnectionStatus) => void)[] = [];
  private dataChangeListeners: ((notification: DataChangeNotification) => void)[] = [];
  private conflictListeners: ((notification: ConflictResolutionNotification) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds

  constructor() {
    // Don't initialize WebSocket immediately - wait for authentication
    this.connectionStatus = {
      connected: false,
      connecting: false,
      error: null,
      lastConnected: null
    };
  }

  /**
   * Connect WebSocket (call this after user authentication)
   */
  connect(): void {
    if (this.connectionStatus.connected || this.connectionStatus.connecting) {
      return;
    }
    
    this.initializeWebSocket();
  }

  /**
   * Disconnect WebSocket (call this when user logs out)
   */
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    
    this.connectionStatus = {
      connected: false,
      connecting: false,
      error: null,
      lastConnected: null
    };
  }

  /**
   * Initialize WebSocket connection
   */
  private initializeWebSocket(): void {
    try {
      const deviceInfo = deviceIdManager.getDeviceInfo();
      const wsUrl = this.getWebSocketUrl();
      
      // Get authentication token from session storage
      const sessionData = localStorage.getItem('afyaquik.hms.session');
      let token = null;
      let tenantId = 'clinic-a';
      
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          token = session.accessToken;
          tenantId = session.tenantId || 'clinic-a';
        } catch (error) {
          console.error('Failed to parse session data:', error);
        }
      }
      
      if (!token) {
        console.warn('No authentication token available for WebSocket connection');
        this.handleError('No authentication token available');
        return;
      }
      
      this.client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Id': tenantId,
          'X-Device-Id': deviceInfo.deviceId
        },
        debug: (str) => {
          console.log('WebSocket Debug:', str);
        },
        onConnect: (frame) => {
          console.log('WebSocket connected:', frame);
          this.handleConnection();
        },
        onStompError: (frame) => {
          console.error('WebSocket STOMP error:', frame);
          this.handleError(frame.headers['message'] || 'STOMP error');
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          this.handleError('WebSocket connection error');
        },
        onWebSocketClose: (event) => {
          console.log('WebSocket closed:', event);
          this.handleDisconnection();
        }
      });

      this.client.activate();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.handleError('Failed to initialize WebSocket');
    }
  }

  /**
   * Get WebSocket URL
   */
  private getWebSocketUrl(): string {
    // SockJS expects http/https protocols, not ws/wss
    // Use the same protocol as the current page to avoid mixed content issues
    const protocol = window.location.protocol;
    const host = window.location.host;
    
    // If WS_BASE_URL is already a full URL, use it as-is
    if (WS_BASE_URL.startsWith('http')) {
      return `${WS_BASE_URL}/snapshot`;
    }
    
    // Otherwise, construct the URL using the current page's protocol and host
    return `${protocol}//${host}/ws/snapshot`;
  }

  /**
   * Handle successful connection
   */
  private handleConnection(): void {
    this.connectionStatus = {
      connected: true,
      connecting: false,
      error: null,
      lastConnected: Date.now()
    };
    this.reconnectAttempts = 0;
    this.notifyListeners();

    // Subscribe to topics
    this.subscribeToTopics();
    
    // Send device connection message
    this.sendDeviceConnection();
  }

  /**
   * Handle connection error
   */
  private handleError(errorMessage: string): void {
    this.connectionStatus = {
      connected: false,
      connecting: false,
      error: errorMessage,
      lastConnected: this.connectionStatus.lastConnected
    };
    this.notifyListeners();

    // Attempt reconnection
    this.attemptReconnection();
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection(): void {
    this.connectionStatus = {
      connected: false,
      connecting: false,
      error: null,
      lastConnected: this.connectionStatus.lastConnected
    };
    this.notifyListeners();

    // Attempt reconnection
    this.attemptReconnection();
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.initializeWebSocket();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.connectionStatus.error = 'Max reconnection attempts reached';
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to WebSocket topics
   */
  private subscribeToTopics(): void {
    if (!this.client || !this.client.connected) return;

    const deviceInfo = deviceIdManager.getDeviceInfo();
    const tenantId = this.getTenantId(); // You'll need to implement this

    // Subscribe to device-specific queues
    this.client.subscribe(`/user/${deviceInfo.deviceId}/queue/connection`, (message) => {
      console.log('Connection acknowledgment:', message.body);
    });

    this.client.subscribe(`/user/${deviceInfo.deviceId}/queue/snapshot`, (message) => {
      console.log('Snapshot update received:', message.body);
      this.handleSnapshotUpdate(JSON.parse(message.body));
    });

    this.client.subscribe(`/user/${deviceInfo.deviceId}/queue/no-changes`, (message) => {
      console.log('No changes message:', message.body);
    });

    this.client.subscribe(`/user/${deviceInfo.deviceId}/queue/error`, (message) => {
      console.error('WebSocket error message:', message.body);
    });

    // Subscribe to tenant-wide topics
    this.client.subscribe(`/topic/tenant/${tenantId}/data-changes`, (message) => {
      const notification = JSON.parse(message.body);
      this.handleDataChangeNotification(notification);
    });

    this.client.subscribe(`/topic/tenant/${tenantId}/conflicts`, (message) => {
      const notification = JSON.parse(message.body);
      this.handleConflictNotification(notification);
    });

    this.client.subscribe(`/topic/tenant/${tenantId}/connections`, (message) => {
      console.log('Device connection notification:', message.body);
    });
  }

  /**
   * Send device connection message
   */
  private sendDeviceConnection(): void {
    if (!this.client || !this.client.connected) return;

    const deviceInfo = deviceIdManager.getDeviceInfo();
    const message = {
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType,
      timestamp: new Date().toISOString()
    };

    this.client.publish({
      destination: '/app/snapshot/connect',
      body: JSON.stringify(message)
    });
  }

  /**
   * Request snapshot update
   */
  requestSnapshotUpdate(lastSyncTime: string): void {
    if (!this.client || !this.client.connected) return;

    const deviceInfo = deviceIdManager.getDeviceInfo();
    const message = {
      deviceId: deviceInfo.deviceId,
      lastSyncTime: lastSyncTime,
      timestamp: new Date().toISOString()
    };

    this.client.publish({
      destination: '/app/snapshot/update',
      body: JSON.stringify(message)
    });
  }

  /**
   * Send conflict resolution
   */
  sendConflictResolution(entityType: string, entityId: string, resolution: any): void {
    if (!this.client || !this.client.connected) return;

    const deviceInfo = deviceIdManager.getDeviceInfo();
    const message = {
      deviceId: deviceInfo.deviceId,
      entityType,
      entityId,
      resolution,
      timestamp: new Date().toISOString()
    };

    this.client.publish({
      destination: '/app/snapshot/resolve-conflict',
      body: JSON.stringify(message)
    });
  }

  /**
   * Handle snapshot update
   */
  private handleSnapshotUpdate(snapshot: any): void {
    // Trigger sync manager to process the snapshot
    console.log('Processing real-time snapshot update:', snapshot);
    // You can emit events or call sync manager here
  }

  /**
   * Handle data change notification
   */
  private handleDataChangeNotification(notification: DataChangeNotification): void {
    console.log('Data change notification:', notification);
    this.dataChangeListeners.forEach(listener => listener(notification));
  }

  /**
   * Handle conflict notification
   */
  private handleConflictNotification(notification: ConflictResolutionNotification): void {
    console.log('Conflict resolution notification:', notification);
    this.conflictListeners.forEach(listener => listener(notification));
  }

  /**
   * Get tenant ID (implement based on your auth system)
   */
  private getTenantId(): string {
    // This should be implemented based on your authentication system
    // For now, return a placeholder
    return 'default-tenant';
  }

  /**
   * Add connection status listener
   */
  addConnectionListener(listener: (status: ConnectionStatus) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove connection status listener
   */
  removeConnectionListener(listener: (status: ConnectionStatus) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Add data change listener
   */
  addDataChangeListener(listener: (notification: DataChangeNotification) => void): void {
    this.dataChangeListeners.push(listener);
  }

  /**
   * Remove data change listener
   */
  removeDataChangeListener(listener: (notification: DataChangeNotification) => void): void {
    this.dataChangeListeners = this.dataChangeListeners.filter(l => l !== listener);
  }

  /**
   * Add conflict listener
   */
  addConflictListener(listener: (notification: ConflictResolutionNotification) => void): void {
    this.conflictListeners.push(listener);
  }

  /**
   * Remove conflict listener
   */
  removeConflictListener(listener: (notification: ConflictResolutionNotification) => void): void {
    this.conflictListeners = this.conflictListeners.filter(l => l !== listener);
  }

  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.connectionStatus));
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }


  /**
   * Reconnect manually
   */
  reconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.initializeWebSocket();
  }
}

export const websocketService = new WebSocketService();
