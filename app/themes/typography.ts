/**
 * Typography tokens aligned with Aptos Brand Guidelines (Figma).
 *
 * Official marketing properties use Season (sans/serif) and Akkurat Mono; those
 * fonts are not redistributed here. Plus Jakarta Sans and JetBrains Mono are
 * open-licensed substitutes with a similar warm, geometric + technical feel.
 *
 * To use licensed brand fonts from the Aptos media kit, self-host files under
 * `public/fonts/` and point {@link fontFamilySans} / {@link fontFamilyMono} at them.
 */

export const FONT_SANS_PRIMARY = '"Plus Jakarta Sans"';
export const FONT_MONO_PRIMARY = '"JetBrains Mono"';

/** Full UI sans stack (body, navigation, headings). */
export const fontFamilySans = `${FONT_SANS_PRIMARY},-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`;

/** Monospace stack (hashes, stats, code-adjacent UI). */
export const fontFamilyMono = `${FONT_MONO_PRIMARY},ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace`;

/** Google Fonts stylesheet for weights used in the explorer. */
export const googleFontsStylesheetHref =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap";
