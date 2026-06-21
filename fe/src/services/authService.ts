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
      credentials: "include",
    });

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
      credentials: "include",
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
      credentials: "include",
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
};
