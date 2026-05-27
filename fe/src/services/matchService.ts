const API_URL = "http://localhost:8080/api/matches";

export const matchService = {
  createMatch: async (data: any) => {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let message = "Tạo trận đấu thất bại";
      try {
        const errorData = await response.json();
        if (errorData.message) {
          message = errorData.message;
        } else if (typeof errorData === "object") {
          const values = Object.values(errorData);
          if (values.length > 0) {
            message = String(values[0]);
          }
        }
      } catch (e) {
        const textData = await response.text();
        if (textData) message = textData;
      }
      throw new Error(message);
    }

    return response.json();
  },

  getMatches: async () => {
    const response = await fetch(`${API_URL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Lấy danh sách trận đấu thất bại");
    }

    return response.json();
  },
};
