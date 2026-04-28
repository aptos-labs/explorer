import {afterEach, describe, expect, it, vi} from "vitest";
import {fetchReleases} from "./useGetReleases";

/**
 * Parse a fetched URL and return its hostname for exact-match dispatch.
 * Using `new URL().hostname === "..."` avoids the "Incomplete URL substring
 * sanitization" CodeQL pattern that `url.includes("registry.npmjs.org")`
 * triggers — `includes` would also match attacker-controlled URLs like
 * `https://evil.example/?x=registry.npmjs.org`.
 */
function host(url: string): string {
  return new URL(url).hostname;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchReleases", () => {
  it("returns version data from all registries in parallel", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (host(url) === "registry.npmjs.org") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                "dist-tags": {latest: "2.1.0"},
                versions: {
                  "2.0.0": {},
                  "2.1.0": {},
                  "2.2.0-rc.1": {},
                },
                time: {
                  "2.0.0": "2024-04-01T00:00:00Z",
                  "2.1.0": "2024-06-15T12:00:00Z",
                  "2.2.0-rc.1": "2024-07-01T00:00:00Z",
                },
              }),
          });
        }
        if (host(url) === "pypi.org") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                info: {version: "1.5.0"},
                releases: {
                  "1.4.0": [
                    {upload_time_iso_8601: "2023-05-01T00:00:00.000000Z"},
                  ],
                  "1.5.0": [
                    {upload_time_iso_8601: "2023-08-01T09:30:00.000000Z"},
                  ],
                  "1.6.0b1": [
                    {upload_time_iso_8601: "2023-09-01T00:00:00.000000Z"},
                  ],
                },
              }),
          });
        }
        if (host(url) === "crates.io") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                crate: {
                  newest_version: "3.0.0",
                  updated_at: "2026-01-01T00:00:00Z",
                },
                versions: [
                  {
                    num: "3.0.0",
                    created_at: "2026-01-01T00:00:00Z",
                  },
                  {
                    num: "2.9.0",
                    created_at: "2025-11-01T00:00:00Z",
                  },
                  {
                    num: "3.1.0-beta.1",
                    created_at: "2026-02-01T00:00:00Z",
                  },
                ],
              }),
          });
        }
        if (host(url) === "proxy.golang.org") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                Version: "v0.6.2",
                Time: "2026-01-01T00:00:00Z",
              }),
          });
        }
        if (host(url) === "api.github.com") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                {
                  tag_name: "aptos-cli-v4.5.0",
                  html_url:
                    "https://github.com/aptos-labs/aptos-core/releases/tag/aptos-cli-v4.5.0",
                  published_at: "2026-01-01T00:00:00Z",
                  prerelease: false,
                },
                {
                  tag_name: "aptos-cli-v4.6.0-rc.1",
                  html_url:
                    "https://github.com/aptos-labs/aptos-core/releases/tag/aptos-cli-v4.6.0-rc.1",
                  published_at: "2026-02-01T00:00:00Z",
                  prerelease: true,
                },
                {
                  tag_name: "aptos-node-v1.20.0",
                  html_url:
                    "https://github.com/aptos-labs/aptos-core/releases/tag/aptos-node-v1.20.0",
                  published_at: "2026-01-01T00:00:00Z",
                  prerelease: false,
                },
              ]),
          });
        }
        return Promise.resolve({ok: false, status: 404});
      }),
    );

    const result = await fetchReleases();

    expect(result.typescript.status).toBe("success");
    if (result.typescript.status === "success") {
      // Headline picks the latest *stable* SemVer release; the rc.1 published
      // most recently must NOT become the headline.
      expect(result.typescript.version).toBe("2.1.0");
      expect(result.typescript.isStable).toBe(true);
      expect(result.typescript.publishedAt).toBe("2024-06-15T12:00:00Z");
      // Recent list is newest-first and includes the rc with its own flag.
      expect(result.typescript.recent.map((r) => r.version)).toEqual([
        "2.2.0-rc.1",
        "2.1.0",
        "2.0.0",
      ]);
      expect(
        result.typescript.recent.find((r) => r.version === "2.2.0-rc.1")
          ?.isPrerelease,
      ).toBe(true);
    }

    expect(result.python.status).toBe("success");
    if (result.python.status === "success") {
      // 1.6.0b1 is a prerelease (not stable SemVer); headline must be 1.5.0.
      expect(result.python.version).toBe("1.5.0");
      expect(result.python.isStable).toBe(true);
      expect(result.python.publishedAt).toBe("2023-08-01T09:30:00.000000Z");
    }

    expect(result.rust.status).toBe("success");
    if (result.rust.status === "success") {
      // Beta is excluded from headline selection.
      expect(result.rust.version).toBe("3.0.0");
      expect(result.rust.isStable).toBe(true);
      expect(result.rust.recent.length).toBe(3);
    }

    expect(result.go.status).toBe("success");
    if (result.go.status === "success") {
      expect(result.go.version).toBe("v0.6.2");
      expect(result.go.isStable).toBe(true);
      expect(result.go.recent.length).toBe(1);
    }

    expect(result.cli.status).toBe("success");
    if (result.cli.status === "success") {
      // CLI rc.1 is GitHub-flagged prerelease AND has a SemVer suffix; the
      // stable v4.5.0 must be picked even though the rc is more recent.
      expect(result.cli.version).toBe("v4.5.0");
      expect(result.cli.isStable).toBe(true);
      // The drill-in list still surfaces the rc so users can see it.
      expect(result.cli.recent.map((r) => r.version)).toEqual([
        "v4.6.0-rc.1",
        "v4.5.0",
      ]);
    }

    expect(result.node.status).toBe("success");
    if (result.node.status === "success") {
      expect(result.node.version).toBe("v1.20.0");
      expect(result.node.isStable).toBe(true);
    }
  });

  it("falls back to the most recent release when no stable is available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (host(url) === "registry.npmjs.org") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                "dist-tags": {latest: "1.0.0-rc.2"},
                versions: {
                  "1.0.0-rc.1": {},
                  "1.0.0-rc.2": {},
                },
                time: {
                  "1.0.0-rc.1": "2024-01-01T00:00:00Z",
                  "1.0.0-rc.2": "2024-02-01T00:00:00Z",
                },
              }),
          });
        }
        return Promise.resolve({ok: false, status: 404});
      }),
    );

    const result = await fetchReleases();
    expect(result.typescript.status).toBe("success");
    if (result.typescript.status === "success") {
      expect(result.typescript.version).toBe("1.0.0-rc.2");
      expect(result.typescript.isStable).toBe(false);
    }
  });

  it("returns error status for a registry that fails without aborting others", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (host(url) === "registry.npmjs.org") {
          return Promise.reject(new Error("Network error"));
        }
        if (host(url) === "pypi.org") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                info: {version: "1.5.0"},
                releases: {
                  "1.5.0": [
                    {upload_time_iso_8601: "2023-08-01T09:30:00.000000Z"},
                  ],
                },
              }),
          });
        }
        if (host(url) === "crates.io") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                crate: {
                  newest_version: "3.0.0",
                  updated_at: "2026-01-01T00:00:00Z",
                },
                versions: [{num: "3.0.0", created_at: "2026-01-01T00:00:00Z"}],
              }),
          });
        }
        if (host(url) === "proxy.golang.org") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                Version: "v0.6.2",
                Time: "2026-01-01T00:00:00Z",
              }),
          });
        }
        if (host(url) === "api.github.com") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return Promise.resolve({ok: false, status: 404});
      }),
    );

    const result = await fetchReleases();
    expect(result.typescript.status).toBe("error");
    expect(result.python.status).toBe("success");
    expect(result.rust.status).toBe("success");
    expect(result.go.status).toBe("success");
    expect(result.cli.status).toBe("error");
    expect(result.node.status).toBe("error");
  });

  it("marks npm as error when versions map is missing or empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (host(url) === "registry.npmjs.org") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({}),
          });
        }
        return Promise.resolve({ok: false, status: 404});
      }),
    );

    const result = await fetchReleases();
    expect(result.typescript.status).toBe("error");
  });
});
