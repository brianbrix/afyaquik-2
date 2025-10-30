import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRoleContext } from '../../hooks/useRoleContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Badge, Dropdown, Spinner } from 'react-bootstrap';
import { WS_BASE_URL } from '../../services/baseUrls';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';

interface Notification {
  id: number;
  content: string;
  read: boolean;
  sentAt: string;
  type?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

const WS_URL = WS_BASE_URL;

// API functions for notifications
const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await apiClient.get('/notifications');
  if (response.status !== 200) {
    throw new Error('Failed to fetch notifications');
  }
  return response.data.data;
};

const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  const response = await apiClient.patch(`/notifications/${notificationId}/read`);
  if (response.status !== 200) {
    throw new Error('Failed to mark notification as read');
  }
};

const markAllNotificationsAsRead = async (): Promise<void> => {
  const response = await apiClient.patch('/notifications/mark-all-read');
  if (response.status !== 200) {
    throw new Error('Failed to mark all notifications as read');
  }
};

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { activeRole } = useRoleContext();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const clientRef = useRef<Client | null>(null);
  const tenantId = user?.tenantId || 'clinic-a';
  const recipientId = user?.username;

  // Fetch notifications from API
  const { data: apiNotifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id, activeRole],
    queryFn: fetchNotifications,
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Update local state when API data changes
  useEffect(() => {
    if (apiNotifications.length > 0) {
      setNotifications(apiNotifications);
      const unread = apiNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  }, [apiNotifications]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!recipientId) return;
    
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
    });
    
    client.onConnect = () => {
      console.log('Connected to notification WebSocket');
      client.subscribe(`/topic/notifications.${tenantId}.${recipientId}`, (msg) => {
        try {
          const notif: Notification = JSON.parse(msg.body);
          setNotifications((prev) => [notif, ...prev]);
          setUnreadCount((prev) => prev + 1);
          // Invalidate and refetch notifications with active role
          queryClient.invalidateQueries({ queryKey: ['notifications', user?.id, activeRole] });
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('WebSocket STOMP error:', frame);
    };

    client.activate();
    clientRef.current = client;
    
    return () => {
      client.deactivate();
    };
  }, [tenantId, recipientId, user?.id, activeRole, queryClient]);

  // Mutation for marking all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id, activeRole] });
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
    }
  });

  // Mutation for marking individual notification as read
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, notificationId) => {
      setNotifications((prev) => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
    }
  });

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'URGENT': return 'danger';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" className="position-relative p-0 border-0" style={{fontSize:24}}>
        <span className="bi bi-bell-fill" style={{color: '#000'}}></span>
        {unreadCount > 0 && (
          <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu style={{minWidth:560, maxWidth:720, maxHeight:500, overflowY:'auto', whiteSpace:'normal', wordBreak:'break-word'}}>
        <Dropdown.Header className="d-flex justify-content-between align-items-center">
          <div>
            <span>Notifications</span>
            {activeRole && (
              <small className="text-muted d-block">Role: {activeRole}</small>
            )}
          </div>
          {isLoading && <Spinner animation="border" size="sm" />}
        </Dropdown.Header>
        
        {error && (
          <Dropdown.ItemText className="text-danger small">
            <i className="bi bi-exclamation-triangle me-1"></i>
            Error loading notifications
          </Dropdown.ItemText>
        )}
        
        {isLoading && notifications.length === 0 && (
          <Dropdown.ItemText className="text-center py-3">
            <Spinner animation="border" size="sm" />
            <div className="mt-2 small text-muted">Loading notifications...</div>
          </Dropdown.ItemText>
        )}
        
        {!isLoading && notifications.length === 0 && (
          <Dropdown.ItemText className="text-center py-3 text-muted">
            <i className="bi bi-bell-slash display-6 d-block mb-2"></i>
            No notifications
          </Dropdown.ItemText>
        )}
        
        {notifications.map(n => (
          <Dropdown.Item 
            key={n.id} 
            className={`${!n.read ? 'fw-bold' : ''} ${n.priority ? `border-start border-3 border-${getPriorityColor(n.priority)}` : ''}`}
            onClick={() => !n.read && handleMarkAsRead(n.id)}
            style={{ cursor: !n.read ? 'pointer' : 'default' }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2">
                  {n.priority && (
                    <Badge bg={getPriorityColor(n.priority)} className="small">
                      {n.priority}
                    </Badge>
                  )}
                  {!n.read && <div className="bg-primary rounded-circle" style={{width: 8, height: 8}}></div>}
                </div>
                <div className="mt-1">{n.content}</div>
                <div className="small text-muted mt-1">
                  {new Date(n.sentAt).toLocaleString()}
                </div>
              </div>
            </div>
          </Dropdown.Item>
        ))}
        
        {notifications.length > 0 && (
          <>
            <Dropdown.Divider />
            <Dropdown.Item 
              onClick={handleMarkAllRead} 
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              className="text-center"
            >
              {markAllReadMutation.isPending ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Marking as read...
                </>
              ) : (
                <>
                  <i className="bi bi-check-all me-2"></i>
                  Mark all as read
                </>
              )}
            </Dropdown.Item>
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};
