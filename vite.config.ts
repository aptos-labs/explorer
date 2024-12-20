import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import {nodePolyfills} from "vite-plugin-node-polyfills";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
      sourcemap: true,
    },
    // in addition to the default VITE_ prefix, also support REACT_APP_ prefixed environment variables for compatibility reasons with legacy create-react-app.
    envPrefix: ["VITE_", "REACT_APP_"],
    plugins: [react(), svgr(), nodePolyfills()],
  };
});
