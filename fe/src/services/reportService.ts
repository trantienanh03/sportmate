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
export interface ReportRequest {
  reportedMatchId?: number;
  reportedUserId?: number;
  reason: string;
  details?: string;
}

export interface ReportResponse {
  id: number;
  reporterId: number;
  reporterName: string;
  reportedMatchId?: number;
  reportedUserId?: number;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
}

export const reportService = {
  checkReport: async (matchId: number): Promise<{ hasReported: boolean; reportId?: number }> => {
    const response = await fetch(`${API_URL}/reports/check?matchId=${matchId}`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<{ hasReported: boolean; reportId?: number }>(response);
  },

  createReport: async (data: ReportRequest): Promise<ReportResponse> => {
    const response = await fetch(`${API_URL}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<ReportResponse>(response);
  },
  
  deleteReport: async (reportId: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/reports/${reportId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ message: string }>(response);
  }
};
