import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";

const _dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(_dirname, "..", "..");

describe("auth.md agent registration discovery", () => {
  const authMd = readFileSync(join(repoRoot, "public", "auth.md"), "utf8");

  it("is self-contained markdown with an auth.md H1", () => {
    // Covers FEAT-SEO-004.
    expect(authMd.startsWith("# ")).toBe(true);
    expect(authMd.split("\n", 1)[0]?.toLowerCase()).toContain("auth.md");
    expect(authMd).toMatch(/no agent registration/i);
    expect(authMd).toContain("https://explorer.aptoslabs.com");
  });
});

describe("OAuth Protected Resource Metadata", () => {
  const prm = JSON.parse(
    readFileSync(
      join(repoRoot, "public", ".well-known", "oauth-protected-resource"),
      "utf8",
    ),
  ) as {
    resource?: string;
    authorization_servers?: unknown;
    resource_documentation?: string;
  };

  it("describes the explorer as a public resource", () => {
    // Covers FEAT-SEO-004.
    expect(prm.resource).toBe("https://explorer.aptoslabs.com/");
    expect(Array.isArray(prm.authorization_servers)).toBe(true);
    expect(prm.authorization_servers).toEqual([]);
    expect(prm.resource_documentation).toBe(
      "https://explorer.aptoslabs.com/auth.md",
    );
  });
});
