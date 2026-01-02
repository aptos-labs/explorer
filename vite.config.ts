import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import viteSvgr from "vite-plugin-svgr";
import {TanStackRouterVite} from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./app/routes",
      generatedRouteTree: "./app/routeTree.gen.ts",
      autoCodeSplitting: true,
    }),
    react(),
    viteSvgr(),
  ],
  // Support both VITE_ and REACT_APP_ prefixed environment variables
  envPrefix: ["VITE_", "REACT_APP_"],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        // Manual chunks for better caching - these libraries rarely change
        manualChunks: {
          // React core - very stable
          "vendor-react": ["react", "react-dom"],
          // MUI - large bundle, rarely changes
          "vendor-mui": ["@mui/material", "@mui/icons-material", "@mui/system"],
          // Charts - only needed on analytics pages
          "vendor-charts": ["chart.js", "react-chartjs-2"],
          // Aptos SDK - core blockchain functionality
          "vendor-aptos": ["@aptos-labs/ts-sdk", "aptos"],
          // Data fetching - stable utilities
          "vendor-query": [
            "@tanstack/react-query",
            "@apollo/client",
            "graphql",
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      "~": "/app",
    },
  },
  optimizeDeps: {
    include: [
      "@aptos-labs/ts-sdk",
      "aptos",
      "@tanstack/react-query",
      "@apollo/client",
    ],
  },
  server: {
    watch: {
      // Ignore the generated route tree to prevent infinite loops
      ignored: ["**/routeTree.gen.ts"],
    },
  },
});
