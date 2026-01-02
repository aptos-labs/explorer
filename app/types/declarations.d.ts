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
  // API Keys for different networks
  readonly VITE_APTOS_MAINNET_API_KEY?: string;
  readonly VITE_APTOS_TESTNET_API_KEY?: string;
  readonly VITE_APTOS_DEVNET_API_KEY?: string;
  readonly VITE_APTOS_DECIBEL_API_KEY?: string;
  readonly VITE_APTOS_SHELBYNET_API_KEY?: string;
  readonly VITE_APTOS_LOCAL_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
