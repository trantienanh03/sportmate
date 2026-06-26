import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { notificationService, type NotificationDto } from "../services/notificationService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "../components/NotificationToast/NotificationToast.css";

interface ToastMessage {
  id: string;
  title: string;
  content: string;
  senderName: string;
  senderAvatar: string | null;
  roomId: number;
  type: string;
}

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
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const clientRef = useRef<Client | null>(null);

  const showToast = (notif: NotificationDto) => {
    const id = Math.random().toString();
    
    let toastTitle = notif.title;
    if (notif.type === "BILL_CREATED") {
      toastTitle = "Hóa đơn chia tiền mới";
    } else if (notif.type === "BILL_PAID") {
      toastTitle = "Đã báo thanh toán";
    } else if (notif.type === "BILL_CONFIRMED") {
      toastTitle = "Xác nhận thanh toán";
    } else if (notif.type === "MATCH_REVIEW_REQUEST") {
      toastTitle = "Yêu cầu đánh giá đồng đội";
    }

    const newToast = {
      id,
      title: toastTitle,
      content: notif.content,
      senderName: notif.senderName,
      senderAvatar: notif.senderAvatar,
      roomId: notif.relatedEntityId as number,
      type: notif.type
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

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
          
          // Kiểm tra nếu người dùng đang ở trong chính phòng chat này
          const isViewingThisRoom = window.location.pathname === "/messages" && 
            new URLSearchParams(window.location.search).get("roomId") === String(newNotif.relatedEntityId);

          const isBillOrMsg = newNotif.type === "NEW_MESSAGE" || 
            newNotif.type === "BILL_CREATED" || 
            newNotif.type === "BILL_PAID" || 
            newNotif.type === "BILL_CONFIRMED";

          if (isBillOrMsg && isViewingThisRoom) {
            // Tự động mark read trên backend nếu đang xem trực tiếp phòng này
            notificationService.markAsRead(newNotif.id).catch(err => console.error(err));
            setNotifications((prev) => [{ ...newNotif, isRead: true }, ...prev]);
          } else {
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);

            if (isBillOrMsg || newNotif.type === "MATCH_REVIEW_REQUEST") {
              showToast(newNotif);
            }
          }
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

      {/* Container hiển thị các Toast thông báo tin nhắn mới */}
      <div className="notification-toast-container">
        {toasts.map((toast) => {
          const isBillType = toast.type === "BILL_CREATED" || toast.type === "BILL_PAID" || toast.type === "BILL_CONFIRMED";
          const isReviewType = toast.type === "MATCH_REVIEW_REQUEST";
          return (
            <div
              key={toast.id}
              className={`notification-toast-card ${
                isBillType ? "toast-bill-notification" : isReviewType ? "toast-match-review" : ""
              }`}
              onClick={() => {
                if (toast.type === "MATCH_REVIEW_REQUEST") {
                  navigate(`/matches/${toast.roomId}`);
                } else {
                  navigate(`/messages?roomId=${toast.roomId}`);
                }
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
              }}
            >
              <div className="toast-avatar-wrapper">
                {toast.senderAvatar ? (
                  <img src={toast.senderAvatar} alt={toast.senderName} className="toast-avatar-img" />
                ) : (
                  <span className="toast-avatar-placeholder">
                    {toast.senderName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="toast-content-wrapper">
                <div className="toast-room-title">
                  {toast.type === "BILL_CREATED" && (
                    <i className="fa-solid fa-file-invoice-dollar me-1 text-success"></i>
                  )}
                  {toast.type === "BILL_PAID" && (
                    <i className="fa-solid fa-receipt me-1 text-warning"></i>
                  )}
                  {toast.type === "BILL_CONFIRMED" && (
                    <i className="fa-solid fa-circle-check me-1 text-success"></i>
                  )}
                  {toast.type === "MATCH_REVIEW_REQUEST" && (
                    <i className="fa-solid fa-star me-1 text-warning"></i>
                  )}
                  {toast.title}
                </div>
                <div className="toast-sender-name">{toast.senderName}</div>
                <p className="toast-message-text">{toast.content}</p>
              </div>
            <button
              className="toast-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          );
        })}
      </div>
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
