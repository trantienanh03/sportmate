const API_URL = "/api/auth";

let cachedProfiles: Record<number, any> = {};

export const authService = {
  login: async (data: any) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    const res = await response.json();
    if (res.token) {
      localStorage.setItem("token", res.token);
    }
    return res;
  },

  register: async (data: any) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    const res = await response.json();
    if (res.token) {
      localStorage.setItem("token", res.token);
    }
    return res;
  },

  checkEmailExists: async (email: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/check-email?email=${encodeURIComponent(email)}&t=${Date.now()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
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
    });

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return response.json();
  },

  // Lấy thông tin profile của người dùng khác qua ID
  getOtherProfile: async (id: number) => {
    const response = await fetch(`${API_URL}/profile/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Không thể lấy thông tin người dùng");
    }

    const data = await response.json();
    cachedProfiles[id] = data;
    return data;
  },

  updateProfile: async (data: any) => {
    const response = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let message = "Cập nhật hồ sơ thất bại";
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

  logout: async () => {
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    localStorage.removeItem("token");

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    return response.text();
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      let message = "Gửi yêu cầu khôi phục thất bại";
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {
        const errorText = await response.text();
        if (errorText) message = errorText;
      }
      throw new Error(message);
    }

    return response.text();
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      let message = "Đặt lại mật khẩu thất bại";
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {
        const errorText = await response.text();
        if (errorText) message = errorText;
      }
      throw new Error(message);
    }

    return response.text();
  },
  submitAppeal: async (payload: { email: string; title: string; details: string }) => {
    const response = await fetch(`${API_URL}/appeal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(text || "Gửi đơn kháng cáo thất bại");
    }

    return response.text();
  },

  getCachedProfile: (id: number): any | undefined => cachedProfiles[id],
  hasCachedProfile: (id: number): boolean => cachedProfiles[id] !== undefined,
};
