import {
  getApiKey,
  isValidNetworkName,
  type NetworkName,
} from "../lib/constants";
import {getGeomiDevApiKeyOverride} from "../settings/clientSettings";

export type ClientApiKeyTelemetrySource =
  | "user_override"
  | "default_embedded"
  | "none_preview_build"
  | "none_missing";

/**
 * How the browser resolved the Aptos API key for this network (no secret values).
 */
export function getClientApiKeyTelemetrySource(
  networkName: NetworkName,
): ClientApiKeyTelemetrySource {
  const override = getGeomiDevApiKeyOverride(networkName)?.trim();
  if (override) return "user_override";

  const fallback = getApiKey(networkName);
  if (fallback) return "default_embedded";

  const preview =
    import.meta.env.VITE_NETLIFY_CONTEXT === "deploy-preview" ||
    import.meta.env.VITE_NETLIFY_CONTEXT === "branch-deploy";
  if (preview) return "none_preview_build";

  return "none_missing";
}

/**
 * Current `network` query param if valid; otherwise `unknown`.
 */
export function getTelemetryNetworkFromLocation(): NetworkName | "unknown" {
  if (typeof window === "undefined") return "unknown";
  const raw = new URL(window.location.href).searchParams.get("network");
  if (raw && isValidNetworkName(raw)) return raw;
  return "unknown";
}

export function getApiKeyTelemetryTags(
  networkName: NetworkName,
): Record<string, string> {
  return {
    network: networkName,
    aptos_client_api_key_source: getClientApiKeyTelemetrySource(networkName),
  };
}
