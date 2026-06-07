const API_URL = "http://localhost:8080/api/rooms";

export interface RoomSummaryDto {
  id: number;
  name: string;
  type: string;
  matchId: number | null;
  participantCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface MessageDto {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  type: string;
  content: string;
  metadata: string | null;
  createdAt: string;
}

export const chatService = {
  getRooms: async (): Promise<RoomSummaryDto[]> => {
    const response = await fetch(`${API_URL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to load rooms");
    }

    return response.json();
  },

  getMessages: async (roomId: number, before?: number): Promise<MessageDto[]> => {
    let url = `${API_URL}/${roomId}/messages`;
    if (before) {
      url += `?before=${before}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to load messages");
    }

    return response.json();
  },

  joinRoom: async (roomId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${roomId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to join room");
    }
  },

  leaveRoom: async (roomId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${roomId}/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to leave room");
    }
  },
};
