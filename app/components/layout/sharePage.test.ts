// Covers FEAT-PWA-002 — Share-this-page button (sharePage helper)
import {describe, expect, it, vi} from "vitest";
import {sharePage} from "./sharePage";

const URL = "https://explorer.aptoslabs.com/account/0x1?network=mainnet";

describe("FEAT-PWA-002 — sharePage", () => {
  it("uses navigator.share when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    const result = await sharePage(
      {url: URL, title: "Account 0x1"},
      {share, writeText},
    );
    expect(result).toBe("shared");
    expect(share).toHaveBeenCalledWith({url: URL, title: "Account 0x1"});
    expect(writeText).not.toHaveBeenCalled();
  });

  it("respects canShare=false and falls back to clipboard", async () => {
    const share = vi.fn();
    const canShare = vi.fn().mockReturnValue(false);
    const writeText = vi.fn().mockResolvedValue(undefined);
    const result = await sharePage({url: URL}, {share, canShare, writeText});
    expect(result).toBe("copied");
    expect(share).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith(URL);
  });

  it("returns 'cancelled' when the user dismisses the share sheet", async () => {
    const abort = Object.assign(new Error("dismissed"), {name: "AbortError"});
    const share = vi.fn().mockRejectedValue(abort);
    const writeText = vi.fn().mockResolvedValue(undefined);
    const result = await sharePage({url: URL}, {share, writeText});
    expect(result).toBe("cancelled");
    // We must NOT silently copy on user cancel — that would surprise users
    // who explicitly dismissed the share sheet.
    expect(writeText).not.toHaveBeenCalled();
  });

  it("falls back to clipboard on non-Abort share errors", async () => {
    const share = vi
      .fn()
      .mockRejectedValue(new Error("NotAllowed: user gesture required"));
    const writeText = vi.fn().mockResolvedValue(undefined);
    const result = await sharePage({url: URL}, {share, writeText});
    expect(result).toBe("copied");
    expect(writeText).toHaveBeenCalledWith(URL);
  });

  it("falls back to clipboard when share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const result = await sharePage({url: URL}, {writeText});
    expect(result).toBe("copied");
    expect(writeText).toHaveBeenCalledWith(URL);
  });

  it("returns 'error' when neither share nor clipboard work", async () => {
    const result = await sharePage({url: URL}, {});
    expect(result).toBe("error");
  });

  it("returns 'error' when clipboard write rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard blocked"));
    const result = await sharePage({url: URL}, {writeText});
    expect(result).toBe("error");
  });

  it("omits unset optional fields from the ShareData payload", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    await sharePage({url: URL}, {share});
    // No title/text keys means the OS share sheet doesn't get blank labels.
    expect(share).toHaveBeenCalledWith({url: URL});
  });
});
