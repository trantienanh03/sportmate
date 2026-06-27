const API_URL = 'http://localhost:8080/api/friends';

export interface FriendDto {
  userId: number;
  fullName: string;
  avatarUrl: string;
  badges: string[];
  status: string;
  friendshipId: number;
}

export interface FriendshipStatusDto {
  status: string; // NONE, PENDING_SENT, PENDING_RECEIVED, FRIENDS
}

export const friendshipService = {
  sendFriendRequest: async (userId: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/request/${userId}`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Failed to send friend request');
    }
    return response.json();
  },

  acceptFriendRequest: async (userId: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/accept/${userId}`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Failed to accept friend request');
    }
    return response.json();
  },

  rejectFriendRequest: async (userId: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/reject/${userId}`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Failed to reject friend request');
    }
    return response.json();
  },

  unfriend: async (userId: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Failed to unfriend');
    }
    return response.json();
  },

  getMyFriends: async (): Promise<FriendDto[]> => {
    const response = await fetch(`${API_URL}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch friends');
    return response.json();
  },

  getPendingRequests: async (): Promise<FriendDto[]> => {
    const response = await fetch(`${API_URL}/requests`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch pending requests');
    return response.json();
  },

  getFriendshipStatus: async (userId: number): Promise<FriendshipStatusDto> => {
    const response = await fetch(`${API_URL}/user/${userId}/status`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch friendship status');
    return response.json();
  },

  getUserFriends: async (userId: number): Promise<FriendDto[]> => {
    const response = await fetch(`${API_URL}/user/${userId}/list`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Failed to fetch user friends');
    }
    return response.json();
  }
};
