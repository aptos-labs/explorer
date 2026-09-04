export const AI_PROVIDER_IDS = [
  "openai_compatible",
  "openai",
  "anthropic",
  "google",
] as const;

export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];

export type AiProviderOption = {
  id: AiProviderId;
  label: string;
  defaultModel: string;
  defaultBaseUrl: string;
  baseUrlHelper: string;
};

export const AI_PROVIDER_OPTIONS: readonly AiProviderOption[] = [
  {
    id: "openai_compatible",
    label: "OpenAI-compatible (custom endpoint)",
    defaultModel: "",
    defaultBaseUrl: "",
    baseUrlHelper:
      "API root that serves POST /chat/completions (OpenRouter, Groq, Ollama, Azure, LiteLLM, …).",
  },
  {
    id: "openai",
    label: "OpenAI",
    defaultModel: "gpt-4o-mini",
    defaultBaseUrl: "https://api.openai.com/v1",
    baseUrlHelper:
      "Official OpenAI Chat Completions root. Browser CORS may block this host; use a compatible endpoint if requests fail.",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    defaultModel: "claude-sonnet-4-5",
    defaultBaseUrl: "https://api.anthropic.com",
    baseUrlHelper:
      "Anthropic Messages API root (browser BYOK via CORS opt-in).",
  },
  {
    id: "google",
    label: "Google Gemini",
    defaultModel: "gemini-2.5-flash",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    baseUrlHelper: "Gemini generateContent API root.",
  },
] as const;

const PROVIDER_BY_ID: Record<AiProviderId, AiProviderOption> =
  Object.fromEntries(
    AI_PROVIDER_OPTIONS.map((option) => [option.id, option]),
  ) as Record<AiProviderId, AiProviderOption>;

export function isAiProviderId(value: unknown): value is AiProviderId {
  return (
    typeof value === "string" &&
    (AI_PROVIDER_IDS as readonly string[]).includes(value)
  );
}

export function getAiProviderOption(id: AiProviderId): AiProviderOption {
  return PROVIDER_BY_ID[id];
}

export function resolveAiBaseUrl(
  provider: AiProviderId,
  override: string,
): string {
  const trimmed = override.trim();
  if (trimmed) {
    return trimmed.replace(/\/+$/, "");
  }
  return PROVIDER_BY_ID[provider].defaultBaseUrl.replace(/\/+$/, "");
}

export function joinAiEndpoint(baseUrl: string, path: string): string {
  const trimmedBase = baseUrl.trim().replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!trimmedBase) {
    return normalizedPath;
  }
  if (
    trimmedBase.endsWith(normalizedPath) ||
    trimmedBase.endsWith(normalizedPath.replace(/\/+$/, ""))
  ) {
    return trimmedBase;
  }
  return `${trimmedBase}${normalizedPath}`;
}
