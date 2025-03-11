declare module "react-awesome-loaders" {
  export interface ThreeDLoaderProps {
    className?: string;
    colorRing1?: string;
    colorRing2?: string;
    colorLight?: string;
    colorAmbientLight?: string;
    size?: string;
    desktopSize?: string;
    mobileSize?: string;
  }

  export const ThreeDLoader: React.FC<ThreeDLoaderProps>;
}
