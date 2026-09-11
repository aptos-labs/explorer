import {describe, expect, it} from "vitest";
import {
  attachFrameAncestorsHeader,
  FRAME_ANCESTORS_CSP,
  PETRA_VAULT_ORIGIN,
} from "./frameAncestors";

describe("FEAT-SEC-001 — frame-ancestors allowlist", () => {
  it("allows the explorer origin and Petra Vault only", () => {
    expect(PETRA_VAULT_ORIGIN).toBe("https://vault.petra.app");
    expect(FRAME_ANCESTORS_CSP).toBe(
      "frame-ancestors 'self' https://vault.petra.app",
    );
    expect(FRAME_ANCESTORS_CSP).not.toContain("*");
    expect(FRAME_ANCESTORS_CSP).not.toContain("'none'");
  });

  it("sets CSP when the response has none", () => {
    const response = attachFrameAncestorsHeader(
      new Response("ok", {headers: {"Content-Type": "text/html"}}),
    );
    expect(response.headers.get("Content-Security-Policy")).toBe(
      FRAME_ANCESTORS_CSP,
    );
    expect(response.headers.get("X-Frame-Options")).toBeNull();
  });

  it("does not replace an existing Content-Security-Policy", () => {
    const response = attachFrameAncestorsHeader(
      new Response("ok", {
        headers: {"Content-Security-Policy": "default-src 'self'"},
      }),
    );
    expect(response.headers.get("Content-Security-Policy")).toBe(
      "default-src 'self'",
    );
  });

  it("preserves status and body", async () => {
    const response = attachFrameAncestorsHeader(
      new Response("hello", {status: 203, statusText: "Non-Authoritative"}),
    );
    expect(response.status).toBe(203);
    expect(await response.text()).toBe("hello");
  });
});
