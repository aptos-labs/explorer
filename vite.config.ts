import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "mui-vendor": [
              "@mui/material",
              "@mui/icons-material",
              "@mui/system",
              "@mui/x-date-pickers",
            ],
            "query-vendor": ["@tanstack/react-query"],
            "aptos-vendor": ["@aptos-labs/ts-sdk"],
            "wallet-vendor": [
              "@aptos-labs/wallet-adapter-react",
              "@aptos-labs/wallet-adapter-mui-design",
            ],
            "chart-vendor": ["chart.js", "react-chartjs-2"],
          },
        },
      },
    },
    // in addition to the default VITE_ prefix, also support REACT_APP_ prefixed environment variables for compatibility reasons with legacy create-react-app.
    envPrefix: ["VITE_", "REACT_APP_"],
    plugins: [react(), svgr()],
  };
});
