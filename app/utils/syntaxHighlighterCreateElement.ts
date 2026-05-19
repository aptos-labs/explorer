import type {CSSProperties, ReactNode} from "react";
import createElementModule from "react-syntax-highlighter/dist/cjs/create-element.js";
import {resolveCjsDefaultExport} from "./resolveCjsDefaultExport";

export type SyntaxHighlighterCreateElementProps = {
  node: unknown;
  stylesheet: Record<string, CSSProperties>;
  useInlineStyles: boolean;
  key?: string;
};

const CREATE_ELEMENT_MODULE_ID =
  "react-syntax-highlighter/dist/cjs/create-element.js";

/**
 * Callable `createElement` helper from react-syntax-highlighter's CJS build.
 * Rolldown/Vite may wrap the module so `import x from "…"` is not directly
 * callable (production error: `(0 , aa.default) is not a function`).
 */
export const syntaxHighlighterCreateElement = resolveCjsDefaultExport<
  (props: SyntaxHighlighterCreateElementProps) => ReactNode
>(createElementModule, CREATE_ELEMENT_MODULE_ID);
