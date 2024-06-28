declare module "@download/blockies" {
  export interface IconOptions {
    seed: string;
    size?: number;
    scale?: number;
    bgColor: string;
  }

  function createIcon(options: IconOptions): HTMLCanvasElement;
}
