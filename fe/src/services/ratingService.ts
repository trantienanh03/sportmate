const API_URL = "http://localhost:8080/api";

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch (e) {
      const textData = await response.text();
      if (textData) message = textData;
    }
    throw new Error(message);
  }
  
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    return {} as T;
  }
};

export interface RatingItemRequest {
  rateeId: number;
  skillScore: number;
  attitudeScore: number;
  comment?: string;
}

export interface RatingBatchRequest {
  matchId: number;
  ratings: RatingItemRequest[];
}

export const ratingService = {
  submitBatchRatings: async (data: RatingBatchRequest): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/ratings/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string }>(response);
  },

  getUnratedParticipantIds: async (matchId: number): Promise<number[]> => {
    const response = await fetch(`${API_URL}/ratings/pending?matchId=${matchId}`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<number[]>(response);
  }
};
