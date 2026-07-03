import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '@/sockets/socketManager';
import type {
  ConsultationStatusEvent,
  NewConsultationEvent,
} from '@/types/api';
import { useAuth } from './AuthContext';

export interface AppNotification {
  id: string;
  type: 'new_consultation' | 'consultation_accepted' | 'consultation_declined';
  title: string;
  body: string;
  consultationId: string;
  createdAt: string;
  read: boolean;
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const pushNotification = useCallback(
    (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      setNotifications((prev) => [
        {
          ...notification,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
    },
    [],
  );

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      setNotifications([]);
      return;
    }

    const sock = connectSocket(token);
    setSocket(sock);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onConnectError = () => setIsConnected(false);

    const onNewConsultation = (event: NewConsultationEvent) => {
      pushNotification({
        type: 'new_consultation',
        title: event.urgency === 'high' ? 'Urgent consultation request' : 'New consultation request',
        body: `${event.referenceCode} • ${event.consultationDate} at ${event.timeSlot}`,
        consultationId: event.id,
      });
    };

    const onAccepted = (event: ConsultationStatusEvent) => {
      pushNotification({
        type: 'consultation_accepted',
        title: 'Booking confirmed',
        body: `Your consultation ${event.referenceCode} has been accepted.`,
        consultationId: event.id,
      });
    };

    const onDeclined = (event: ConsultationStatusEvent) => {
      pushNotification({
        type: 'consultation_declined',
        title: 'Booking declined',
        body: `Your consultation ${event.referenceCode} was declined.`,
        consultationId: event.id,
      });
    };

    sock.on('connect', onConnect);
    sock.on('disconnect', onDisconnect);
    sock.on('connect_error', onConnectError);
    sock.on('new_consultation', onNewConsultation);
    sock.on('consultation_accepted', onAccepted);
    sock.on('consultation_declined', onDeclined);
    setIsConnected(sock.connected);

    return () => {
      sock.off('connect', onConnect);
      sock.off('disconnect', onDisconnect);
      sock.off('connect_error', onConnectError);
      sock.off('new_consultation', onNewConsultation);
      sock.off('consultation_accepted', onAccepted);
      sock.off('consultation_declined', onDeclined);
    };
  }, [isAuthenticated, token, pushNotification]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const value = useMemo<SocketContextValue>(
    () => ({
      socket,
      isConnected,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      markAllRead,
      clearNotifications,
    }),
    [socket, isConnected, notifications, markAllRead, clearNotifications],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
}
