// ── NurtureAqua Dark Aqua Theme ──────────────────────────────────
export const C = {
  bg: "#0a1628",
  bgGrad1: "#0a1628",
  bgGrad2: "#0d1f3c",
  card: "#101e32",
  cardBorder: "#1a3050",
  cardGlow: "rgba(34,211,238,0.06)",
  inputBg: "#0c1a2e",
  inputBorder: "#1a3050",
  accent: "#22d3ee",
  accentDim: "#0891b2",
  accentGlow: "rgba(34,211,238,0.15)",
  green: "#34d399",
  greenBg: "rgba(52,211,153,0.10)",
  greenGlow: "rgba(34,197,94,0.25)",
  orange: "#fb923c",
  orangeBg: "rgba(251,146,60,0.10)",
  orangeGlow: "rgba(249,115,22,0.25)",
  red: "#f87171",
  redBg: "rgba(248,113,113,0.10)",
  redGlow: "rgba(239,68,68,0.25)",
  yellow: "#fbbf24",
  purple: "#a78bfa",
  textPrimary: "#e8edf2",
  textSecondary: "#7a9bb5",
  textMuted: "#4b6478",
  white: "#ffffff",
  tipBg: "#0f1f36",
};

export const getRiskColor = (level: string) => {
  const l = level?.toLowerCase() ?? "";
  if (l.includes("low"))
    return { bg: C.greenBg, text: C.green, badge: "#22c55e", glow: C.greenGlow };
  if (l.includes("moderate"))
    return { bg: C.orangeBg, text: C.orange, badge: "#f97316", glow: C.orangeGlow };
  return { bg: C.redBg, text: C.red, badge: "#ef4444", glow: C.redGlow };
};

export const getRiskIcon = (level: string): string => {
  const l = level?.toLowerCase() ?? "";
  if (l.includes("low")) return "check-circle";
  if (l.includes("moderate")) return "warning";
  return "error";
};

export const formatTimestamp = (ts: string) => {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const date = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date}  ${time}`;
  } catch {
    return ts;
  }
};
