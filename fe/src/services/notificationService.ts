const API_URL = "http://localhost:8080/api/notifications";

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface NotificationDto {
  id: number;
  title: string;
  content: string;
  type: "MATCH_JOINED" | "MATCH_LEFT" | "MATCH_CANCELLED" | "MATCH_RESUMED" | "SYSTEM";
  relatedEntityId: number | null;
  isRead: boolean;
  createdAt: string;
  senderName: string;
  senderAvatar: string | null;
}

export const notificationService = {
  getNotifications: async (page = 0, size = 10): Promise<Page<NotificationDto>> => {
    const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to load notifications");
    }

    return response.json();
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await fetch(`${API_URL}/unread-count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to get unread notifications count");
    }

    return response.json();
  },

  markAsRead: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to mark notification as read");
    }
  },

  markAllAsRead: async (): Promise<void> => {
    const response = await fetch(`${API_URL}/read-all`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to mark all notifications as read");
    }
  },
};
