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

  checkEmailExists: async (email: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/check-email?email=${encodeURIComponent(email)}&t=${Date.now()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Kiểm tra email thất bại");
    }

    return response.json();
  },

  getProfile: async () => {
    const response = await fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return response.json();
  },

  updateProfile: async (data: any) => {
    const response = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Build a more descriptive error message for debugging
      let message = `Update profile failed (HTTP ${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData && (errorData.message || errorData.error)) {
          message += `: ${errorData.message || errorData.error}`;
        } else {
          // include serialized body when useful
          message += `: ${JSON.stringify(errorData)}`;
        }
      } catch (e) {
        const textData = await response.text();
        if (textData) message += `: ${textData}`;
      }
      throw new Error(message);
    }

    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    return response.text();
  },
};
