export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || '';

export const WS_BASE_URL = API_BASE_URL ? `${API_BASE_URL}/ws` : '/ws';
