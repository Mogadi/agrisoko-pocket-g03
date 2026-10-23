export const colors = {
  bg: "#F4F1EA",
  surface: "#FFFFFF",
  primary: "#1F6B3A",
  primaryDark: "#164A28",
  primarySoft: "#E5F3EA",
  accent: "#C4A35A",
  text: "#1C2418",
  muted: "#5C6756",
  border: "#E2DDD0",
  danger: "#B42318",
  dangerSoft: "#FEE4E2",
  warning: "#B54708",
  warningSoft: "#FEF0C7",
  info: "#175CD3",
  infoSoft: "#D1E0FF",
  success: "#027A48",
  successSoft: "#D1FADF",
  offline: "#B54708",
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
};

export const type = {
  title: { fontSize: 26, fontWeight: "700" as const, color: colors.text },
  heading: { fontSize: 20, fontWeight: "700" as const, color: colors.text },
  body: { fontSize: 16, color: colors.text, lineHeight: 22 },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: "700" as const, color: colors.primaryDark, letterSpacing: 0.4 },
};
