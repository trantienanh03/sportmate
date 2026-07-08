import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './styles/variables.css'
import './styles/global.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Cấu hình interceptor cho global fetch để tự động đính kèm JWT token vào request header
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const token = localStorage.getItem("token");
  if (token) {
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : "";
    if (url.startsWith("/api") || url.includes("/api/")) {
      init = init || {};
      const headers = new Headers(init.headers || {});
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      init.headers = headers;
    }
  }
  return originalFetch(input, init);
};

// Khởi tạo QueryClient quản lý cache server-state cho toàn bộ ứng dụng
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,      // Dữ liệu coi là "tươi" trong 3 phút, không cần gọi lại API
      gcTime: 5 * 60 * 1000,         // Lưu trữ dữ liệu trong bộ nhớ cache 5 phút sau khi unmount
      retry: 1,                      // Tự động thử lại 1 lần nếu gặp lỗi mạng đột ngột
      refetchOnWindowFocus: false,   // Tránh refetch tự động gây gián đoạn khi tab lấy lại focus
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
