const API_URL = "http://localhost:8080/api";

export interface SportItem {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
  displayOrder?: number;
  isActive: boolean;
}

let cachedSports: SportItem[] | null = null;

export const sportService = {
  getSports: async (): Promise<SportItem[]> => {
    if (cachedSports) return cachedSports;

    const response = await fetch(`${API_URL}/sports`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Không thể lấy danh sách môn thể thao");
    }

    const data = await response.json();
    cachedSports = data;
    return data;
  },

  getCachedSports: (): SportItem[] | null => cachedSports,
};
