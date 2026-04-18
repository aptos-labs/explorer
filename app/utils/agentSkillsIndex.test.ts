import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";

const _dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(_dirname, "..", "..", "public");

type SkillEntry = {
  name: string;
  type: string;
  description: string;
  url: string;
  digest: string;
};

type SkillsIndex = {
  $schema: string;
  skills: SkillEntry[];
};

function sha256(bytes: Buffer): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

describe("Agent Skills discovery index (/.well-known/agent-skills/index.json)", () => {
  const indexPath = join(
    publicDir,
    ".well-known",
    "agent-skills",
    "index.json",
  );
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as SkillsIndex;

  it("declares the v0.2.0 agent-skills discovery schema", () => {
    expect(index.$schema).toBe(
      "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    );
  });

  it("has at least one skill entry", () => {
    expect(Array.isArray(index.skills)).toBe(true);
    expect(index.skills.length).toBeGreaterThan(0);
  });

  it("uses valid skill names (lowercase alphanumeric + hyphens)", () => {
    const nameRe = /^[a-z0-9](?:[a-z0-9]|-(?!-)){0,62}[a-z0-9]$/;
    for (const skill of index.skills) {
      expect(skill.name, `skill name "${skill.name}"`).toMatch(nameRe);
      expect(skill.name.length).toBeGreaterThanOrEqual(1);
      expect(skill.name.length).toBeLessThanOrEqual(64);
    }
  });

  it("has matching SHA-256 digests for every skill-md artifact", () => {
    for (const skill of index.skills) {
      if (skill.type !== "skill-md") continue;
      expect(skill.url.startsWith("/.well-known/agent-skills/")).toBe(true);
      const filePath = join(publicDir, skill.url.replace(/^\//, ""));
      const bytes = readFileSync(filePath);
      const digest = sha256(bytes);
      expect(
        digest,
        `digest for ${skill.name} does not match ${filePath}. Run \`node scripts/update-agent-skills-index.mjs\` to regenerate.`,
      ).toBe(skill.digest);
    }
  });

  it("each skill-md file has YAML frontmatter with name and description", () => {
    for (const skill of index.skills) {
      if (skill.type !== "skill-md") continue;
      const filePath = join(publicDir, skill.url.replace(/^\//, ""));
      const text = readFileSync(filePath, "utf8");
      expect(text.startsWith("---\n")).toBe(true);
      const match = text.match(/^---\n([\s\S]*?)\n---/);
      expect(match, `frontmatter missing in ${filePath}`).not.toBeNull();
      const frontmatter = match?.[1] ?? "";
      expect(frontmatter).toMatch(new RegExp(`^name:\\s*${skill.name}$`, "m"));
      expect(frontmatter).toMatch(/^description:\s+\S/m);
    }
  });
});
