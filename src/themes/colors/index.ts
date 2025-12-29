/**
 * Centralized color exports
 * This is the single source of truth for all colors in the application
 */

// Export brand colors and semantic color functions
export {
  brandColors,
  getSemanticColors,
  getThemeColors,
  getStakingStatusColors,
  getValidatorStatusColors,
  getChartColors,
  legacyColorMappings,
} from "./aptosBrandColors";

// Re-export from aptosColorPalette for backward compatibility during migration
// This allows existing imports to continue working
export * from "./aptosColorPalette";
