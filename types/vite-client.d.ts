/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  // Add more variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
