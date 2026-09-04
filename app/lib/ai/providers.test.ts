import {describe, expect, it} from "vitest";
import {isAiProviderId, joinAiEndpoint, resolveAiBaseUrl} from "./providers";

describe("AI providers", () => {
  it("accepts known provider ids", () => {
    expect(isAiProviderId("openai")).toBe(true);
    expect(isAiProviderId("anthropic")).toBe(true);
    expect(isAiProviderId("google")).toBe(true);
    expect(isAiProviderId("openai_compatible")).toBe(true);
    expect(isAiProviderId("other")).toBe(false);
    expect(isAiProviderId(1)).toBe(false);
  });

  it("uses the override URL when provided and otherwise the provider default", () => {
    expect(resolveAiBaseUrl("openai", " https://proxy.example/v1/ ")).toBe(
      "https://proxy.example/v1",
    );
    expect(resolveAiBaseUrl("anthropic", "")).toBe("https://api.anthropic.com");
    expect(resolveAiBaseUrl("openai_compatible", "")).toBe("");
  });

  it("joins endpoint paths without duplicating a trailing suffix", () => {
    expect(
      joinAiEndpoint("https://api.openai.com/v1", "/chat/completions"),
    ).toBe("https://api.openai.com/v1/chat/completions");
    expect(
      joinAiEndpoint(
        "https://api.openai.com/v1/chat/completions",
        "/chat/completions",
      ),
    ).toBe("https://api.openai.com/v1/chat/completions");
    expect(joinAiEndpoint("https://api.anthropic.com", "/v1/messages")).toBe(
      "https://api.anthropic.com/v1/messages",
    );
  });
});
