import React, { useEffect, useState } from 'react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 3500, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 350); // wait for exit animation
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const icons: Record<ToastType, string> = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    info: 'fa-circle-info',
  };

  return (
    <div className={`sm-toast sm-toast--${type} ${visible ? 'sm-toast--visible' : ''}`}>
      <i className={`fa-solid ${icons[type]} sm-toast__icon`}></i>
      <span className="sm-toast__message">{message}</span>
      <button className="sm-toast__close" onClick={() => { setVisible(false); setTimeout(onClose, 350); }}>
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

export default Toast;
