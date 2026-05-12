const API_URL = "http://localhost:8080/api/auth";

export const authService = {
  login: async (data: any) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let message = "Login failed";
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {
        const textData = await response.text();
        if (textData) message = textData;
      }
      throw new Error(message);
    }

    return response.json();
  },

  register: async (data: any) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let message = "Registration failed";
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {
        const textData = await response.text();
        if (textData) message = textData;
      }
      throw new Error(message);
    }

    return response.json();
  },
};
