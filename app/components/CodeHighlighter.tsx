/**
 * Shared lazy-loaded syntax highlighter with Move language support.
 *
 * Both CodeSnippet.tsx and MovePackageManifest.tsx import from here
 * to avoid duplicating the lazy loading and style caching logic.
 *
 * Uses highlightjs-move/v10 (https://github.com/gregnazario/highlightjs-move)
 * for proper Move 2.x syntax highlighting compatible with the hljs v10
 * bundled in react-syntax-highlighter v16.
 */

import {lazy, useEffect, useState} from "react";
import {Box, CircularProgress, useTheme} from "@mui/material";
import {getSemanticColors} from "../themes/colors/aptosBrandColors";

// Lazy load react-syntax-highlighter light build with only Move language (~20KB vs ~150KB)
export const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter/dist/esm/light").then(async (mod) => {
    // Use the v10-compatible grammar from highlightjs-move
    const move = await import("highlightjs-move/v10");
    mod.default.registerLanguage("move", move.default);
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
