import styles from "./ConfidenceBar.module.css";

interface ConfidenceBarProps {
  confidence: number;
  showLabel?: boolean;
  size?: "small" | "medium" | "large";
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "#08605f";
  if (confidence >= 0.6) return "#177e89";
  if (confidence >= 0.4) return "#8e936d";
  return "#598381";
}

export function ConfidenceBar({
  confidence,
  showLabel = true,
  size = "medium",
}: ConfidenceBarProps) {
  const percentage = Math.min(Math.max(confidence * 100, 0), 100);
  const color = getConfidenceColor(confidence);

  return (
    <div className={`${styles.container} ${styles[`size-${size}`]}`}>
      <div className={styles.background}>
        <div
          className={styles.filled}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && (
        <span className={styles.label}>{Math.round(percentage)}%</span>
      )}
    </div>
  );
}
