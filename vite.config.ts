import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
      sourcemap: true,
    },
    // in addition to the default VITE_ prefix, also support REACT_APP_ and LIBRA2_ prefixed environment variables for compatibility with legacy create-react-app and Libra2-specific settings.
    envPrefix: ["VITE_", "REACT_APP_", "LIBRA2_"],
    plugins: [react(), svgr()],
  };
});
