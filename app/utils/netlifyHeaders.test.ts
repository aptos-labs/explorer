import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";

const _dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(_dirname, "..", "..");

const REQUIRED_DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</.well-known/agent-skills/index.json>; rel="https://agentskills.io/rel/index"; type="application/json"',
  '</llms.txt>; rel="alternate"; type="text/plain"; title="LLM Documentation (Summary)"',
  '</llms-full.txt>; rel="alternate"; type="text/plain"; title="LLM Documentation (Full)"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
] as const;

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
    for (const link of REQUIRED_DISCOVERY_LINKS) {
      expect(homeHeaders).toContain(link);
    }
  });

  it("keeps global discovery links aligned with the homepage links", () => {
    // Covers FEAT-SEO-004: non-home HTML responses also advertise discovery.
    const globalHeaders = getHeadersBlock(config, "/*");

    for (const link of REQUIRED_DISCOVERY_LINKS) {
      expect(globalHeaders).toContain(link);
    }
  });
});
