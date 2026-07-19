// URL của Backend API (Ví dụ trên Render: https://sportmate-be.onrender.com)
// Trên local, biến này sẽ rỗng và Vite dev server proxy sẽ tự động chuyển tiếp về localhost:8080
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || '';

// URL của WebSocket
export const WS_BASE_URL = API_BASE_URL ? `${API_BASE_URL}/ws` : '/ws';
