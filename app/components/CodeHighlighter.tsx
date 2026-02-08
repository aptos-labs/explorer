/**
 * Shared lazy-loaded syntax highlighter with Move language support.
 *
 * Both CodeSnippet.tsx and MovePackageManifest.tsx import from here
 * to avoid duplicating the lazy loading and style caching logic.
 *
 * Uses an inline hljs v10-compatible Move grammar because
 * react-syntax-highlighter v16 bundles highlight.js v10.7.3, while
 * the highlightjs-move npm package targets hljs v11+ (array begin,
 * beginScope, hljs.regex, etc.).
 */

import {lazy, useEffect, useState} from "react";
import {Box, CircularProgress, useTheme} from "@mui/material";
import {getSemanticColors} from "../themes/colors/aptosBrandColors";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Move language definition for highlight.js v10 (used by react-syntax-highlighter).
 *
 * Covers Move 2.x syntax: modules, structs, enums, functions, abilities,
 * address literals, attributes, byte/hex strings, numeric literals with
 * type suffixes, doc comments, nested block comments, module paths, and
 * the Move Specification Language keywords.
 */
function moveLanguage(hljs: any) {
  const NUM_SUFFIX = "(?:[ui](?:8|16|32|64|128|256))?";

  const KEYWORDS =
    "module script struct enum fun const use spec schema " +
    "public entry native inline friend package " +
    "if else while loop for in match break continue return abort " +
    "let mut move copy has acquires as Self phantom is";

  const SPEC_KEYWORDS =
    "pragma invariant ensures requires aborts_if aborts_with " +
    "include assume assert modifies emits apply axiom " +
    "forall exists choose old global with";

  const TYPES =
    "u8 u16 u32 u64 u128 u256 " +
    "i8 i16 i32 i64 i128 i256 " +
    "bool address signer vector";

  const BUILTINS =
    "assert! move_to move_from borrow_global borrow_global_mut freeze " +
    "copy drop key store";

  // Doc comments: /// ...
  const DOC_COMMENT = hljs.COMMENT("///", "$", {
    contains: [{className: "doctag", begin: /@\w+/}],
  });

  // Line comments: // ...
  const LINE_COMMENT = hljs.COMMENT("//", "$");

  // Nested block comments: /* ... /* ... */ ... */
  const BLOCK_COMMENT = hljs.COMMENT("/\\*", "\\*/", {
    contains: ["self"],
  });

  return {
    name: "Move",
    aliases: ["move", "aptos-move"],
    keywords: {
      $pattern: hljs.IDENT_RE + "!?",
      keyword: KEYWORDS + " " + SPEC_KEYWORDS,
      literal: "true false",
      type: TYPES,
      built_in: BUILTINS,
    },
    contains: [
      // Comments (doc before line so /// matches first)
      DOC_COMMENT,
      LINE_COMMENT,
      BLOCK_COMMENT,

      // Byte string: b"hello"
      {
        className: "string",
        begin: /b"/,
        end: /"/,
        contains: [{begin: /\\./}],
        relevance: 10,
      },

      // Hex string: x"DEADBEEF"
      {
        className: "string",
        begin: /x"/,
        end: /"/,
        relevance: 10,
      },

      // Numbers with optional type suffix
      {
        className: "number",
        variants: [
          {begin: "\\b0x[0-9a-fA-F][0-9a-fA-F_]*" + NUM_SUFFIX + "\\b"},
          {begin: "\\b[0-9][0-9_]*" + NUM_SUFFIX + "\\b"},
        ],
        relevance: 0,
      },

      // Address literals: @0x1, @aptos_framework
      {
        className: "symbol",
        begin: /@(?:0x[0-9a-fA-F][0-9a-fA-F_]*|[a-zA-Z_]\w*)/,
        relevance: 10,
      },

      // Attributes: #[test], #[view], #[expected_failure(...)]
      {
        className: "meta",
        begin: /#\[/,
        end: /\]/,
        contains: [
          {className: "meta-string", begin: /"/, end: /"/},
          {className: "number", begin: /\b\d+\b/},
        ],
      },

      // Function declarations: fun name
      {
        className: "function",
        beginKeywords: "fun",
        end: /[(<{;]/,
        excludeEnd: true,
        contains: [hljs.UNDERSCORE_TITLE_MODE],
      },

      // Struct / Enum declarations
      {
        className: "class",
        beginKeywords: "struct enum",
        end: /[{;]/,
        contains: [
          hljs.inherit(hljs.UNDERSCORE_TITLE_MODE, {endsParent: true}),
        ],
        illegal: "[\\w\\d]",
      },

      // Module declarations: module addr::name
      {
        className: "class",
        beginKeywords: "module",
        end: /\{/,
        contains: [
          {
            className: "title",
            begin: /(?:0x[0-9a-fA-F_]+|[a-zA-Z_]\w*)(?:::[a-zA-Z_]\w*)*/,
          },
        ],
      },

      // Module-qualified paths: 0x1::module::item, aptos_framework::coin
      {
        className: "title",
        begin: /\b(?:0x[0-9a-fA-F_]+|[a-zA-Z_]\w*)(?:::[a-zA-Z_]\w*)+/,
        relevance: 0,
      },

      // self as special variable
      {
        className: "keyword",
        begin: /\bself\b/,
        relevance: 0,
      },
    ],
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// Lazy load react-syntax-highlighter light build with only Move language (~20KB vs ~150KB)
export const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter/dist/esm/light").then((mod) => {
    mod.default.registerLanguage("move", moveLanguage);
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
