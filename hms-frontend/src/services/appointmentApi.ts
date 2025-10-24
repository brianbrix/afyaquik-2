import { apiClient } from './apiClient';
import { localDatabaseService, type LocalAppointment } from './localDatabase';

// Types
export interface AppointmentDto {
  id: number;
  patientId: number;
  patientName: string;
  patientMrn: string;
  providerId: number;
  providerName: string;
  departmentId: number;
  departmentName: string;
  appointmentDateTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  appointmentType?: string;
  reason: string;
  notes?: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  completedAt?: string;
  noShowAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequest {
  patientId: number;
  providerId: number;
  departmentId: number;
  appointmentDateTime: string;
  durationMinutes?: number;
  status?: AppointmentStatus;
  appointmentType?: string;
  reason: string;
  notes?: string;
}

export interface AppointmentFilterRequest {
  patientId?: number;
  providerId?: number;
  departmentId?: number;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  upcomingOnly?: boolean;
  todayOnly?: boolean;
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED'
}

// API Functions
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const appointmentApi = {
  // Create appointment
  create: async (data: AppointmentRequest): Promise<AppointmentDto> => {
    const response = await apiClient.post('/appointments', data);
    return response.data?.data ?? response.data;
  },

  // Get appointment by ID
  getById: async (id: number): Promise<AppointmentDto> => {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data?.data ?? response.data;
  },

  // Get all appointments with filters
  getAll: async (filters?: AppointmentFilterRequest): Promise<AppointmentDto[]> => {
    const params = new URLSearchParams();
    
    if (filters?.patientId) params.append('patientId', filters.patientId.toString());
    if (filters?.providerId) params.append('providerId', filters.providerId.toString());
    if (filters?.departmentId) params.append('departmentId', filters.departmentId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters?.upcomingOnly) params.append('upcomingOnly', filters.upcomingOnly.toString());
    if (filters?.todayOnly) params.append('todayOnly', filters.todayOnly.toString());
    
    const response = await apiClient.get(`/appointments?${params.toString()}`);
    return response.data?.data ?? response.data;
  },

  // Get all appointments with filters (paged)
  getAllPaged: async (filters: AppointmentFilterRequest | undefined, page: number, size: number): Promise<PageResponse<AppointmentDto>> => {
    // Check if we're offline
    if (!navigator.onLine) {
      return await getAllAppointmentsOffline(filters, page, size);
    }

    try {
      const params = new URLSearchParams();
      if (filters?.patientId) params.append('patientId', filters.patientId.toString());
      if (filters?.providerId) params.append('providerId', filters.providerId.toString());
      if (filters?.departmentId) params.append('departmentId', filters.departmentId.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
      if (filters?.upcomingOnly) params.append('upcomingOnly', filters.upcomingOnly.toString());
      if (filters?.todayOnly) params.append('todayOnly', filters.todayOnly.toString());
      params.append('page', String(page));
      params.append('size', String(size));
      const response = await apiClient.get(`/appointments?${params.toString()}`);
      return response.data?.data ?? response.data;
    } catch (error) {
      // If API call fails, fall back to offline data
      console.warn('API call failed, falling back to offline data:', error);
      return await getAllAppointmentsOffline(filters, page, size);
    }
  },

  // Get appointments by patient
  getByPatient: async (patientId: number): Promise<AppointmentDto[]> => {
    const response = await apiClient.get(`/appointments/patient/${patientId}`);
    return response.data?.data ?? response.data;
  },

  // Get appointments by provider
  getByProvider: async (providerId: number): Promise<AppointmentDto[]> => {
    const response = await apiClient.get(`/appointments/provider/${providerId}`);
    return response.data?.data ?? response.data;
  },

  // Get today's appointments for provider
  getTodayForProvider: async (providerId: number): Promise<AppointmentDto[]> => {
    const response = await apiClient.get(`/appointments/provider/${providerId}/today`);
    return response.data?.data ?? response.data;
  },

  // Get upcoming appointments
  getUpcoming: async (): Promise<AppointmentDto[]> => {
    const response = await apiClient.get('/appointments/upcoming');
    return response.data?.data ?? response.data;
  },

  // Update appointment
  update: async (id: number, data: AppointmentRequest): Promise<AppointmentDto> => {
    const response = await apiClient.put(`/appointments/${id}`, data);
    return response.data?.data ?? response.data;
  },

  // Cancel appointment
  cancel: async (id: number, reason?: string): Promise<AppointmentDto> => {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    const response = await apiClient.post(`/appointments/${id}/cancel${params}`);
    return response.data?.data ?? response.data;
  },

  // Complete appointment
  complete: async (id: number): Promise<AppointmentDto> => {
    const response = await apiClient.post(`/appointments/${id}/complete`);
    return response.data?.data ?? response.data;
  },

  // Mark as no-show
  markNoShow: async (id: number): Promise<AppointmentDto> => {
    const response = await apiClient.post(`/appointments/${id}/no-show`);
    return response.data?.data ?? response.data;
  },

  // Confirm appointment
  confirm: async (id: number): Promise<AppointmentDto> => {
    const response = await apiClient.post(`/appointments/${id}/confirm`);
    return response.data?.data ?? response.data;
  },

  // Delete appointment
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/appointments/${id}`);
  }
};

// Offline function for appointments
async function getAllAppointmentsOffline(filters: AppointmentFilterRequest | undefined, page: number, size: number): Promise<PageResponse<AppointmentDto>> {
  try {
    // Initialize local database if not already done
    await localDatabaseService.initialize();
    
    let appointments: LocalAppointment[];
    
    if (filters?.searchTerm && filters.searchTerm.trim()) {
      // Search appointments with query
      appointments = await localDatabaseService.searchAppointments(filters.searchTerm.trim());
    } else {
      // Get all appointments
      appointments = await localDatabaseService.getAllAppointments();
    }
    
    // Apply filters manually
    let filteredAppointments = appointments;
    
    if (filters?.patientId) {
      filteredAppointments = filteredAppointments.filter(a => a.patientId === filters.patientId);
    }
    if (filters?.providerId) {
      filteredAppointments = filteredAppointments.filter(a => a.providerId === filters.providerId);
    }
    if (filters?.departmentId) {
      filteredAppointments = filteredAppointments.filter(a => a.departmentId === filters.departmentId);
    }
    if (filters?.status) {
      filteredAppointments = filteredAppointments.filter(a => a.status === filters.status);
    }
    if (filters?.startDate) {
      const startDate = new Date(filters.startDate);
      filteredAppointments = filteredAppointments.filter(a => new Date(a.appointmentDate) >= startDate);
    }
    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      filteredAppointments = filteredAppointments.filter(a => new Date(a.appointmentDate) <= endDate);
    }
    if (filters?.upcomingOnly) {
      const now = new Date();
      filteredAppointments = filteredAppointments.filter(a => new Date(a.appointmentDate) >= now);
    }
    if (filters?.todayOnly) {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      filteredAppointments = filteredAppointments.filter(a => {
        const appointmentDate = new Date(a.appointmentDate);
        return appointmentDate >= startOfDay && appointmentDate < endOfDay;
      });
    }
    
    // Apply pagination manually
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);
    
    // Convert LocalAppointment to AppointmentDto
    const appointmentDtos: AppointmentDto[] = paginatedAppointments.map(a => ({
      id: a.id,
      patientId: a.patientId,
      patientName: a.patientName || '',
      patientMrn: a.patientMrn || '',
      providerId: a.providerId,
      providerName: a.providerName || '',
      departmentId: a.departmentId,
      departmentName: a.departmentName || '',
      appointmentDate: a.appointmentDate,
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
      reason: a.reason,
      notes: a.notes,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }));
    
    return {
      content: appointmentDtos,
      totalElements: filteredAppointments.length,
      totalPages: Math.ceil(filteredAppointments.length / size),
      size: size,
      number: page
    };
  } catch (error) {
    console.error('Offline appointments fetch failed:', error);
    // Return empty result if offline operations fail
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: size,
      number: page
    };
  }
}

// Utility functions
export const appointmentUtils = {
  // Get status color for UI
  getStatusColor: (status: AppointmentStatus): string => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'secondary';
      case AppointmentStatus.CONFIRMED:
        return 'primary';
      case AppointmentStatus.ARRIVED:
        return 'info';
      case AppointmentStatus.IN_PROGRESS:
        return 'warning';
      case AppointmentStatus.COMPLETED:
        return 'success';
      case AppointmentStatus.CANCELLED:
        return 'danger';
      case AppointmentStatus.NO_SHOW:
        return 'dark';
      case AppointmentStatus.RESCHEDULED:
        return 'light';
      default:
        return 'secondary';
    }
  },

  // Get status label for UI
  getStatusLabel: (status: AppointmentStatus): string => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'Scheduled';
      case AppointmentStatus.CONFIRMED:
        return 'Confirmed';
      case AppointmentStatus.ARRIVED:
        return 'Arrived';
      case AppointmentStatus.IN_PROGRESS:
        return 'In Progress';
      case AppointmentStatus.COMPLETED:
        return 'Completed';
      case AppointmentStatus.CANCELLED:
        return 'Cancelled';
      case AppointmentStatus.NO_SHOW:
        return 'No Show';
      case AppointmentStatus.RESCHEDULED:
        return 'Rescheduled';
      default:
        return 'Unknown';
    }
  },

  // Format appointment date
  formatDate: (dateTime: string): string => {
    return new Date(dateTime).toLocaleDateString();
  },

  // Format appointment time
  formatTime: (dateTime: string): string => {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  // Format appointment date and time
  formatDateTime: (dateTime: string): string => {
    return new Date(dateTime).toLocaleString();
  },

  // Check if appointment is upcoming
  isUpcoming: (appointment: AppointmentDto): boolean => {
    const now = new Date();
    const appointmentDate = new Date(appointment.appointmentDateTime);
    return appointmentDate > now && 
           (appointment.status === AppointmentStatus.SCHEDULED || 
            appointment.status === AppointmentStatus.CONFIRMED);
  },

  // Check if appointment is past
  isPast: (appointment: AppointmentDto): boolean => {
    const now = new Date();
    const appointmentDate = new Date(appointment.appointmentDateTime);
    return appointmentDate < now;
  },

  // Check if appointment can be cancelled
  canBeCancelled: (appointment: AppointmentDto): boolean => {
    const now = new Date();
    const appointmentDate = new Date(appointment.appointmentDateTime);
    return (appointment.status === AppointmentStatus.SCHEDULED || 
            appointment.status === AppointmentStatus.CONFIRMED) && 
           appointmentDate > now;
  },

  // Check if appointment can be rescheduled
  canBeRescheduled: (appointment: AppointmentDto): boolean => {
    const now = new Date();
    const appointmentDate = new Date(appointment.appointmentDateTime);
    return (appointment.status === AppointmentStatus.SCHEDULED || 
            appointment.status === AppointmentStatus.CONFIRMED) && 
           appointmentDate > now;
  },

  // Get appointment end time
  getEndTime: (appointment: AppointmentDto): string => {
    const startTime = new Date(appointment.appointmentDateTime);
    const endTime = new Date(startTime.getTime() + appointment.durationMinutes * 60000);
    return endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};
