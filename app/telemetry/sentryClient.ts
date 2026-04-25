import {onRateLimit} from "../context/rate-limit/rateLimitEvents";
import {isValidNetworkName, type NetworkName} from "../lib/constants";
import {
  getApiKeyTelemetryTags,
  getTelemetryNetworkFromLocation,
} from "./apiKeyTelemetry";

let initialized = false;
let initPromise: Promise<void> | null = null;
let sentryModule: typeof import("@sentry/browser") | null = null;

function getSentryDsn(): string | undefined {
  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();
  return dsn || undefined;
}

async function loadSentry(): Promise<typeof import("@sentry/browser")> {
  if (sentryModule) return sentryModule;
  sentryModule = await import("@sentry/browser");
  return sentryModule;
}

/**
 * Optional browser error / message reporting. Set `VITE_SENTRY_DSN` in the
 * deploy environment to enable. Never pass API keys or bearer tokens.
 */
export async function initSentryBrowser(): Promise<void> {
  if (initialized || typeof window === "undefined") return;
  const dsn = getSentryDsn();
  if (!dsn) return;

  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    try {
      const Sentry = await loadSentry();

      Sentry.init({
        dsn,
        environment:
          import.meta.env.VITE_SENTRY_ENVIRONMENT?.trim() ||
          import.meta.env.MODE ||
          "development",
        release: import.meta.env.VITE_SENTRY_RELEASE?.trim(),
        integrations: [Sentry.browserSessionIntegration()],
        sampleRate: 1,
        beforeSend(event) {
          if (event.request?.headers) {
            delete event.request.headers;
          }
          return event;
        },
      });

      initialized = true;

      onRateLimit((error) => {
        void captureRateLimitTelemetry(error);
      });
    } finally {
      initPromise = null;
    }
  })();

  await initPromise;
}

export function isSentryBrowserEnabled(): boolean {
  return Boolean(getSentryDsn());
}

function resolveNetwork(network?: NetworkName): NetworkName | "unknown" {
  if (network) return network;
  return getTelemetryNetworkFromLocation();
}

function tagsForNetwork(net: NetworkName | "unknown"): Record<string, string> {
  const ssrTag = import.meta.env.VITE_SENTRY_SSR_API_KEY_TAG?.trim();
  const base: Record<string, string> = {};
  if (ssrTag) {
    base.aptos_ssr_api_key_tag = ssrTag;
  }
  if (net === "unknown" || !isValidNetworkName(net)) {
    return base;
  }
  return {...base, ...getApiKeyTelemetryTags(net)};
}

/**
 * Grouped Sentry message for HTTP 429 / rate-limit style failures.
 */
export async function captureRateLimitTelemetry(
  error: unknown,
  network?: NetworkName,
): Promise<void> {
  if (!getSentryDsn()) return;
  if (!initialized) await initSentryBrowser();
  if (!initialized) return;
  const Sentry = await loadSentry();
  const net = resolveNetwork(network);
  const tags = tagsForNetwork(net);

  const err =
    error instanceof Error
      ? error
      : new Error(
          typeof error === "object" &&
            error !== null &&
            "status" in error &&
            typeof (error as {status: unknown}).status === "number"
            ? `HTTP ${(error as {status: number}).status}`
            : String(error),
        );

  Sentry.captureException(err, {
    level: "warning",
    tags: {
      explorer_error_kind: "rate_limit",
      ...tags,
    },
    fingerprint: ["explorer-rate-limit", String(net)],
  });
}

/**
 * REST client failures (401/403/5xx, HTML 429 pages, etc.) — excludes secrets.
 */
export async function captureRestClientErrorTelemetry(
  status: number,
  message: string,
  path: string,
  network?: NetworkName,
): Promise<void> {
  if (!getSentryDsn()) return;
  if (!initialized) await initSentryBrowser();
  if (!initialized) return;
  const Sentry = await loadSentry();
  const net = resolveNetwork(network);
  const tags = tagsForNetwork(net);

  const kind =
    status === 401 || status === 403
      ? "api_key_or_auth"
      : status === 429
        ? "rate_limit"
        : status >= 500
          ? "server_error"
          : "client_error";

  Sentry.captureMessage(`Aptos REST ${status} ${path}`, {
    level: status === 429 || status >= 500 ? "warning" : "info",
    tags: {
      explorer_error_kind: kind,
      http_status: String(status),
      rest_path: path,
      ...tags,
    },
    fingerprint: ["explorer-rest-error", String(status), path, String(net)],
    extra: {
      message_preview: message.slice(0, 500),
    },
  });
}
