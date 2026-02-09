export interface Device {
  id: string;
  name: string;
  fingerprint: string;
  present: boolean;
}

export interface ScanResult {
  id: string;
  deviceId: string;
  confidence: number;
  locationId: string | null;
  timestamp: string;
  matched: boolean;
}

export interface DashboardStats {
  totalDevices: number;
  presentDevices: number;
  absentDevices: number;
  averageConfidence: number;
  recentScans: ScanResult[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
