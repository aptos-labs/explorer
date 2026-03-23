// Type declarations for modules without TypeScript types

declare module "@download/blockies" {
  export function createIcon(options: {
    seed: string;
    size?: number;
    scale?: number;
    color?: string;
    bgcolor?: string;
    spotcolor?: string;
  }): HTMLCanvasElement;
}

// The @types/react-syntax-highlighter package declares these ambient modules but
// moduleResolution:"bundler" + pnpm's strict node_modules layout prevents
// TypeScript from matching them. Redeclare the subpaths we actually use.
declare module "react-syntax-highlighter/dist/esm/light" {
  import type * as React from "react";
  import type {SyntaxHighlighterProps} from "react-syntax-highlighter";
  export default class SyntaxHighlighter extends React.Component<SyntaxHighlighterProps> {
    static registerLanguage(name: string, func: unknown): void;
  }
}

declare module "react-syntax-highlighter/dist/esm/languages/hljs/ini" {
  const language: unknown;
  export default language;
}

declare module "react-syntax-highlighter/dist/esm/styles/hljs" {
  import type {CSSProperties} from "react";
  type Style = Record<string, CSSProperties>;
  export const solarizedDark: Style;
  export const solarizedLight: Style;
  // only declaring styles we use; full list in @types/react-syntax-highlighter
}

declare module "react-syntax-highlighter/dist/cjs/create-element.js" {
  import type {CSSProperties, ReactNode} from "react";

  export default function createElement(props: {
    node: unknown;
    stylesheet: Record<string, CSSProperties>;
    useInlineStyles: boolean;
    key?: string;
  }): ReactNode;
}

declare module "highlightjs-move/v10" {
  // highlight.js v10-compatible language definition for Move on Aptos
  // https://github.com/gregnazario/highlightjs-move
  const move: (hljs: unknown) => unknown;
  export default move;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.svg?react" {
  import React from "react";
  const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

// Add Vite's ImportMeta.env types
interface ImportMetaEnv {
  readonly APTOS_DEVNET_URL?: string;
  readonly VITE_GRAPHQL_ENDPOINT?: string;
  readonly VITE_REST_ENDPOINT?: string;
  readonly VITE_BASE_URL?: string;
  readonly REACT_APP_GTM_ID?: string;
  readonly NODE_ENV?: string;
  // Client API keys (exposed in browser bundle - use client/public keys only)
  readonly VITE_APTOS_MAINNET_API_KEY?: string;
  readonly VITE_APTOS_TESTNET_API_KEY?: string;
  readonly VITE_APTOS_DEVNET_API_KEY?: string;
  readonly VITE_APTOS_DECIBEL_API_KEY?: string;
  readonly VITE_APTOS_SHELBYNET_API_KEY?: string;
  readonly VITE_APTOS_LOCAL_API_KEY?: string;
  // Server API keys are read from process.env (APTOS_<NETWORK>_API_KEY)
  // and are NOT included in ImportMetaEnv to prevent accidental client exposure.
  // Netlify build context baked in at build time (production | deploy-preview | branch-deploy).
  // Undefined for local development. Used to suppress API keys on preview builds.
  readonly VITE_NETLIFY_CONTEXT?:
    | "production"
    | "deploy-preview"
    | "branch-deploy";
  // Cache busting version for validator stats (bump to force fresh data)
  readonly VITE_VALIDATOR_STATS_CACHE_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
