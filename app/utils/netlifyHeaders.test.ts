import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";
import {DISCOVERY_LINK_VALUES} from "./agentDiscoveryHeaders";

const _dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(_dirname, "..", "..");

function getHeadersBlock(config: string, path: string): string {
  const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = config.match(
    new RegExp(
      String.raw`\[\[headers\]\]\s+for = "${escapedPath}"\s+\[headers\.values\]([\s\S]*?)(?=\n\[\[|\n\[context|\n# Environment|$)`,
    ),
  );

  expect(
    match,
    `Expected netlify.toml to include a ${path} headers block`,
  ).not.toBeNull();

  return match?.[1] ?? "";
}

describe("Netlify discovery Link headers", () => {
  const config = readFileSync(join(repoRoot, "netlify.toml"), "utf8");

  it("sets RFC 8288 agent-discovery links on the exact homepage route", () => {
    // Covers FEAT-SEO-004: homepage Link headers for agent discovery.
    const homeHeaders = getHeadersBlock(config, "/");

    expect(homeHeaders).toContain('Vary = "Accept"');
    for (const link of DISCOVERY_LINK_VALUES) {
      expect(homeHeaders).toContain(link);
    }
  });

  it("keeps global discovery links aligned with the homepage links", () => {
    // Covers FEAT-SEO-004: non-home HTML responses also advertise discovery.
    const globalHeaders = getHeadersBlock(config, "/*");

    for (const link of DISCOVERY_LINK_VALUES) {
      expect(globalHeaders).toContain(link);
    }
  });

  it("sets Content-Type for new agent-discovery documents", () => {
    expect(getHeadersBlock(config, "/.well-known/agent-card.json")).toContain(
      'Content-Type = "application/json; charset=utf-8"',
    );
    expect(
      getHeadersBlock(config, "/.well-known/oauth-protected-resource"),
    ).toContain('Content-Type = "application/json; charset=utf-8"');
    expect(getHeadersBlock(config, "/auth.md")).toContain(
      'Content-Type = "text/markdown; charset=utf-8"',
    );
  });
});
