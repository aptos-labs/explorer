import {alpha, type PaletteMode} from "@mui/material";

/**
 * Aptos Brand Colors
 * Official brand colors from aptosnetwork.com brand guidelines
 */

// Base Brand Colors
export const brandColors = {
  mint: "#DAF6D4",
  babyBlue: "#BADBEE",
  coral: "#FE805C",
  black: "#0F0E0B",
  ink: "#171612",
  coal: "#21201C",
  graphite: "#2F2D28",
  tan: "#9D937C",
  sand: "#CCC5A3",
  creme: "#EFECCA",
  white: "#F9F9F0",
} as const;

/**
 * Light-mode surfaces: neutral grey canvas with white cards (traditional app chrome),
 * instead of bright cream-on-bright-warm-white. Keeps brand accents via semantic tokens.
 */
export const lightSurfaces = {
  /** Page / app background */
  canvas: "#ECEEF2",
  /** Cards, panels, modals */
  raised: "#FFFFFF",
  /** Filled inputs at rest (subtle vs. {@link lightSurfaces.raised}) */
  field: "#F3F5F7",
  /** Filled inputs on hover */
  fieldHover: "#E8EBEF",
} as const;

const lightBorders = {
  /** Dividers and outlines on neutral surfaces */
  main: "#C5CAD4",
  subtle: "#D9DDE5",
} as const;

/**
 * WCAG 2.1 AA text contrast (≥4.5:1) on light surfaces ({@link lightSurfaces.canvas},
 * {@link lightSurfaces.raised}) or {@link brandColors.black} / {@link brandColors.ink}
 * (dark). Pure brand mint/babyBlue/coral are kept above for fills and dark mode;
 * these tokens tune foreground / light-mode UI hues for readability.
 */
const a11y = {
  light: {
    /** Links, primary actions, info — was #5A9BC8 (~2.85:1 on white) */
    interactiveBlue: "#34648F",
    interactiveBlueHover: "#2E5C85",
    /** Success / secondary text & filled buttons — was #7BC47F (~2:1 as text) */
    successGreen: "#256B2E",
    /** Error text on light bg — brand coral stays for fills / dark mode */
    errorText: "#B84722",
    /** Warning text (distinct from error on light surfaces) */
    warningText: "#9D5A16",
    /** Muted / disabled copy on white & creme */
    disabledText: "#6A6252",
    /** JSON keys on creme paper */
    jsonKey: "#A84318",
    /** Null / brackets in JSON on tinted code panels */
    codeMutedBlue: "#45647A",
  },
  dark: {
    /** Disabled on near-black / ink — was graphite (~1.4:1) */
    disabledText: "#8C8680",
    codeMutedBlue: "#7BA3B8",
  },
} as const;

/**
 * Semantic color mappings for light and dark modes
 */
export const getSemanticColors = (mode: PaletteMode) => {
  const isDark = mode === "dark";

  return {
    // Primary colors for interactive elements
    primary: isDark ? brandColors.babyBlue : a11y.light.interactiveBlue,
    secondary: isDark ? brandColors.mint : a11y.light.successGreen,

    // Background colors
    background: {
      default: isDark ? brandColors.black : lightSurfaces.canvas,
      paper: isDark ? brandColors.ink : lightSurfaces.raised,
      elevated: isDark ? brandColors.coal : lightSurfaces.raised,
    },

    // Text colors
    text: {
      primary: isDark ? brandColors.white : brandColors.ink,
      secondary: isDark ? brandColors.creme : brandColors.graphite,
      disabled: isDark ? a11y.dark.disabledText : a11y.light.disabledText,
    },

    // Border and line colors
    border: {
      main: isDark ? brandColors.coal : lightBorders.main,
      light: isDark ? brandColors.graphite : lightBorders.subtle,
      dark: isDark ? brandColors.ink : brandColors.graphite,
    },

    // Status colors — light-mode text uses a11y reds/greens; fills still use brand elsewhere
    status: {
      success: isDark ? brandColors.mint : a11y.light.successGreen,
      error: isDark ? brandColors.coral : a11y.light.errorText,
      warning: isDark ? brandColors.coral : a11y.light.warningText,
      info: isDark ? brandColors.babyBlue : a11y.light.interactiveBlue,
    },

    // Link colors
    link: {
      main: isDark ? brandColors.babyBlue : a11y.light.interactiveBlue,
      hover: isDark ? brandColors.mint : a11y.light.interactiveBlueHover,
    },

    // Code block colors - ensure good contrast in both modes
    codeBlock: {
      background: alpha(brandColors.babyBlue, 0.1),
      backgroundHover: alpha(brandColors.babyBlue, 0.2),
      // Use brand colors for RGB backgrounds - darker for dark mode, lighter for light mode
      backgroundRgb: isDark
        ? alpha(brandColors.babyBlue, 0.15)
        : alpha(brandColors.babyBlue, 0.08),
      text: isDark ? brandColors.babyBlue : a11y.light.interactiveBlue,
      // Solid muted blue — semi-transparent primary failed (~2.1:1) on light code panels
      textSecondary: isDark
        ? a11y.dark.codeMutedBlue
        : a11y.light.codeMutedBlue,
    },

    // JSON viewer colors - for JsonViewCard component
    jsonView: {
      key: isDark ? "#FF9676" : a11y.light.jsonKey,
    },
  };
};

/**
 * Get theme-aware colors based on mode.
 *
 * This is a stable public alias for {@link getSemanticColors}, kept to avoid
 * breaking existing callers and to provide a semantically clear entry point
 * for theme color retrieval.
 */
export const getThemeColors = getSemanticColors;

/**
 * Status colors for staking operations
 * Uses brand colors with appropriate contrast for light/dark modes
 */
export const getStakingStatusColors = (mode: PaletteMode) => {
  const isDark = mode === "dark";
  const semanticColors = getSemanticColors(mode);

  return {
    staked: {
      text: semanticColors.link.main,
      background: alpha(semanticColors.link.main, 0.1),
    },
    withdrawPending: {
      text: semanticColors.status.warning,
      background: alpha(semanticColors.status.warning, isDark ? 0.1 : 0.2),
    },
    withdrawReady: {
      text: semanticColors.status.success,
      background: alpha(semanticColors.status.success, 0.1),
    },
  };
};

/**
 * Validator status colors
 * Uses brand colors for consistency
 */
export const getValidatorStatusColors = (mode: PaletteMode = "light") => {
  const semanticColors = getSemanticColors(mode);

  return {
    pendingActive: {
      text: semanticColors.status.info,
      background: alpha(semanticColors.status.info, 0.1),
    },
    active: {
      text: semanticColors.status.success,
      background: alpha(semanticColors.status.success, 0.1),
    },
    pendingInactive: {
      text: semanticColors.status.warning,
      background: alpha(semanticColors.status.warning, 0.1),
    },
    inactive: {
      text: semanticColors.status.error,
      background: alpha(semanticColors.status.error, 0.1),
    },
  };
};

/**
 * Chart/Analytics colors
 */
export const getChartColors = (mode: PaletteMode) => {
  const isDark = mode === "dark";
  return {
    primary: isDark
      ? alpha(brandColors.babyBlue, 0.6)
      : alpha(brandColors.babyBlue, 0.6),
    background: isDark
      ? alpha(brandColors.babyBlue, 0.4)
      : alpha(brandColors.babyBlue, 0.4),
    highlight: brandColors.babyBlue,
  };
};
