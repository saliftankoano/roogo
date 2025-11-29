/**
 * Roogo Brand Tokens
 * Minimalist enterprise aesthetic for mobile wizard
 */

export const tokens = {
  colors: {
    roogo: {
      primary: {
        500: "#C96A2E", // Terracotta Ember (main CTA)
        600: "#8A4924", // Clay Brown (hover / pressed)
        700: "#5A321A", // Earth Umber (strong accents)
      },
      secondary: {
        100: "#F4E8D7", // Sand Dune (light bg)
        200: "#E8D8C5", // Warm Linen (cards)
        800: "#2B241D", // Desert Night (dark mode bg)
      },
      accent: {
        500: "#3FA6D9", // Sahel Sky (links / secondary buttons)
        600: "#1F7CA5", // Deep Oasis (hover / dark mode)
      },
      neutral: {
        900: "#1A1A1A", // main text
        700: "#323232", // subtitles
        500: "#6A6A6A", // secondary text
        100: "#F8F8F8", // light background
      },
      success: "#2E8B57",
      warning: "#E59F2B",
      error: "#D9534F",
    },
    // Legacy mappings for backward compatibility
    primary: "#C96A2E", // Mapped to primary-500
    primaryPressed: "#8A4924", // Mapped to primary-600
    text: "#1A1A1A",
    muted: "#6A6A6A",
    border: "#E9ECEF",
    surface: "#FFFFFF",
    success: "#2E8B57",
    warning: "#E59F2B",
    error: "#D9534F",
    primaryTint: "rgba(201, 106, 46, 0.08)",
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
