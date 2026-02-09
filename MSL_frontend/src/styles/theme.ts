export const COLORS = {
  primary: "#08605f",
  secondary: "#177e89",
  muted: "#598381",
  accent: "#8e936d",
  highlight: "#a2ad59",
} as const;

export const THEME = {
  colors: COLORS,
  background: {
    primary: "#0f1419",
    secondary: "#1a1f26",
    tertiary: "#242a33",
  },
  text: {
    primary: "#e8eaed",
    secondary: "#b8bcc4",
    muted: "#8a8f99",
  },
  transitions: {
    fast: "150ms ease-out",
    normal: "200ms ease-out",
    slow: "250ms ease-out",
  },
  radius: {
    small: "4px",
    medium: "8px",
    large: "12px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
} as const;
