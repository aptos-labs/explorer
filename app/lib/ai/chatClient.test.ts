import {afterEach, describe, expect, it, vi} from "vitest";
import {
  assertExternalProviderUrl,
  buildAiChatRequestForTests,
  extractChatCompletionText,
  isLikelyCorsFailure,
  requestAiChatCompletion,
} from "./chatClient";

const baseRequest = {
  model: "test-model",
  apiKey: "secret-key",
  baseUrl: "",
  system: "system prompt",
  user: "user prompt",
} as const;

describe("AI chat client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("builds an Anthropic browser-BYOK request", () => {
    const built = buildAiChatRequestForTests({
      ...baseRequest,
      provider: "anthropic",
    });
    expect(built.url).toBe("https://api.anthropic.com/v1/messages");
    expect(built.headers["x-api-key"]).toBe("secret-key");
    expect(built.headers["anthropic-dangerous-direct-browser-access"]).toBe(
      "true",
    );
    expect(built.headers.Authorization).toBeUndefined();
    expect(JSON.stringify(built.body)).toContain("system prompt");
  });

  it("builds an OpenAI-compatible request against the caller endpoint", () => {
    const built = buildAiChatRequestForTests({
      ...baseRequest,
      provider: "openai_compatible",
      baseUrl: "https://openrouter.ai/api/v1",
    });
    expect(built.url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(built.headers.Authorization).toBe("Bearer secret-key");
    expect(built.url).not.toContain("explorer.aptoslabs.com");
  });

  it("builds a Gemini request with the API key in a header, not the URL", () => {
    const built = buildAiChatRequestForTests({
      ...baseRequest,
      provider: "google",
      model: "gemini-2.5-flash",
    });
    expect(built.url).toContain("/models/gemini-2.5-flash:generateContent");
    expect(built.url).not.toContain("secret-key");
    expect(built.headers["x-goog-api-key"]).toBe("secret-key");
  });

  it("extracts text from each provider payload shape", () => {
    expect(
      extractChatCompletionText("openai", {
        choices: [{message: {content: " hello "}}],
      }),
    ).toBe("hello");
    expect(
      extractChatCompletionText("anthropic", {
        content: [
          {type: "text", text: "a"},
          {type: "text", text: "b"},
        ],
      }),
    ).toBe("ab");
    expect(
      extractChatCompletionText("google", {
        candidates: [{content: {parts: [{text: "gemini"}]}}],
      }),
    ).toBe("gemini");
  });

  it("rejects explorer-origin provider URLs", () => {
    expect(() =>
      assertExternalProviderUrl("https://explorer.aptoslabs.com/v1/chat"),
    ).toThrow(/Explorer origin/);
    expect(() => assertExternalProviderUrl("/chat/completions")).toThrow(
      /absolute http/,
    );
  });

  it("detects CORS-shaped fetch failures", () => {
    expect(isLikelyCorsFailure(new TypeError("Failed to fetch"))).toBe(true);
    expect(isLikelyCorsFailure(new Error("Failed to fetch"))).toBe(false);
  });

  it("posts from the browser with credentials omitted", async () => {
    vi.stubGlobal("window", {
      location: {origin: "http://localhost:3030"},
    });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({choices: [{message: {content: "ok"}}]}), {
        status: 200,
        headers: {"Content-Type": "application/json"},
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const text = await requestAiChatCompletion({
      ...baseRequest,
      provider: "openai",
    });
    expect(text).toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(init.credentials).toBe("omit");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer secret-key");
  });

  it("surfaces provider HTTP errors without echoing the API key", async () => {
    vi.stubGlobal("window", {
      location: {origin: "http://localhost:3030"},
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({error: {message: "invalid_api_key"}}), {
          status: 401,
          headers: {"Content-Type": "application/json"},
        }),
      ),
    );

    await expect(
      requestAiChatCompletion({
        ...baseRequest,
        provider: "openai",
        apiKey: "sk-super-secret",
      }),
    ).rejects.toThrow("invalid_api_key");
  });
});
