const API_URL = "http://localhost:8080/api";

export interface VenueItem {
  id: number;
  name: string;
  address: string;
  district: string | null;
  lat: number | null;
  lng: number | null;
  sportTags: string[] | null;
  verified: boolean | null;
  googleMapsUrl: string | null;
}

export const venueService = {
  getVenues: async (sport?: string): Promise<VenueItem[]> => {
    const url = sport
      ? `${API_URL}/venues?sport=${encodeURIComponent(sport)}`
      : `${API_URL}/venues`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const err = new Error(`Không thể lấy danh sách sân chơi (HTTP ${response.status})`);
      throw err;
    }
    return response.json();
  },
};
