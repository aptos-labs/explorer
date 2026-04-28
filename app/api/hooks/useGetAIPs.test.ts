import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanAuthors, fetchAIPs} from "./useGetAIPs";

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

describe("cleanAuthors", () => {
  it("passes plain comma-separated handles through verbatim", () => {
    expect(cleanAuthors("davidiw, wrwg, msmouse")).toBe(
      "davidiw, wrwg, msmouse",
    );
  });

  it("strips angle-bracketed emails", () => {
    expect(
      cleanAuthors("Alice <alice@example.com>, Bob <bob@example.com>"),
    ).toBe("Alice, Bob");
  });

  it("strips angle-bracketed URLs (github links etc.)", () => {
    expect(cleanAuthors("Alice <https://github.com/alice>")).toBe("Alice");
  });

  it("strips parenthesized github links and @handles", () => {
    expect(cleanAuthors("Alice (https://github.com/alice), Bob (@bob)")).toBe(
      "Alice, Bob",
    );
  });

  it("collapses markdown links to the link text", () => {
    expect(
      cleanAuthors("[Alice](https://github.com/alice), [Bob](mailto:b@x.io)"),
    ).toBe("Alice, Bob");
  });

  it("strips bare URLs that aren't wrapped in punctuation", () => {
    expect(cleanAuthors("Alice https://github.com/alice")).toBe("Alice");
  });

  it("collapses extra whitespace and drops empty tokens", () => {
    expect(cleanAuthors("Alice  ,   ,  Bob")).toBe("Alice, Bob");
  });

  it("strips nested brackets/parens via fixed-point loop (CodeQL multi-char sanitization)", () => {
    // A single pass of `<[^>]*>` would leak the inner `<script>` out of
    // `<<script>>`. Looping until stable reduces it to nothing — the
    // CodeQL mitigation for "Incomplete multi-character sanitization".
    expect(cleanAuthors("Alice <<script>>")).toBe("Alice");
    expect(cleanAuthors("Bob ((nested))")).toBe("Bob");
    // Markdown link wrapping that would survive a single pass:
    expect(cleanAuthors("[[Alice](https://x.io)](https://x.io)")).toBe("Alice");
  });
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
    // The frontmatter author was `Bob <bob@example.com>` — the explorer
    // strips the angle-bracketed email so the table shows only the name.
    expect(result[1].author).toBe("Bob");
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

  it("does not send Authorization headers to raw.githubusercontent.com", async () => {
    // `raw.githubusercontent.com` doesn't accept GitHub-API auth headers and a
    // cross-origin preflight on Authorization would fail there, silently
    // dropping AIP rows. Make sure the fetcher only sends auth to api.github.com.
    vi.stubEnv("VITE_GITHUB_TOKEN", "ghp_test_token");
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("git/trees")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_TREE),
        });
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(AIP_1_CONTENT),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchAIPs();

    for (const call of fetchMock.mock.calls) {
      const [url, init] = call as [string, RequestInit | undefined];
      const headers = (init?.headers ?? {}) as Record<string, string>;
      if (url.startsWith("https://raw.githubusercontent.com/")) {
        expect(headers.Authorization).toBeUndefined();
      }
    }
    // The api.github.com call must still carry the Authorization header.
    const apiCall = fetchMock.mock.calls.find(([u]) =>
      (u as string).startsWith("https://api.github.com/"),
    );
    expect(apiCall).toBeDefined();
    const apiHeaders = (apiCall?.[1] as RequestInit | undefined)?.headers as
      | Record<string, string>
      | undefined;
    expect(apiHeaders?.Authorization).toBe("Bearer ghp_test_token");
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
