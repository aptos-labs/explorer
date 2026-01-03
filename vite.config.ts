import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import viteSvgr from "vite-plugin-svgr";
import {TanStackRouterVite} from "@tanstack/router-plugin/vite";
import {tanstackStart} from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./app/routes",
      generatedRouteTree: "./app/routeTree.gen.ts",
      autoCodeSplitting: true,
    }),
    tanstackStart({
      // Configure entry points for the app directory structure
      srcDirectory: "app",
      router: {
        routesDirectory: "routes",
        generatedRouteTree: "routeTree.gen.ts",
      },
    }),
    react(),
    viteSvgr(),
    netlify(),
  ],
  // Support both VITE_ and REACT_APP_ prefixed environment variables
  envPrefix: ["VITE_", "REACT_APP_"],
  build: {
    sourcemap: true,
    // Increase limit since gzipped sizes are reasonable (~200kB)
    chunkSizeWarningLimit: 700,
  },
  // SSR configuration - handle packages with ESM/CommonJS compatibility issues
  ssr: {
    // Packages that should NOT be externalized during SSR (bundled instead)
    // This ensures CJS packages are properly transformed for ESM SSR context
    noExternal: [
      "js-sha3", // CJS - crypto utilities
      "react-helmet-async", // CJS/ESM hybrid
      "react-countdown", // CJS with ESM entry
    ],
  },
  // Environment-specific configuration
  environments: {
    client: {
      build: {
        rollupOptions: {
          output: {
            // Manual chunks for better caching - these libraries rarely change
            manualChunks: {
              // React core - very stable
              "vendor-react": ["react", "react-dom"],
              // MUI - large bundle, rarely changes
              "vendor-mui": [
                "@mui/material",
                "@mui/icons-material",
                "@mui/system",
              ],
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
              // Wallet adapters - only needed for wallet interactions
              "vendor-wallet": ["@aptos-labs/wallet-adapter-react"],
            },
          },
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
