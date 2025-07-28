import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ 
  notifications, 
  onRemove 
}) => {
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration);
        
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getBackgroundColor(notification.type)} border rounded-lg p-4 shadow-lg animate-slide-in`}
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 text-sm">{notification.title}</h4>
              <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
              
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook pour gérer les notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message: string, duration = 4000) => {
    addNotification({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message: string, duration = 6000) => {
    addNotification({ type: 'error', title, message, duration });
  };

  const showInfo = (title: string, message: string, duration = 4000) => {
    addNotification({ type: 'info', title, message, duration });
  };

  const showWarning = (title: string, message: string, duration = 5000) => {
    addNotification({ type: 'warning', title, message, duration });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};