import type { ApiResponse, DashboardStats, ScanResult } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("/stats");
  }

  async getLiveScans(): Promise<ScanResult[]> {
    return this.request<ScanResult[]>("/live");
  }

  async submitScan(payload: {
    deviceId: string;
    fingerprint: string;
    locationId?: string;
  }): Promise<ApiResponse<ScanResult>> {
    return this.request<ApiResponse<ScanResult>>("/scan", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const apiClient = new ApiClient();
