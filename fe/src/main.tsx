import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './styles/variables.css'
import './styles/global.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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
