'use client';

import { createContext, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  hideNotification: (id: string) => void;
  clearAll: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: NotificationType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    const notification: Notification = {
      id,
      type,
      message,
      duration,
    };

    setNotifications(prev => [...prev, notification]);

    // Utiliser react-hot-toast
    switch (type) {
      case 'success':
        toast.success(message, { duration });
        break;
      case 'error':
        toast.error(message, { duration });
        break;
      case 'info':
        toast(message, { duration });
        break;
      case 'warning':
        toast(message, { 
          duration,
          icon: '⚠️',
        });
        break;
    }

    // Auto-suppression après la durée
    setTimeout(() => {
      hideNotification(id);
    }, duration);
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    toast.dismiss();
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      showNotification,
      hideNotification,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};