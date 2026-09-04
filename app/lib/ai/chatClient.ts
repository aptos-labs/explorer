import {type AiProviderId, joinAiEndpoint, resolveAiBaseUrl} from "./providers";

export type AiChatRequest = {
  provider: AiProviderId;
  model: string;
  apiKey: string;
  baseUrl: string;
  system: string;
  user: string;
  maxTokens?: number;
};

const DEFAULT_MAX_TOKENS = 2048;
const ANTHROPIC_VERSION = "2023-06-01";

function assertBrowserOnly() {
  if (typeof window === "undefined") {
    throw new Error(
      "AI provider requests must run in the browser so credentials are never sent to the explorer server",
    );
  }
}

const BLOCKED_PROVIDER_HOSTS = new Set([
  "explorer.aptoslabs.com",
  "www.explorer.aptoslabs.com",
]);

export function assertExternalProviderUrl(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("AI provider base URL must be an absolute http(s) URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("AI provider base URL must be an absolute http(s) URL");
  }
  if (BLOCKED_PROVIDER_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new Error(
      "AI provider URL cannot be the Aptos Explorer origin — credentials stay in your browser",
    );
  }
  if (
    typeof window !== "undefined" &&
    parsed.origin === window.location.origin
  ) {
    throw new Error(
      "AI provider URL cannot be this site — credentials are not sent to the explorer server",
    );
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

export function isLikelyCorsFailure(error: unknown): boolean {
  if (!(error instanceof TypeError)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed") ||
    message.includes("cors")
  );
}

function providerErrorMessage(
  status: number,
  bodyText: string,
  parsed: unknown,
): string {
  if (parsed && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;
    const err = record.error;
    if (typeof err === "string" && err.trim()) {
      return err;
    }
    if (err && typeof err === "object") {
      const nested = err as Record<string, unknown>;
      if (typeof nested.message === "string" && nested.message.trim()) {
        return nested.message;
      }
    }
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
  }
  const trimmed = bodyText.trim();
  if (trimmed) {
    return trimmed.slice(0, 500);
  }
  return `Provider request failed (HTTP ${status})`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function extractChatCompletionText(
  provider: AiProviderId,
  payload: unknown,
): string {
  const root = asRecord(payload);
  if (!root) {
    throw new Error("Provider returned an empty response");
  }

  if (provider === "anthropic") {
    const content = root.content;
    if (Array.isArray(content)) {
      const text = content
        .map((block) => {
          const rec = asRecord(block);
          if (rec && rec.type === "text" && typeof rec.text === "string") {
            return rec.text;
          }
          return "";
        })
        .join("")
        .trim();
      if (text) {
        return text;
      }
    }
    throw new Error("Anthropic response did not include text content");
  }

  if (provider === "google") {
    const candidates = root.candidates;
    if (Array.isArray(candidates) && candidates[0]) {
      const content = asRecord(asRecord(candidates[0])?.content);
      const parts = content?.parts;
      if (Array.isArray(parts)) {
        const text = parts
          .map((part) => {
            const rec = asRecord(part);
            return typeof rec?.text === "string" ? rec.text : "";
          })
          .join("")
          .trim();
        if (text) {
          return text;
        }
      }
    }
    const promptFeedback = asRecord(root.promptFeedback);
    const blockReason = promptFeedback?.blockReason;
    if (typeof blockReason === "string" && blockReason) {
      throw new Error(`Gemini blocked the prompt (${blockReason})`);
    }
    throw new Error("Gemini response did not include text content");
  }

  const choices = root.choices;
  if (Array.isArray(choices) && choices[0]) {
    const choice = asRecord(choices[0]);
    const message = asRecord(choice?.message);
    if (typeof message?.content === "string" && message.content.trim()) {
      return message.content.trim();
    }
    if (typeof choice?.text === "string" && choice.text.trim()) {
      return choice.text.trim();
    }
  }
  throw new Error("Chat completions response did not include message content");
}

function openAiCompatibleHeaders(
  apiKey: string,
  baseUrl: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  try {
    const host = new URL(baseUrl).hostname;
    if (host === "openrouter.ai" || host.endsWith(".openrouter.ai")) {
      headers["HTTP-Referer"] =
        typeof window !== "undefined" ? window.location.origin : "";
      headers["X-Title"] = "Aptos Explorer";
    }
  } catch {
    // Ignore invalid URLs; the fetch will surface a clearer error.
  }
  return headers;
}

function buildProviderRequest(request: AiChatRequest): {
  url: string;
  headers: Record<string, string>;
  body: unknown;
} {
  const maxTokens = request.maxTokens ?? DEFAULT_MAX_TOKENS;
  const baseUrl = resolveAiBaseUrl(request.provider, request.baseUrl);

  if (request.provider === "anthropic") {
    return {
      url: joinAiEndpoint(baseUrl, "/v1/messages"),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": request.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: {
        model: request.model,
        max_tokens: maxTokens,
        system: request.system,
        messages: [{role: "user", content: request.user}],
      },
    };
  }

  if (request.provider === "google") {
    return {
      url: joinAiEndpoint(
        baseUrl,
        `/models/${encodeURIComponent(request.model)}:generateContent`,
      ),
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": request.apiKey,
      },
      body: {
        systemInstruction: {parts: [{text: request.system}]},
        contents: [{role: "user", parts: [{text: request.user}]}],
        generationConfig: {maxOutputTokens: maxTokens, temperature: 0.2},
      },
    };
  }

  return {
    url: joinAiEndpoint(baseUrl, "/chat/completions"),
    headers: openAiCompatibleHeaders(request.apiKey, baseUrl),
    body: {
      model: request.model,
      temperature: 0.2,
      max_tokens: maxTokens,
      messages: [
        {role: "system", content: request.system},
        {role: "user", content: request.user},
      ],
    },
  };
}

export async function requestAiChatCompletion(
  request: AiChatRequest,
): Promise<string> {
  assertBrowserOnly();

  const apiKey = request.apiKey.trim();
  const model = request.model.trim();
  if (!apiKey) {
    throw new Error("An API key is required");
  }
  if (!model) {
    throw new Error("A model name is required");
  }
  if (
    request.provider === "openai_compatible" &&
    !request.baseUrl.trim() &&
    !resolveAiBaseUrl(request.provider, request.baseUrl)
  ) {
    throw new Error("A base URL is required for OpenAI-compatible providers");
  }

  const {url, headers, body} = buildProviderRequest({
    ...request,
    apiKey,
    model,
  });
  assertExternalProviderUrl(url);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      credentials: "omit",
      referrerPolicy: "origin",
      headers,
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (isLikelyCorsFailure(error)) {
      throw new Error(
        "The browser blocked the request to your AI provider (CORS or mixed content). Use a provider that allows browser origins (Anthropic, Gemini, OpenRouter, Groq, or a local HTTPS proxy). The explorer never proxies this call.",
      );
    }
    throw error instanceof Error
      ? error
      : new Error("Failed to reach the AI provider");
  }

  const parsed = await parseResponseBody(response);
  if (!response.ok) {
    const bodyText =
      typeof parsed === "string" ? parsed : JSON.stringify(parsed);
    throw new Error(
      providerErrorMessage(response.status, bodyText ?? "", parsed),
    );
  }

  return extractChatCompletionText(request.provider, parsed);
}

/** Test helper: inspect the outbound request without calling fetch. */
export function buildAiChatRequestForTests(request: AiChatRequest): {
  url: string;
  headers: Record<string, string>;
  body: unknown;
} {
  return buildProviderRequest(request);
}
