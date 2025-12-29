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
    secondary: brandColors.mint,

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

    // Code block colors - ensure good contrast in both modes
    codeBlock: {
      background: isDark
        ? alpha(brandColors.babyBlue, 0.1)
        : alpha(brandColors.babyBlue, 0.1),
      backgroundHover: isDark
        ? alpha(brandColors.babyBlue, 0.2)
        : alpha(brandColors.babyBlue, 0.2),
      backgroundRgb: isDark ? "#212D32" : "#E3ECF3",
      // Use darker blue for light mode text for better contrast
      text: isDark ? "#83CCED" : "#0A7FA8", // Darker blue for light mode
      textSecondary: alpha(isDark ? "#83CCED" : "#0A7FA8", 0.5), // Increased opacity for visibility
    },

    // Link colors - use darker variant for light mode
    link: {
      main: isDark ? brandColors.babyBlue : "#5A9BC8", // Darker blue for light mode contrast
      hover: isDark ? brandColors.mint : "#4A8BB8", // Even darker on hover for light mode
    },
  };
};

/**
 * Get theme-aware colors based on mode
 */
export const getThemeColors = (mode: PaletteMode) => {
  return getSemanticColors(mode);
};

/**
 * Status colors for staking operations
 */
export const getStakingStatusColors = (mode: PaletteMode) => {
  const isDark = mode === "dark";
  return {
    staked: {
      text: isDark ? "rgba(125, 211, 252, 1)" : "rgba(14, 165, 233, 1)",
      background: isDark
        ? "rgba(125, 211, 252, 0.1)"
        : "rgba(14, 165, 233, 0.1)",
    },
    withdrawPending: {
      text: isDark ? "rgba(234, 179, 8, 1)" : "rgba(202, 138, 4, 1)",
      background: isDark
        ? "rgba(252, 211, 77, 0.1)"
        : "rgba(250, 204, 21, 0.2)",
    },
    withdrawReady: {
      text: "rgba(20, 184, 166, 1)",
      background: "rgba(20, 184, 166, 0.1)",
    },
  };
};

/**
 * Validator status colors
 */
export const getValidatorStatusColors = () => {
  return {
    pendingActive: {
      text: "#44c6ee",
      background: alpha("#44c6ee", 0.1),
    },
    active: {
      text: "#14B8A6",
      background: alpha("#14B8A6", 0.1),
    },
    pendingInactive: {
      text: "rgba(252, 211, 77, 1)",
      background: alpha("rgba(252, 211, 77, 1)", 0.1),
    },
    inactive: {
      text: "rgb(249, 115, 115, 1)",
      background: alpha("rgb(249, 115, 115, 1)", 0.1),
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
  codeBlockColorRgbLight: "#E3ECF3",
  codeBlockColorRgbDark: "#212D32",
};
