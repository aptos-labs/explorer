import {codecovVitePlugin} from "@codecov/vite-plugin";
import netlify from "@netlify/vite-plugin-tanstack-start";
import {tanstackStart} from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react-swc";
import {visualizer} from "rollup-plugin-visualizer";
import type {PluginOption} from "vite";
import {perEnvironmentPlugin} from "vite";
import compression from "vite-plugin-compression";
import viteSvgr from "vite-plugin-svgr";
import {configDefaults, defineConfig} from "vitest/config";

export default defineConfig({
  plugins: [
    tanstackStart({
      srcDirectory: "app",
      router: {
        routesDirectory: "routes",
        generatedRouteTree: "routeTree.gen.ts",
      },
      // Use `app/ssr.tsx` (not the framework default `server.tsx`) for SSR:
      // cache-aware HTML responses and homepage `Accept: text/markdown` handling.
      server: {
        entry: "ssr",
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
    }) as PluginOption,
    // PWA: Service worker is manually configured in public/sw.js
    // This ensures compatibility with TanStack Start SSR
    // Codecov bundle analysis — runs per environment so client and server are
    // tracked separately in Codecov's bundle UI (aptos-explorer-client vs. -server).
    perEnvironmentPlugin("codecov-bundle-analysis", (env) => {
      if (!process.env.CODECOV_TOKEN) return false;
      const bundleName =
        env.name === "client"
          ? "aptos-explorer-client"
          : "aptos-explorer-server";
      return codecovVitePlugin({
        enableBundleAnalysis: true,
        bundleName,
        uploadToken: process.env.CODECOV_TOKEN,
        telemetry: false,
      });
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
      // react-simple-maps and d3 packages need to be bundled to handle CJS require() of ESM
      // Vite will transform the CJS require() calls to work in ESM context
      // Map.client.tsx (containing react-simple-maps) is dynamically imported client-side in ValidatorsMap.tsx
      "react-simple-maps",
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
        // Vite 8 uses Rolldown. The object form `output.manualChunks` is no
        // longer supported; use Rolldown's `codeSplitting.groups` instead.
        // Each group's `test` regex is matched against the resolved module id.
        rolldownOptions: {
          output: {
            codeSplitting: {
              groups: [
                // React core - very stable
                {
                  name: "vendor-react",
                  test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                },
                // MUI - large bundle, rarely changes
                {
                  name: "vendor-mui",
                  test: /[\\/]node_modules[\\/]@mui[\\/](material|icons-material)[\\/]/,
                },
                // Charts - only needed on analytics pages
                {
                  name: "vendor-charts",
                  test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
                },
                // Aptos SDK - core blockchain functionality
                {
                  name: "vendor-aptos",
                  test: /[\\/]node_modules[\\/]@aptos-labs[\\/]ts-sdk[\\/]/,
                },
                // Data fetching - stable utilities
                {
                  name: "vendor-query",
                  test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
                },
                // Wallet adapters - only needed for wallet interactions
                {
                  name: "vendor-wallet",
                  test: /[\\/]node_modules[\\/]@aptos-labs[\\/]wallet-adapter-react[\\/]/,
                },
              ],
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
    include: ["@aptos-labs/ts-sdk", "@tanstack/react-query"],
  },
  server: {
    watch: {
      // Ignore the generated route tree to prevent infinite loops
      ignored: ["**/routeTree.gen.ts"],
    },
  },
  test: {
    exclude: [...configDefaults.exclude, "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "lcov"],
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        "app/routeTree.gen.ts",
        "e2e/**",
        "scripts/**",
        "analytics/**",
      ],
    },
  },
});
