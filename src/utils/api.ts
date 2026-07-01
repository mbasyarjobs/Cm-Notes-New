// Simple, fully typed API wrapper for backend communication

const API_BASE = "/api";

function getHeaders() {
  const token = localStorage.getItem("cm_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    if (response.status === 401) {
      localStorage.removeItem("cm_token");
      localStorage.removeItem("cm_user");
      window.dispatchEvent(new Event("auth_change"));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Terjadi kesalahan pada server");
    }

    return response.json() as Promise<T>;
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (response.status === 401 && endpoint !== "/auth/login") {
      localStorage.removeItem("cm_token");
      localStorage.removeItem("cm_user");
      window.dispatchEvent(new Event("auth_change"));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Terjadi kesalahan pada server");
    }

    return response.json() as Promise<T>;
  },

  async put<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      localStorage.removeItem("cm_token");
      localStorage.removeItem("cm_user");
      window.dispatchEvent(new Event("auth_change"));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Terjadi kesalahan pada server");
    }

    return response.json() as Promise<T>;
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem("cm_token");
      localStorage.removeItem("cm_user");
      window.dispatchEvent(new Event("auth_change"));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Terjadi kesalahan pada server");
    }

    return response.json() as Promise<T>;
  },
};
