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
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
