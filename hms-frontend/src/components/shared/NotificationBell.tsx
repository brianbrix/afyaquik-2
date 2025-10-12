import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Badge, Dropdown } from 'react-bootstrap';
import { WS_BASE_URL } from '../../services/baseUrls';

interface Notification {
  id: number;
  content: string;
  read: boolean;
  sentAt: string;
}

const WS_URL = WS_BASE_URL;

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const clientRef = useRef<Client | null>(null);
  const tenantId = user?.tenantId || 'clinic-a';
  const recipientId = user?.username;

  useEffect(() => {
    if (!recipientId) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      client.subscribe(`/topic/notifications.${tenantId}.${recipientId}`, (msg) => {
        const notif: Notification = JSON.parse(msg.body);
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    };
    client.activate();
    clientRef.current = client;
    return () => {
      client.deactivate();
    };
  }, [tenantId, recipientId]);

  // TODO: Fetch initial notifications from backend via REST API

  const markAllRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    // TODO: Call backend to mark as read
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" className="position-relative p-0 border-0" style={{fontSize:24}}>
        <span className="bi bi-bell"></span>
        {unreadCount > 0 && (
          <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu style={{minWidth:320, maxHeight:400, overflowY:'auto'}}>
        <Dropdown.Header>Notifications</Dropdown.Header>
        {notifications.length === 0 && <div className="px-3 py-2 text-muted">No notifications</div>}
        {notifications.map(n => (
          <Dropdown.Item key={n.id} className={!n.read ? 'fw-bold' : ''}>
            <div>{n.content}</div>
            <div className="small text-muted">{new Date(n.sentAt).toLocaleString()}</div>
          </Dropdown.Item>
        ))}
        <Dropdown.Divider />
        <Dropdown.Item onClick={markAllRead} disabled={unreadCount === 0}>Mark all as read</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
