const API_URL = "http://localhost:8080/api";

let cachedMatches: MatchDetail[] | null = null;
let cachedMyRooms: MatchDetail[] | null = null;

export interface MatchHost {
  id: number;
  fullName: string;
  avatarUrl?: string;
  badges?: string[];
}

export interface MatchVenue {
  id: number;
  name: string;
  address: string;
  district?: string;
  lat: number;
  lng: number;
  googleMapsUrl?: string;
}

export interface MatchParticipant {
  userId: number;
  fullName: string;
  avatarUrl?: string;
  role: string;
  status: string;
  badges?: string[];
}

export interface MatchComment {
  id: number;
  matchId: number;
  userId: number;
  userName: string;
  userAvatarUrl?: string;
  content: string;
  parentId?: number;
  replies?: MatchComment[];
  createdAt: string;
}

export interface MatchDetail {
  id: number;
  title: string;
  sport: string;
  description?: string;
  status: string;
  skillLevel: string;
  maxPlayers: number;
  currentPlayers: number;
  feePerPerson: number;
  startTime: string;
  endTime?: string;
  locationText?: string;
  lat?: number;
  lng?: number;
  host: MatchHost;
  venue?: MatchVenue | null;
  participants: MatchParticipant[];
  joined: boolean;
  distance?: number;
  imageUrl?: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const errorData = (await response.json()) as { message?: string };
      message = errorData.message ?? message;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
};

export interface ExploreParams {
  keyword?: string;
  sport?: string;
  skillLevel?: string;
  feeType?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export const matchService = {
  getMatch: async (id: number): Promise<MatchDetail> => {
    const response = await fetch(`${API_URL}/matches/${id}`, {
      credentials: "include",
    });
    return handleResponse<MatchDetail>(response);
  },

  join: async (id: number): Promise<MatchDetail> => {
    const response = await fetch(`${API_URL}/matches/${id}/join`, {
      method: "POST",
      credentials: "include",
    });
    const updated = await handleResponse<MatchDetail>(response);
    if (cachedMatches) cachedMatches = cachedMatches.map(m => m.id === id ? updated : m);
    if (cachedMyRooms) cachedMyRooms = cachedMyRooms.map(m => m.id === id ? updated : m);
    return updated;
  },

  leave: async (id: number): Promise<MatchDetail> => {
    const response = await fetch(`${API_URL}/matches/${id}/join`, {
      method: "DELETE",
      credentials: "include",
    });
    const updated = await handleResponse<MatchDetail>(response);
    if (cachedMatches) cachedMatches = cachedMatches.map(m => m.id === id ? updated : m);
    if (cachedMyRooms) cachedMyRooms = cachedMyRooms.map(m => m.id === id ? updated : m);
    return updated;
  },

  cancelMatch: async (id: number): Promise<MatchDetail> => {
    const response = await fetch(`${API_URL}/matches/${id}/cancel`, {
      method: "POST",
      credentials: "include",
    });
    const updated = await handleResponse<MatchDetail>(response);

    if (cachedMatches) {
      cachedMatches = cachedMatches.map((m) => (m.id === id ? updated : m));
    }
    if (cachedMyRooms) {
      cachedMyRooms = cachedMyRooms.map((m) => (m.id === id ? updated : m));
    }

    return updated;
  },

  resumeMatch: async (id: number): Promise<MatchDetail> => {
    const response = await fetch(`${API_URL}/matches/${id}/resume`, {
      method: "POST",
      credentials: "include",
    });
    const updated = await handleResponse<MatchDetail>(response);

    if (cachedMatches) {
      cachedMatches = cachedMatches.map((m) => (m.id === id ? updated : m));
    }
    if (cachedMyRooms) {
      cachedMyRooms = cachedMyRooms.map((m) => (m.id === id ? updated : m));
    }

    return updated;
  },

    createMatch: async (data: object): Promise<MatchDetail> => {
      const response = await fetch(`${API_URL}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<MatchDetail>(response);
    },
  
    generateDescription: async (data: object): Promise<{description: string}> => {
      const response = await fetch(`${API_URL}/matches/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<{description: string}>(response);
    },

  getMatches: async () => {
    const response = await fetch(`${API_URL}/matches`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await handleResponse<MatchDetail[]>(response);
    cachedMatches = data;
    return data;
  },

  exploreMatches: async (params: ExploreParams): Promise<MatchDetail[]> => {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append("keyword", params.keyword);
    if (params.sport) queryParams.append("sport", params.sport);
    if (params.skillLevel) queryParams.append("skillLevel", params.skillLevel);
    if (params.feeType) queryParams.append("feeType", params.feeType);
    if (params.lat) queryParams.append("lat", params.lat.toString());
    if (params.lng) queryParams.append("lng", params.lng.toString());
    if (params.radiusKm) queryParams.append("radiusKm", params.radiusKm.toString());

    const response = await fetch(`${API_URL}/matches/explore?${queryParams.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<MatchDetail[]>(response);
  },

  getMyRooms: async (): Promise<MatchDetail[]> => {
    const response = await fetch(`${API_URL}/matches/my-rooms`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await handleResponse<MatchDetail[]>(response);
    cachedMyRooms = data;
    return data;
  },

  updateMatchStatus: async (id: number, status: string): Promise<MatchDetail> => {
    const response = await fetch(`${API_URL}/matches/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    const updated = await handleResponse<MatchDetail>(response);
    
    // Update local caches on status change
    if (cachedMatches) {
      cachedMatches = cachedMatches.map(m => m.id === id ? updated : m);
    }
    if (cachedMyRooms) {
      cachedMyRooms = cachedMyRooms.map(m => m.id === id ? updated : m);
    }
    
    return updated;
  },

  getComments: async (matchId: number): Promise<MatchComment[]> => {
    const response = await fetch(`${API_URL}/matches/${matchId}/comments`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<MatchComment[]>(response);
  },

  addComment: async (matchId: number, content: string, parentId?: number): Promise<MatchComment> => {
    const response = await fetch(`${API_URL}/matches/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ matchId, content, parentId }),
    });
    return handleResponse<MatchComment>(response);
  },

  updateComment: async (commentId: number, matchId: number, content: string): Promise<MatchComment> => {
    const response = await fetch(`${API_URL}/matches/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ matchId, content }),
    });
    return handleResponse<MatchComment>(response);
  },

  deleteComment: async (commentId: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/matches/comments/${commentId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse<{ message: string }>(response);
  },

  getCachedMatches: (): MatchDetail[] | null => cachedMatches,
  hasCachedMatches: (): boolean => cachedMatches !== null,
  getCachedMyRooms: (): MatchDetail[] | null => cachedMyRooms,
  hasCachedMyRooms: (): boolean => cachedMyRooms !== null,
};
