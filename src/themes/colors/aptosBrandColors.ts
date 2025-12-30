import {PaletteMode} from "@mui/material";
import {alpha} from "@mui/material";

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
 * Semantic color mappings for light and dark modes
 */
export const getSemanticColors = (mode: PaletteMode) => {
  const isDark = mode === "dark";

  return {
    // Primary colors for interactive elements
    // Use darker variant for light mode to ensure visibility
    primary: isDark ? brandColors.babyBlue : "#5A9BC8", // Darker blue for light mode contrast
    secondary: isDark ? brandColors.mint : "#7BC47F", // Darker green for light mode contrast

    // Background colors
    background: {
      default: isDark ? brandColors.black : brandColors.white,
      paper: isDark ? brandColors.ink : brandColors.creme,
      elevated: isDark ? brandColors.coal : brandColors.white,
    },

    // Text colors
    text: {
      primary: isDark ? brandColors.white : brandColors.black,
      secondary: isDark ? brandColors.creme : brandColors.graphite,
      disabled: isDark ? brandColors.graphite : brandColors.tan,
    },

    // Border and line colors
    border: {
      main: isDark ? brandColors.coal : brandColors.tan, // Use tan instead of sand for better visibility
      light: isDark ? brandColors.graphite : brandColors.tan,
      dark: isDark ? brandColors.ink : brandColors.graphite,
    },

    // Status colors - use darker variants for light mode
    status: {
      success: isDark ? brandColors.mint : "#7BC47F", // Darker green for light mode
      error: brandColors.coral,
      warning: brandColors.coral,
      info: isDark ? brandColors.babyBlue : "#5A9BC8", // Darker blue for light mode
    },

    // Link colors - use darker variant for light mode
    link: {
      main: isDark ? brandColors.babyBlue : "#5A9BC8", // Darker blue for light mode contrast
      hover: isDark ? brandColors.mint : "#4A8BB8", // Even darker on hover for light mode
    },

    // Code block colors - ensure good contrast in both modes
    codeBlock: {
      background: alpha(brandColors.babyBlue, 0.1),
      backgroundHover: alpha(brandColors.babyBlue, 0.2),
      // Use brand colors for RGB backgrounds - darker for dark mode, lighter for light mode
      backgroundRgb: isDark
        ? alpha(brandColors.babyBlue, 0.15)
        : alpha(brandColors.babyBlue, 0.08),
      // Use link color for text (defined above)
      text: isDark ? brandColors.babyBlue : "#5A9BC8",
      textSecondary: alpha(isDark ? brandColors.babyBlue : "#5A9BC8", 0.5),
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

/**
 * Legacy color mappings for backward compatibility
 * These map old color names to new brand colors
 */
export const legacyColorMappings = {
  // Map old primary colors to new brand colors
  primary: {
    50: brandColors.mint,
    100: brandColors.mint,
    200: brandColors.mint,
    300: brandColors.babyBlue,
    400: brandColors.babyBlue,
    500: brandColors.babyBlue,
    600: brandColors.babyBlue,
    700: brandColors.babyBlue,
    800: brandColors.babyBlue,
    900: brandColors.babyBlue,
  },
  // Map old grey colors to new brand neutrals
  grey: {
    50: brandColors.white,
    100: brandColors.creme,
    200: brandColors.sand,
    300: brandColors.tan,
    400: brandColors.tan,
    450: brandColors.tan,
    500: brandColors.graphite,
    600: brandColors.coal,
    700: brandColors.coal,
    800: brandColors.ink,
    900: brandColors.black,
  },
  negativeColor: brandColors.coral,
  warningColor: brandColors.coral,
  aptosColor: brandColors.babyBlue,
  codeBlockColor: alpha(brandColors.babyBlue, 0.1),
  codeBlockColorClickableOnHover: alpha(brandColors.babyBlue, 0.2),
  // These RGB colors are used in code blocks that need solid backgrounds (not transparent)
  // Using brand colors with appropriate tints for visibility
  codeBlockColorRgbLight: alpha(brandColors.babyBlue, 0.08), // Light mode - very light blue tint
  codeBlockColorRgbDark: alpha(brandColors.babyBlue, 0.15), // Dark mode - subtle blue tint
};
