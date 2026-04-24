// Covers FEAT-RATELIMIT-003 — REST client truncates HTML error pages on non-OK responses
import {afterEach, describe, expect, it, vi} from "vitest";
import {AptosClient} from "./legacyClient";

describe("AptosClient request errors", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shortens HTML 429 bodies instead of dumping the full page", async () => {
    const hugeHtml = `<!doctype html><meta charset="utf-8"><title>429</title>429 Too Many Requests${"x".repeat(5000)}`;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: () => Promise.resolve(hugeHtml),
      }),
    );

    const client = new AptosClient("https://example.com/v1");
    try {
      await client.getLedgerInfo();
      expect.fail("expected getLedgerInfo to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      const msg = (e as Error).message;
      expect(msg).toMatch(/Aptos API error 429:/);
      expect(msg).toMatch(/HTML error page, not JSON/);
      expect(msg.length).toBeLessThan(1200);
    }
  });
});
