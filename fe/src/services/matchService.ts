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
        // Backend returns map/object where keys could be field names or standard error message
        if (errorData.message) {
          message = errorData.message;
        } else if (typeof errorData === 'object') {
          // If it's field validation errors, extract first error message
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
};
