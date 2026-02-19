import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

export const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return createPortal(
    <div className={`toast toast-${type} ${isVisible ? 'toast-enter' : 'toast-exit'}`}>
      <div className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✗'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={() => setIsVisible(false)}>✕</button>
    </div>,
    document.body
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const show = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  };

  const success = (message, duration) => show(message, 'success', duration);
  const error = (message, duration) => show(message, 'error', duration);
  const warning = (message, duration) => show(message, 'warning', duration);
  const info = (message, duration) => show(message, 'info', duration);

  const hide = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => hide(toast.id)}
        />
      ))}
    </div>
  );

  return { show, success, error, warning, info, ToastContainer };
};

export default Toast;