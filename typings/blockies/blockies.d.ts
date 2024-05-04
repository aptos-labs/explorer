declare module "@download/blockies" {
  export interface IconOptions {
    seed: string;
    size?: number;
    scale?: number;
  }

  function createIcon(options: IconOptions): HTMLCanvasElement;
}
