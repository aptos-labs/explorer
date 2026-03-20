/**
 * Typography tokens aligned with Aptos Brand Guidelines (Figma).
 *
 * Licensed brand fonts are Season (sans/serif) and Akkurat Mono. The official
 * style guide specifies **IBM Plex Sans**, **IBM Plex Serif**, and **IBM Plex Mono**
 * as free, open-licensed stand-ins:
 * - **Sans** — body copy, navigation, and general UI
 * - **Serif** — display headings (hero / page titles)
 * - **Mono** — hashes, metrics, code-adjacent UI
 *
 * To use the commercial fonts from the Aptos media kit, self-host under
 * `public/fonts/` and update the stacks below.
 */

export const FONT_SANS_PRIMARY = '"IBM Plex Sans"';
export const FONT_SERIF_PRIMARY = '"IBM Plex Serif"';
export const FONT_MONO_PRIMARY = '"IBM Plex Mono"';

/** Body, navigation, and default UI text. */
export const fontFamilySans = `${FONT_SANS_PRIMARY},-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`;

/**
 * Display headings — maps to Season Serif in brand guidelines.
 * Used for primary page titles (MUI `h1`–`h3`); `h4`–`h6` stay sans for dense UI.
 */
export const fontFamilySerif = `${FONT_SERIF_PRIMARY},Georgia,"Times New Roman",Times,serif`;

/** Monospace (maps to Akkurat Mono in brand guidelines). */
export const fontFamilyMono = `${FONT_MONO_PRIMARY},ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace`;

/** Google Fonts — weights used across the explorer. */
export const googleFontsStylesheetHref =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700&display=swap";
