#!/usr/bin/env node
import {createHash} from "node:crypto";
import {readFileSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const INDEX_PATH = resolve(
  repoRoot,
  "public/.well-known/agent-skills/index.json",
);

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

const ALLOWED_URL_PREFIX = "/.well-known/agent-skills/";
const SKILLS_ROOT = resolve(repoRoot, "public/.well-known/agent-skills");

function main() {
  const indexText = readFileSync(INDEX_PATH, "utf8");
  const index = JSON.parse(indexText);
  if (!Array.isArray(index.skills)) {
    throw new Error("index.json missing skills array");
  }

  let changed = false;
  for (const skill of index.skills) {
    if (skill.type !== "skill-md") continue;
    if (typeof skill.url !== "string") {
      throw new Error(`skill ${skill.name} missing url`);
    }
    if (!skill.url.startsWith(ALLOWED_URL_PREFIX)) {
      throw new Error(
        `skill ${skill.name} has url "${skill.url}" outside of ${ALLOWED_URL_PREFIX}. ` +
          "Skill artifacts must live under public/.well-known/agent-skills/.",
      );
    }
    // Resolve against repoRoot/public, then assert the final path stays
    // inside the skills root to defeat any ".." components.
    const filePath = resolve(repoRoot, "public", skill.url.replace(/^\//, ""));
    if (filePath !== SKILLS_ROOT && !filePath.startsWith(`${SKILLS_ROOT}/`)) {
      throw new Error(
        `skill ${skill.name} resolves to "${filePath}" which escapes ${SKILLS_ROOT}.`,
      );
    }
    const bytes = readFileSync(filePath);
    const digest = sha256(bytes);
    if (skill.digest !== digest) {
      console.log(`Updating ${skill.name}: ${skill.digest} -> ${digest}`);
      skill.digest = digest;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`);
    console.log("Wrote", INDEX_PATH);
  } else {
    console.log("All skill digests already up to date.");
  }
}

main();
