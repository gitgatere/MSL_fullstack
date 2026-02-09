import { useState, useEffect } from "react";
import { LiveScanRow } from "../components/LiveScanRow";
import { apiClient } from "../api/client";
import type { ScanResult } from "../types";
import styles from "./Live.module.css";

// Mock data generator
function generateMockScans(count: number): ScanResult[] {
  const devices = ["DEV001", "DEV002", "DEV003", "DEV004", "DEV005"];
  const locations = ["Lab A", "Lab B", "Office", "Hallway", null];

  return Array.from({ length: count }, (_, i) => ({
    id: `scan-${Date.now()}-${i}`,
    deviceId: devices[Math.floor(Math.random() * devices.length)],
    confidence: Math.random() * 0.4 + 0.6,
    locationId:
      locations[Math.floor(Math.random() * locations.length)] || null,
    timestamp: new Date(Date.now() - Math.random() * 30000).toISOString(),
    matched: Math.random() > 0.2,
  }));
}

export function Live() {
  const [scans, setScans] = useState<ScanResult[]>(generateMockScans(8));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScans() {
      try {
        setLoading(true);
        const data = await apiClient.getLiveScans();
        setScans(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load scans");
        // Use mock data on error
        setScans(generateMockScans(8));
      } finally {
        setLoading(false);
      }
    }

    loadScans();
    const interval = setInterval(loadScans, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.live}>
      <header className={styles.header}>
        <h1>Live Monitor</h1>
        <p className={styles.subtitle}>Real-time scan results</p>
        <span className={styles.status}>
          {scans.length}
          <span className={styles.dot} /> Active scans
        </span>
      </header>

      {error && <div className={styles.banner}>{error}</div>}

      <div className={styles.container}>
        {loading && scans.length === 0 ? (
          <div className={styles.loading}>Loading scans...</div>
        ) : scans.length === 0 ? (
          <div className={styles.empty}>No recent scans</div>
        ) : (
          <div className={styles.scansList}>
            <div className={styles.listHeader}>
              <span className={styles.col1}>Device</span>
              <span className={styles.col2}>Confidence</span>
              <span className={styles.col3}>Location</span>
              <span className={styles.col4}>Status</span>
            </div>
            {scans.map((scan) => (
              <LiveScanRow key={scan.id} scan={scan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
