import {afterEach, describe, expect, it, vi} from "vitest";
import {fetchAIPs} from "./useGetAIPs";

const MOCK_TREE = {
  tree: [
    {path: "aips/aip-1.md", sha: "abc"},
    {path: "aips/aip-42.md", sha: "def"},
    {path: "README.md", sha: "ghi"}, // should be filtered out
    {path: "aips/template.md", sha: "jkl"}, // should be filtered out
  ],
};

const AIP_1_CONTENT = `---
aip: 1
title: Proposer Selection
author: Alice
Status: Final
---
Content here.
`;

const AIP_42_CONTENT = `---
aip: 42
title: On-chain Randomness
author: Bob <bob@example.com>
Status: Draft
---
Content here.
`;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchAIPs", () => {
  it("returns parsed AIPs sorted by number, filtering non-AIP files", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("git/trees")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(MOCK_TREE),
          });
        }
        if (url.includes("aip-1.md")) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(AIP_1_CONTENT),
          });
        }
        if (url.includes("aip-42.md")) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(AIP_42_CONTENT),
          });
        }
        return Promise.resolve({ok: false, status: 404});
      }),
    );

    const result = await fetchAIPs();

    expect(result).toHaveLength(2);
    expect(result[0].number).toBe(1);
    expect(result[0].title).toBe("Proposer Selection");
    expect(result[0].status).toBe("Final");
    expect(result[0].author).toBe("Alice");
    expect(result[0].githubUrl).toContain("aip-1.md");
    expect(result[1].number).toBe(42);
  });

  it("throws RATE_LIMITED when GitHub returns 403", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ok: false, status: 403}));

    await expect(fetchAIPs()).rejects.toThrow("RATE_LIMITED");
  });

  it("skips files whose raw content fails without aborting the whole fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("git/trees")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                tree: [
                  {path: "aips/aip-1.md", sha: "abc"},
                  {path: "aips/aip-2.md", sha: "xyz"},
                ],
              }),
          });
        }
        if (url.includes("aip-1.md")) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(AIP_1_CONTENT),
          });
        }
        // aip-2 fails
        return Promise.resolve({ok: false, status: 500});
      }),
    );

    const result = await fetchAIPs();
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe(1);
  });
});
