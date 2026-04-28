import {afterEach, describe, expect, it, vi} from "vitest";
import {fetchReleases} from "./useGetReleases";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchReleases", () => {
  it("returns version data from all registries in parallel", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("registry.npmjs.org")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({version: "2.1.0"}),
          });
        }
        if (url.includes("pypi.org")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({info: {version: "1.5.0"}}),
          });
        }
        if (url.includes("crates.io")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                crate: {
                  newest_version: "3.0.0",
                  updated_at: "2026-01-01T00:00:00Z",
                },
              }),
          });
        }
        if (url.includes("proxy.golang.org")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                Version: "v0.6.2",
                Time: "2026-01-01T00:00:00Z",
              }),
          });
        }
        if (url.includes("api.github.com")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                {
                  tag_name: "aptos-cli-v4.5.0",
                  html_url:
                    "https://github.com/aptos-labs/aptos-core/releases/tag/aptos-cli-v4.5.0",
                  published_at: "2026-01-01T00:00:00Z",
                },
                {
                  tag_name: "aptos-node-v1.20.0",
                  html_url:
                    "https://github.com/aptos-labs/aptos-core/releases/tag/aptos-node-v1.20.0",
                  published_at: "2026-01-01T00:00:00Z",
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
      expect(result.typescript.version).toBe("2.1.0");
    }
    expect(result.python.status).toBe("success");
    if (result.python.status === "success") {
      expect(result.python.version).toBe("1.5.0");
    }
    expect(result.rust.status).toBe("success");
    if (result.rust.status === "success") {
      expect(result.rust.version).toBe("3.0.0");
    }
    expect(result.go.status).toBe("success");
    if (result.go.status === "success") {
      expect(result.go.version).toBe("v0.6.2");
    }
    expect(result.cli.status).toBe("success");
    if (result.cli.status === "success") {
      expect(result.cli.version).toBe("v4.5.0");
    }
    expect(result.node.status).toBe("success");
    if (result.node.status === "success") {
      expect(result.node.version).toBe("v1.20.0");
    }
  });

  it("returns error status for a registry that fails without aborting others", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("registry.npmjs.org")) {
          return Promise.reject(new Error("Network error"));
        }
        if (url.includes("pypi.org")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({info: {version: "1.5.0"}}),
          });
        }
        if (url.includes("crates.io")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                crate: {
                  newest_version: "3.0.0",
                  updated_at: "2026-01-01T00:00:00Z",
                },
              }),
          });
        }
        if (url.includes("proxy.golang.org")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                Version: "v0.6.2",
                Time: "2026-01-01T00:00:00Z",
              }),
          });
        }
        if (url.includes("api.github.com")) {
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
});
