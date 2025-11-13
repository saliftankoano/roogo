/**
 * Roogo Brand Tokens
 * Minimalist enterprise aesthetic for mobile wizard
 */

export const tokens = {
  colors: {
    primary: "#3A8BFF",
    primaryPressed: "#2C74E6",
    text: "#111111",
    muted: "#6A6A6A",
    border: "#E9ECEF",
    surface: "#FFFFFF",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    // Derived
    primaryTint: "rgba(58, 139, 255, 0.06)",
  },
  spacing: {
    containerPx: 24, // px-6
    gap: 16,
  },
  radii: {
    input: 12, // rounded-xl
    cta: 24, // rounded-3xl
    chip: 16, // rounded-2xl
  },
  typography: {
    h3: {
      fontSize: 18,
      fontWeight: "600" as const,
    },
    label: {
      fontSize: 12,
      fontWeight: "500" as const,
    },
    body: {
      fontSize: 14,
      fontWeight: "400" as const,
    },
    button: {
      fontSize: 14,
      fontWeight: "600" as const,
    },
  },
  shadows: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
  },
} as const;
