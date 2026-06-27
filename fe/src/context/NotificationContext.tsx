import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { notificationService, type NotificationDto } from "../services/notificationService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface NotificationContextType {
  notifications: NotificationDto[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (page?: number, size?: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const WS_URL = "http://localhost:8080/ws";

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const clientRef = useRef<Client | null>(null);

  const fetchNotifications = async (page = 0, size = 10) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications(page, size);
      if (page === 0) {
        setNotifications(data.content);
      } else {
        setNotifications((prev) => [...prev, ...data.content]);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const { unreadCount: count } = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications(0, 10);
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {},
      debug: (_str) => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/notifications/${user.id}`, (message) => {
        if (message.body) {
          const newNotif: NotificationDto = JSON.parse(message.body);
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      });

      client.subscribe(`/topic/friends/${user.id}`, (message) => {
        if (message.body.includes('FRIEND_REJECTED') || message.body.includes('FRIEND_REMOVED')) {
          window.dispatchEvent(new CustomEvent('friendship_update_event', { detail: message.body }));
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP Error in notifications channel:", frame.headers["message"]);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
