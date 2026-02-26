import { useState, useEffect } from "react";
import { MetricCard } from "../components/MetricCard";
import { ConfidenceBar } from "../components/ConfidenceBar";
import { apiClient } from "../api/client";
import type { DashboardStats } from "../types";
import styles from "./Dashboard.module.css";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await apiClient.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
        // Mock data for demo
        setStats({
          totalDevices: 42,
          presentDevices: 28,
          absentDevices: 14,
          averageConfidence: 0.87,
          recentScans: [],
        });
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!stats) {
    return <div className={styles.error}>Failed to load dashboard</div>;
  }

  const confidencePercent = Math.round(stats.averageConfidence * 100);
  const onlinePercent =
    stats.totalDevices > 0
      ? Math.round((stats.presentDevices / stats.totalDevices) * 100)
      : 0;
  const offlinePercent =
    stats.totalDevices > 0
      ? Math.round((stats.absentDevices / stats.totalDevices) * 100)
      : 0;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <p className={styles.subtitle}>System overview and device status</p>
      </header>

      <div className={styles.metricsGrid}>
        <MetricCard
          label="Total Devices"
          value={stats.totalDevices}
          color="primary"
          subValue="registered"
        />
        <MetricCard
          label="Present"
          value={stats.presentDevices}
          color="secondary"
          subValue={`${onlinePercent}% online`}
        />
        <MetricCard
          label="Absent"
          value={stats.absentDevices}
          color="accent"
          subValue={`${offlinePercent}% offline`}
        />
        <MetricCard
          label="Avg Confidence"
          value={`${confidencePercent}%`}
          color="highlight"
          subValue="match quality"
        />
      </div>

      <section className={styles.confidenceSection}>
        <div className={styles.sectionHeader}>
          <h2>Confidence Distribution</h2>
          <p>Average system match confidence</p>
        </div>
        <div className={styles.confidenceBar}>
          <ConfidenceBar
            confidence={stats.averageConfidence}
            showLabel
            size="large"
          />
        </div>
      </section>

      {error && <div className={styles.banner}>{error}</div>}
    </div>
  );
}
