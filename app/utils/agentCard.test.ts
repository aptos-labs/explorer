import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";
import {buildWebMcpTools} from "../components/webMcpTools";

const _dirname = dirname(fileURLToPath(import.meta.url));
const cardPath = join(
  _dirname,
  "..",
  "..",
  "public",
  ".well-known",
  "agent-card.json",
);

type AgentSkill = {
  id?: string;
  name?: string;
  description?: string;
  tags?: string[];
};

type AgentInterface = {
  url?: string;
  protocolBinding?: string;
  protocolVersion?: string;
};

type AgentCard = {
  name?: string;
  description?: string;
  version?: string;
  url?: string;
  supportedInterfaces?: AgentInterface[];
  capabilities?: Record<string, unknown>;
  skills?: AgentSkill[];
  defaultInputModes?: string[];
  defaultOutputModes?: string[];
};

describe("A2A Agent Card (/.well-known/agent-card.json)", () => {
  const card = JSON.parse(readFileSync(cardPath, "utf8")) as AgentCard;
  const webMcpToolNames = buildWebMcpTools(() => undefined).map(
    (tool) => tool.name,
  );

  it("publishes the fields agent-readiness scanners require", () => {
    // Covers FEAT-SEO-004.
    expect(card.name).toBe("Aptos Explorer");
    expect(card.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(card.description).toMatch(/explorer/i);
    expect(card.supportedInterfaces?.[0]?.url).toBe(
      "https://explorer.aptoslabs.com/",
    );
    expect(card.supportedInterfaces?.[0]?.protocolBinding).toBeTruthy();
    expect(card.capabilities).toMatchObject({
      streaming: false,
      pushNotifications: false,
    });
  });

  it("lists skills that match the WebMCP navigation tools", () => {
    const skillIds = (card.skills ?? []).map((skill) => skill.id);
    expect(skillIds).toEqual(
      webMcpToolNames.map((name) => name.replaceAll("_", "-")),
    );
    for (const skill of card.skills ?? []) {
      expect(skill.id).toBeTruthy();
      expect(skill.name).toBeTruthy();
      expect(skill.description).toBeTruthy();
      expect(skill.tags?.length).toBeGreaterThan(0);
    }
  });
});
