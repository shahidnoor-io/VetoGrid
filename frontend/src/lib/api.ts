/**
 * CampusOS AI - Unified Frontend API Client
 * Provides strongly-typed interactions with FastAPI backend endpoints.
 * Dynamically resolves internal Vercel service bindings (BACKEND_URL) on the server
 * and relative paths / NEXT_PUBLIC_API_URL on the client.
 */

export function getApiBaseUrl(): string {
  // 1. Client-side browser: route through same-origin rewrite /api/v1
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
  }

  // 2. Server-side / SSR: use internal Vercel service binding if available
  if (process.env.BACKEND_URL) {
    const base = process.env.BACKEND_URL.replace(/\/$/, "");
    return `${base}/api/v1`;
  }

  // 3. Local development fallback
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
}

export async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errJson = await res.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Scheduling & Timetable
  getDatasetSummary: () => fetchJson<any>("/schedule/dataset-summary"),
  getCurrentSchedule: () => fetchJson<any>("/schedule/current"),
  getScheduleAfterDisruption: () => fetchJson<any>("/schedule/after-disruption"),
  solveSchedule: () => fetchJson<any>("/schedule/solve", { method: "POST" }),
  applyDisruption: () => fetchJson<any>("/schedule/apply-disruption", { method: "POST" }),
  uploadDataset: async (file: File) => {
    const baseUrl = getApiBaseUrl();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${baseUrl}/schedule/upload-dataset`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      let err = `Upload failed with status ${res.status}`;
      try {
        const j = await res.json();
        err = j.detail || err;
      } catch {}
      throw new Error(err);
    }
    return await res.json();
  },
  uploadDisruption: async (file: File) => {
    const baseUrl = getApiBaseUrl();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${baseUrl}/schedule/upload-disruption`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      let err = `Upload failed with status ${res.status}`;
      try {
        const j = await res.json();
        err = j.detail || err;
      } catch {}
      throw new Error(err);
    }
    return await res.json();
  },

  // Venue Bookings & RBAC
  listBookings: () => fetchJson<any>("/bookings"),
  createBooking: (payload: {
    event_name: string;
    room_id: string;
    day: string;
    start_period: number;
    end_period: number;
    attendees: number;
    requested_by: string;
    requester_role?: string;
    priority_tier?: number;
  }) => fetchJson<any>("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  actionBooking: (
    bookingId: string,
    payload: {
      action: "APPROVE" | "REJECT";
      approver_id: string;
      approver_role: string;
      notes?: string;
    }
  ) => fetchJson<any>(`/bookings/${bookingId}/action`, { method: "POST", body: JSON.stringify(payload) }),

  // Red-Team-Proof AI Assistant
  chatAssistant: (payload: { prompt: string; user_role?: string; requester_id?: string }) =>
    fetchJson<any>("/assistant/chat", { method: "POST", body: JSON.stringify(payload) }),

  // Mathematical Explainer
  explainSession: (sessionId: string) => fetchJson<any>(`/explain/session/${sessionId}`),
  explainBooking: (bookingId: string) => fetchJson<any>(`/explain/booking/${bookingId}`),
  explainQuery: (query: string) => fetchJson<any>("/explain/query", { method: "POST", body: JSON.stringify({ query }) }),

  // Admin Tools & Roles
  getDemoRoles: () => fetchJson<any>("/admin/roles"),
  resetDemo: () => fetchJson<any>("/admin/reset-demo", { method: "POST" }),
};
