import {afterEach, describe, expect, it, vi} from "vitest";
import {fetchAIPs} from "./useGetAIPs";

const MOCK_TREE = {
  tree: [
    // legacy filename shape (pre-2024)
    {path: "aips/aip-1.md", sha: "abc"},
    // current filename shape: zero-padded number + slug
    {path: "aips/aip-042-on-chain-randomness.md", sha: "def"},
    {path: "README.md", sha: "ghi"}, // should be filtered out
    {path: "aips/template.md", sha: "jkl"}, // should be filtered out
    {path: "aips/TEMPLATE.md", sha: "mno"}, // should be filtered out
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
        if (url.includes("aip-042-on-chain-randomness.md")) {
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
    // Even though the filename uses zero-padding (042), the canonical AIP
    // number comes from frontmatter `aip: 42`.
    expect(result[1].number).toBe(42);
    expect(result[1].githubUrl).toContain("aip-042-on-chain-randomness.md");
  });

  it("throws RATE_LIMITED when GitHub returns 403", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ok: false, status: 403}));

    await expect(fetchAIPs()).rejects.toThrow("RATE_LIMITED");
  });

  it("throws when the GitHub tree response is truncated", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({tree: [{path: "aips/aip-1.md"}], truncated: true}),
      }),
    );

    await expect(fetchAIPs()).rejects.toThrow("truncated");
  });

  it("strips trailing YAML-style ' # comment' annotations from frontmatter values", async () => {
    // Some AIPs decorate the status with a discussion link, e.g.
    //   Status: Draft # discussion: https://github.com/.../issues/123
    // The explorer should show "Draft", not the whole annotated string.
    const ANNOTATED = `---
aip: 7
title: Annotated Example # not a real header
author: Carol
Status: Draft # discussion: https://example.com/issues/1
quoted: "Has #hash in quotes"
---
Body.
`;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("git/trees")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({tree: [{path: "aips/aip-007-annotated.md"}]}),
          });
        }
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(ANNOTATED),
        });
      }),
    );

    const result = await fetchAIPs();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("Draft");
    expect(result[0].title).toBe("Annotated Example");
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
                  {path: "aips/aip-001-proposer.md", sha: "abc"},
                  {path: "aips/aip-002-something.md", sha: "xyz"},
                ],
              }),
          });
        }
        if (url.includes("aip-001-proposer.md")) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(AIP_1_CONTENT),
          });
        }
        // aip-002 fails
        return Promise.resolve({ok: false, status: 500});
      }),
    );

    const result = await fetchAIPs();
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe(1);
  });
});
