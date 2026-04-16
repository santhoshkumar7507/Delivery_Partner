import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const intervalRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await API.get('/notifications/unread-count/');
      setUnreadCount(data.count);
    } catch {
      // silently fail - user may have logged out
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await API.get('/notifications/');
      setNotifications(data.results || data);
      return data.results || data;
    } catch {
      return [];
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await API.put(`/notifications/${id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await API.post('/notifications/mark-all-read/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      intervalRef.current = setInterval(fetchUnreadCount, 5000);
    } else {
      setUnreadCount(0);
      setNotifications([]);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, notifications, fetchNotifications, markAsRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
