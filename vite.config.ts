import type {OutgoingHttpHeaders} from "node:http";
import {codecovVitePlugin} from "@codecov/vite-plugin";
import {tanstackStart} from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react-swc";
import {nitro} from "nitro/vite";
import {visualizer} from "rollup-plugin-visualizer";
import type {PluginOption, PreviewServer, ViteDevServer} from "vite";
import {perEnvironmentPlugin} from "vite";
import compression from "vite-plugin-compression";
import viteSvgr from "vite-plugin-svgr";
import {configDefaults, defineConfig} from "vitest/config";

function normalizeNodeHeaders(
  headers: unknown,
): OutgoingHttpHeaders | undefined {
  if (!Array.isArray(headers)) return undefined;

  const normalized: OutgoingHttpHeaders = {};
  const addHeader = (name: unknown, value: unknown) => {
    if (typeof name !== "string") return;
    const headerValue =
      typeof value === "string" || typeof value === "number"
        ? value
        : String(value);
    const stringHeaderValue = String(headerValue);
    const existing = normalized[name];
    normalized[name] =
      existing === undefined
        ? headerValue
        : Array.isArray(existing)
          ? [...existing, stringHeaderValue]
          : [String(existing), stringHeaderValue];
  };

  if (headers.every(Array.isArray)) {
    for (const pair of headers) {
      addHeader(pair[0], pair[1]);
    }
  } else {
    for (let index = 0; index < headers.length; index += 2) {
      addHeader(headers[index], headers[index + 1]);
    }
  }

  return normalized;
}

function patchServerResponseHeaders(server: ViteDevServer | PreviewServer) {
  server.middlewares.use((_req, res, next) => {
    const writeHead = res.writeHead.bind(res) as unknown as (
      ...args: unknown[]
    ) => unknown;
    res.writeHead = ((
      statusCode: number,
      statusMessageOrHeaders?: string | OutgoingHttpHeaders | unknown[],
      maybeHeaders?: OutgoingHttpHeaders | unknown[],
    ) => {
      const hasStatusMessage = typeof statusMessageOrHeaders === "string";
      const rawHeaders = hasStatusMessage
        ? maybeHeaders
        : statusMessageOrHeaders;
      const normalizedHeaders = normalizeNodeHeaders(rawHeaders);

      if (normalizedHeaders) {
        if (hasStatusMessage) {
          return writeHead(
            statusCode,
            statusMessageOrHeaders,
            normalizedHeaders,
          );
        }
        return writeHead(statusCode, normalizedHeaders);
      }

      if (maybeHeaders !== undefined) {
        return writeHead(statusCode, statusMessageOrHeaders, maybeHeaders);
      }
      if (statusMessageOrHeaders !== undefined) {
        return writeHead(statusCode, statusMessageOrHeaders);
      }
      return writeHead(statusCode);
    }) as typeof res.writeHead;
    next();
  });
}

function disableServerCompression(server: ViteDevServer | PreviewServer) {
  // Vite's compression middleware cannot safely consume the flattened header
  // array that srvx passes to writeHead(). Keep SSR responses uncompressed in
  // dev/preview; built static assets still use their pre-compressed files.
  server.middlewares.use((req, res, next) => {
    // Prevent Vite's compression middleware from negotiating Brotli before
    // srvx writes its flattened response headers.
    req.headers["accept-encoding"] = "identity";
    res.setHeader("Content-Encoding", "identity");
    next();
  });
}

const serverCompressionWorkaround: PluginOption = {
  name: "explorer:server-compression-workaround",
  configureServer(server) {
    patchServerResponseHeaders(server);
    disableServerCompression(server);
  },
  configurePreviewServer(server) {
    patchServerResponseHeaders(server);
    disableServerCompression(server);
  },
};

// Vercel sets VERCEL_ENV at build time (production | preview | development).
// Vite only exposes VITE_* to the client, so copy it unless already set.
if (!process.env.VITE_VERCEL_ENV && process.env.VERCEL_ENV) {
  process.env.VITE_VERCEL_ENV = process.env.VERCEL_ENV;
}

// Keep this list in sync with `app/lib/vercelProductionApiKeys.ts`.
// Implemented inline so `vite.config.ts` does not import `app/` (that hang
// Vitest's Vite server on shutdown).
function assertVercelProductionClientApiKeys(): void {
  if (process.env.VERCEL_ENV !== "production") return;
  const missing = [
    "VITE_APTOS_MAINNET_API_KEY",
    "VITE_APTOS_TESTNET_API_KEY",
    "VITE_APTOS_DEVNET_API_KEY",
  ].filter((name) => !process.env[name]?.trim());
  if (missing.length === 0) return;
  throw new Error(
    `[aptos-explorer] Refusing to build a Vercel production client bundle without ${missing.join(", ")}. ` +
      `Those variables are inlined at build time; marking them runtime-only in Vercel will not attach a key in the browser. ` +
      `Without them, Geomi 429s are the anonymous IP bucket ("Per anonymous IP rate limit exceeded"), not a named key's quota. ` +
      `Use a Geomi **client** key whose allowed origin includes https://explorer.aptoslabs.com, and enable the vars for Production **Build**.`,
  );
}

export default defineConfig({
  plugins: [
    serverCompressionWorkaround,
    {
      name: "assert-vercel-production-client-api-keys",
      apply: "build",
      buildStart() {
        assertVercelProductionClientApiKeys();
      },
    },
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
    // `renderer: false` is load-bearing: Nitro adopts any root `index.html` as
    // its renderer template, mounts `renderer-template` on `/**`, and then
    // skips installing TanStack Start's SSR handler entirely — so every request
    // answers with that raw HTML file instead of a rendered page.
    // On Vercel (`VERCEL=1`), pin the Node serverless preset — never vercel-edge.
    nitro({
      renderer: false,
      ...(process.env.VERCEL ? {preset: "vercel"} : {}),
    }),
    react(),
    viteSvgr(),
    // Pre-compress assets. Vercel also gzip/brotli-encodes at the CDN; these
    // files are generated for static hosts. The server workaround above keeps
    // SSR responses out of Vite's runtime compression in dev and preview.
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
