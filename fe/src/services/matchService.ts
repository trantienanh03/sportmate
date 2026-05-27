const API_URL = "http://localhost:8080/api";

export interface MatchHost {
  id: number;
  fullName: string;
  avatarUrl?: string;
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
    return handleResponse<MatchDetail>(response);
  },

  leave: async (id: number): Promise<MatchDetail> => {
    const response = await fetch(`${API_URL}/matches/${id}/join`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse<MatchDetail>(response);
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
};
