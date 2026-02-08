/**
 * Move language definition for highlight.js
 *
 * Provides proper syntax highlighting for Aptos Move source code,
 * replacing the Rust fallback that was previously used.
 *
 * Reference: https://move-language.github.io/move/
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function hljsMove(hljs: any) {
  // Move-specific keywords
  const KEYWORDS = {
    keyword: [
      "abort",
      "acquires",
      "as",
      "break",
      "const",
      "continue",
      "copy",
      "else",
      "entry",
      "enum",
      "friend",
      "fun",
      "has",
      "if",
      "inline",
      "let",
      "loop",
      "match",
      "module",
      "move",
      "mut",
      "native",
      "phantom",
      "public",
      "return",
      "script",
      "spec",
      "struct",
      "use",
      "while",
    ],
    literal: ["true", "false"],
    type: [
      "u8",
      "u16",
      "u32",
      "u64",
      "u128",
      "u256",
      "bool",
      "address",
      "signer",
      "vector",
    ],
    built_in: [
      "assert!",
      "move_to",
      "move_from",
      "borrow_global",
      "borrow_global_mut",
      "exists",
      "freeze",
      "Self",
    ],
  };

  // Spec-block keywords (used inside spec { ... })
  const SPEC_KEYWORDS = [
    "aborts_if",
    "aborts_with",
    "apply",
    "assume",
    "axiom",
    "choose",
    "decreases",
    "emits",
    "ensures",
    "except",
    "forall",
    "global",
    "include",
    "invariant",
    "local",
    "min",
    "modifies",
    "old",
    "post",
    "pragma",
    "requires",
    "schema",
    "succeeds_if",
    "to",
    "update",
    "where",
    "with",
  ];

  // Ability constraints
  const ABILITIES = {
    scope: "type",
    match: /\b(key|store|drop|copy)\b/,
    relevance: 0,
  };

  // Address literal: @0x... or @name
  const ADDRESS_LITERAL = {
    scope: "symbol",
    match: /@(0x[a-fA-F0-9]+|\w+)/,
    relevance: 5,
  };

  // Hex address in module path: 0x1::module::item
  const MODULE_PATH = {
    scope: "symbol",
    match: /\b0x[a-fA-F0-9]+(?=::)/,
    relevance: 8,
  };

  // Numeric literals with optional type suffix
  const NUMBER = {
    scope: "number",
    variants: [
      // Hex literals
      {match: /\b0x[a-fA-F0-9_]+(u8|u16|u32|u64|u128|u256)?\b/},
      // Decimal literals
      {match: /\b[0-9][0-9_]*(u8|u16|u32|u64|u128|u256)?\b/},
    ],
    relevance: 0,
  };

  // Byte string: b"..." and hex string: x"..."
  const BYTE_STRING = {
    scope: "string",
    begin: /[bx]"/,
    end: /"/,
    contains: [{begin: /\\./}],
    relevance: 5,
  };

  // Regular string
  const STRING = {
    scope: "string",
    begin: /"/,
    end: /"/,
    contains: [{begin: /\\./}],
    relevance: 0,
  };

  // Attributes: #[test], #[test_only], #[view], #[expected_failure(...)]
  const ATTRIBUTE = {
    scope: "meta",
    begin: /#\[/,
    end: /\]/,
    contains: [
      {
        scope: "keyword",
        match:
          /\b(test|test_only|view|event|resource_group|resource_group_member|expected_failure|deprecated|lint)\b/,
      },
      NUMBER,
      STRING,
    ],
    relevance: 8,
  };

  // Function definition
  const FUNCTION_DEF = {
    beginKeywords: "fun",
    end: /[({;]/,
    excludeEnd: true,
    contains: [
      {
        scope: "title.function",
        match: /[a-zA-Z_]\w*/,
        relevance: 0,
      },
    ],
  };

  // Module definition
  const MODULE_DEF = {
    beginKeywords: "module",
    end: /\{/,
    excludeEnd: true,
    contains: [
      MODULE_PATH,
      {
        scope: "title.class",
        match: /[a-zA-Z_]\w*(?=\s*\{)/,
        relevance: 0,
      },
      {
        scope: "title.class",
        match: /[a-zA-Z_]\w*/,
        relevance: 0,
      },
    ],
  };

  // Struct definition
  const STRUCT_DEF = {
    beginKeywords: "struct",
    end: /[{;]/,
    excludeEnd: true,
    contains: [
      {
        scope: "title.class",
        match: /[a-zA-Z_]\w*/,
        relevance: 0,
      },
      ABILITIES,
    ],
  };

  // Doc comments (/// ...)
  const DOC_COMMENT = hljs.COMMENT("///", "$", {
    scope: "doctag",
    relevance: 2,
  });

  // Block comments (/* ... */)
  const BLOCK_COMMENT = hljs.COMMENT("/\\*", "\\*/", {
    contains: ["self"],
  });

  // Line comments (// ...)
  const LINE_COMMENT = hljs.COMMENT("//", "$");

  // Spec block (spec module { ... }, spec fun name { ... })
  const SPEC_BLOCK = {
    beginKeywords: "spec",
    end: /\{/,
    excludeEnd: true,
    keywords: {
      keyword: ["spec", "schema", "fun", "module"].concat(SPEC_KEYWORDS),
    },
    contains: [
      {
        scope: "title",
        match: /[a-zA-Z_]\w*/,
        relevance: 0,
      },
    ],
  };

  // Generic type parameters <T: store + key>
  const GENERIC_PARAMS = {
    begin: /</,
    end: />/,
    contains: [
      ABILITIES,
      {scope: "type", match: /[A-Z]\w*/, relevance: 0},
      {match: /\+/, relevance: 0},
    ],
  };

  // public(friend) visibility modifier
  const VISIBILITY = {
    scope: "keyword",
    match: /\bpublic\s*\(\s*(friend|package)\s*\)/,
    relevance: 5,
  };

  return {
    name: "Move",
    aliases: ["move"],
    keywords: KEYWORDS,
    contains: [
      DOC_COMMENT,
      BLOCK_COMMENT,
      LINE_COMMENT,
      ATTRIBUTE,
      VISIBILITY,
      MODULE_DEF,
      STRUCT_DEF,
      FUNCTION_DEF,
      SPEC_BLOCK,
      BYTE_STRING,
      STRING,
      ADDRESS_LITERAL,
      MODULE_PATH,
      NUMBER,
      GENERIC_PARAMS,
      ABILITIES,
    ],
  };
}
