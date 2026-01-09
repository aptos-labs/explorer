import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import viteSvgr from "vite-plugin-svgr";
import {TanStackRouterVite} from "@tanstack/router-plugin/vite";
import {tanstackStart} from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import compression from "vite-plugin-compression";
import {visualizer} from "rollup-plugin-visualizer";

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
    // Pre-compress assets for faster delivery (Netlify serves these automatically)
    compression({algorithm: "gzip", ext: ".gz"}),
    compression({algorithm: "brotliCompress", ext: ".br"}),
    // Bundle analyzer - generates stats.html after build (run: pnpm build && open stats.html)
    visualizer({
      filename: "stats.html",
      open: false, // Don't auto-open, just generate the file
      gzipSize: true,
      brotliSize: true,
    }),
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
      "react-helmet-async", // CJS/ESM hybrid
      "react-countdown", // CJS with ESM entry
      "react-simple-maps", // CJS with ESM entry
    ],
    // Packages to externalize during SSR (not bundled, loaded at runtime)
    // react-simple-maps is CJS and tries to require() ESM d3 packages
    // Since it's lazy-loaded client-only, we can safely externalize it
    external: [
      "d3-geo",
      "d3-zoom",
      "d3-selection",
      "d3-drag",
      "d3-dispatch",
      "d3-transition",
      "d3-ease",
      "d3-timer",
      "d3-interpolate",
      "d3-color",
      "d3-array",
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
