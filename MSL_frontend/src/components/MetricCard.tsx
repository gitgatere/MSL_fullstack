import type { ReactNode } from "react";
import { THEME } from "../styles/theme";
import styles from "./MetricCard.module.css";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: ReactNode;
  color?: "primary" | "secondary" | "accent" | "highlight";
}

export function MetricCard({
  label,
  value,
  subValue,
  icon,
  color = "primary",
}: MetricCardProps) {
  const colorMap = {
    primary: THEME.colors.primary,
    secondary: THEME.colors.secondary,
    accent: THEME.colors.accent,
    highlight: THEME.colors.highlight,
  };

  return (
    <div className={styles.card} style={{ "--accent-color": colorMap[color] } as any}>
      <div className={styles.header}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <label className={styles.label}>{label}</label>
      </div>
      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        {subValue && <div className={styles.subValue}>{subValue}</div>}
      </div>
      <div className={styles.accent} />
    </div>
  );
}
