/**
 * Shared lazy-loaded syntax highlighter with Move language support.
 *
 * Both CodeSnippet.tsx and MovePackageManifest.tsx import from here
 * to avoid duplicating the lazy loading and style caching logic.
 *
 * Uses highlightjs-move (https://github.com/gregnazario/highlightjs-move)
 * for proper Move 2.x syntax highlighting including enums, pattern matching,
 * lambdas, signed integers, and the Move Specification Language.
 */

import {lazy, useEffect, useState} from "react";
import {Box, CircularProgress, useTheme} from "@mui/material";
import {getSemanticColors} from "../themes/colors/aptosBrandColors";

/**
 * Polyfill for hljs.regex (introduced in highlight.js v11).
 * react-syntax-highlighter v16 bundles hljs v10.7.3 which lacks this API,
 * but highlightjs-move uses regex.concat() and regex.lookahead().
 */
function ensureHljsRegex(hljs: Record<string, unknown>) {
  if (hljs.regex) return;
  const source = (re: string | RegExp) =>
    typeof re === "string" ? re : re.source;
  hljs.regex = {
    concat: (...args: (string | RegExp)[]) =>
      args.map((a) => source(a)).join(""),
    lookahead: (re: string | RegExp) => `(?=${source(re)})`,
    either: (...args: (string | RegExp)[]) =>
      `(${args.map((a) => source(a)).join("|")})`,
    optional: (re: string | RegExp) => `(?:${source(re)})?`,
    source,
  };
}

// Lazy load react-syntax-highlighter light build with only Move language (~20KB vs ~150KB)
export const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter/dist/esm/light").then(async (mod) => {
    // Register Move language from highlightjs-move package.
    // Wrap the language function to inject hljs.regex polyfill for hljs v10 compat.
    const move = await import("highlightjs-move");
    const moveWithCompat = (hljs: Record<string, unknown>) => {
      ensureHljsRegex(hljs);
      return (move.default as (hljs: unknown) => unknown)(hljs);
    };
    mod.default.registerLanguage("move", moveWithCompat);
    return mod;
  }),
);

// Lazy load styles to reduce initial bundle size
const loadStyles = () =>
  import("react-syntax-highlighter/dist/esm/styles/hljs").then((mod) => ({
    solarizedLight: mod.solarizedLight,
    solarizedDark: mod.solarizedDark,
  }));

// Cache for loaded styles
let stylesCache: {
  solarizedLight: Record<string, React.CSSProperties>;
  solarizedDark: Record<string, React.CSSProperties>;
} | null = null;

export function useHighlighterStyles() {
  const [styles, setStyles] = useState(stylesCache);

  useEffect(() => {
    if (!stylesCache) {
      loadStyles().then((loadedStyles) => {
        stylesCache = loadedStyles;
        setStyles(loadedStyles);
      });
    }
  }, []);

  return styles;
}

// Loading fallback component
export function CodeLoadingFallback() {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);

  return (
    <Box
      sx={{
        backgroundColor: semanticColors.codeBlock.background,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 200,
        borderRadius: 1,
      }}
    >
      <CircularProgress size={24} />
    </Box>
  );
}
