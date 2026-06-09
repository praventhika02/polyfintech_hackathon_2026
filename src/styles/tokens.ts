export const colors = {
  ink: "#0F172A",
  slate: "#334155",
  mist: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  positive: "#15803D",
  warning: "#B45309",
  danger: "#B91C1C",
  signal: "#0F766E",
  accent: "#2563EB"
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px"
} as const;

export const typography = {
  body: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  display: "var(--font-sora), ui-sans-serif, system-ui, sans-serif",
  weights: {
    regular: 400,
    medium: 600,
    bold: 800
  }
} as const;

export const radius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  pill: "999px"
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
  md: "0 8px 24px rgba(15, 23, 42, 0.08)",
  lg: "0 18px 44px rgba(15, 23, 42, 0.12)"
} as const;

export const zIndex = {
  base: 0,
  nav: 30,
  overlay: 50,
  modal: 80,
  toast: 100
} as const;

export const animation = {
  fast: "150ms",
  normal: "240ms",
  slow: "420ms",
  easing: "cubic-bezier(0.22, 1, 0.36, 1)"
} as const;

export const glass = {
  background: "rgba(255, 255, 255, 0.82)",
  border: "1px solid rgba(226, 232, 240, 0.72)",
  backdropFilter: "blur(16px)"
} as const;
