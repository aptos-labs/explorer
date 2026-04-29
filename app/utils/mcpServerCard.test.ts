import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";
import {buildWebMcpTools} from "../components/webMcpTools";

const _dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(_dirname, "..", "..", "public");
const serverCardPath = join(
  publicDir,
  ".well-known",
  "mcp",
  "server-card.json",
);

type McpServerCard = {
  serverInfo?: {
    name?: string;
    version?: string;
  };
  transport?: {
    type?: string;
    endpoint?: string;
  };
  capabilities?: {
    tools?: unknown;
    resources?: unknown;
    prompts?: unknown;
  };
  tools?: Array<{name?: string}>;
};

describe("MCP Server Card (/.well-known/mcp/server-card.json)", () => {
  const card = JSON.parse(
    readFileSync(serverCardPath, "utf8"),
  ) as McpServerCard;
  const webMcpToolNames = buildWebMcpTools(() => undefined).map(
    (tool) => tool.name,
  );

  it("publishes the minimum SEP-1649 discovery fields", () => {
    // Covers FEAT-SEO-004.
    expect(card.serverInfo?.name).toBe("aptos-explorer");
    expect(card.serverInfo?.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(card.transport?.endpoint).toBe("https://explorer.aptoslabs.com/");
    expect(card.capabilities).toMatchObject({
      resources: false,
      prompts: false,
    });
    expect(card.capabilities?.tools).toBeTruthy();
  });

  it("advertises the read-only WebMCP navigation tools", () => {
    expect(card.transport?.type).toBe("webmcp");
    expect(card.tools?.map((tool) => tool.name)).toEqual(webMcpToolNames);
  });
});
