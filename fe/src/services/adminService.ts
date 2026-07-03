/**
 * adminService.ts
 * Tập trung toàn bộ các lời gọi API liên quan đến Admin Panel.
 * Mọi fetch từ các trang Admin đều phải đi qua đây — không gọi fetch trực tiếp trong component.
 */

const BASE = '/api/admin';

// ─── Helper ────────────────────────────────────────────────────────────────

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(text || `HTTP ${response.status}`);
  }
  if (response.status === 204) return null as T;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  if (!text) return null as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export const adminDashboardService = {
  getStats: () => request<any>(`${BASE}/dashboard`),
};

// ─── Users ─────────────────────────────────────────────────────────────────

export const adminUserService = {
  getList: (params: URLSearchParams) =>
    request<any>(`${BASE}/users?${params}`),

  getDetails: (userId: number) =>
    request<any>(`${BASE}/users/${userId}/details`),

  updateRole: (userId: number, role: string) =>
    request<void>(`${BASE}/users/${userId}/role?role=${role}`, { method: 'PUT' }),

  updateReputation: (userId: number, score: number) =>
    request<void>(`${BASE}/users/${userId}/reputation?score=${score}`, { method: 'PUT' }),

  updateStatus: (userId: number, action: string, days?: number) => {
    const qs = days ? `action=${action}&days=${days}` : `action=${action}`;
    return request<void>(`${BASE}/users/${userId}/status?${qs}`, { method: 'PUT' });
  },
};

// ─── Matches ────────────────────────────────────────────────────────────────

export const adminMatchService = {
  getList: (params: URLSearchParams) =>
    request<any>(`${BASE}/matches?${params}`),

  cancelMatch: (matchId: number) =>
    request<string>(`${BASE}/matches/${matchId}`, { method: 'DELETE' }),
};

// ─── Reports ────────────────────────────────────────────────────────────────

export const adminReportService = {
  getList: (params: URLSearchParams) =>
    request<any>(`${BASE}/reports?${params}`),

  handleAction: (reportId: number, action: string, penaltyScore?: number) => {
    let url = `${BASE}/reports/${reportId}/action?action=${action}`;
    if (penaltyScore !== undefined) url += `&penaltyScore=${penaltyScore}`;
    return request<void>(url, { method: 'PUT' });
  },
};

// ─── Categories ─────────────────────────────────────────────────────────────

export const adminCategoryService = {
  getAll: () => request<any>(`${BASE}/categories`),

  createSport: (body: object) =>
    request<any>(`${BASE}/categories/sports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  updateSport: (id: number, body: object) =>
    request<any>(`${BASE}/categories/sports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  createVenue: (body: object) =>
    request<any>(`${BASE}/categories/venues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  updateVenue: (id: number, body: object) =>
    request<any>(`${BASE}/categories/venues/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  toggleVenueVisibility: (id: number) =>
    request<any>(`${BASE}/categories/venues/${id}/toggle-visibility`, { method: 'PATCH' }),
};

// ─── Bills ──────────────────────────────────────────────────────────────────

export const adminBillService = {
  getList: (params: URLSearchParams) =>
    request<any>(`${BASE}/bills?${params}`),

  getPayments: (billId: number) =>
    request<any[]>(`${BASE}/bills/${billId}/payments`),
};
