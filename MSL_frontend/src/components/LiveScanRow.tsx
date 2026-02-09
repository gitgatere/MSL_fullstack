import type { ScanResult } from "../types";
import { ConfidenceBar } from "./ConfidenceBar";
import styles from "./LiveScanRow.module.css";

interface LiveScanRowProps {
  scan: ScanResult;
}

function shortenId(id: string): string {
  return id.substring(0, 8).toUpperCase();
}

export function LiveScanRow({ scan }: LiveScanRowProps) {
  const timestamp = new Date(scan.timestamp);
  const timeString = timestamp.toLocaleTimeString();
  const location = scan.locationId || "Unknown";

  return (
    <div className={styles.row}>
      <div className={styles.deviceInfo}>
        <div className={styles.deviceId}>{shortenId(scan.deviceId)}</div>
        <div className={styles.timestamp}>{timeString}</div>
      </div>
      <div className={styles.confidence}>
        <ConfidenceBar confidence={scan.confidence} showLabel size="small" />
      </div>
      <div className={styles.location}>{location}</div>
      <div
        className={`${styles.status} ${scan.matched ? styles.matched : styles.unmatched}`}
      >
        {scan.matched ? "✓ Matched" : "Unmatched"}
      </div>
    </div>
  );
}
