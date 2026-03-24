import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";

/**
 * Core path prefixes that should stay documented for LLM / crawler discoverability.
 * When adding a major top-level route, extend this list and update public/llms*.txt.
 */
const REQUIRED_PATH_SNIPPETS = [
  "/txn/",
  "/account/",
  "/block/",
  "/validators",
  "/validator/",
  "/coin/",
  "/fungible_asset/",
  "/token/",
  "/object/",
  "/coins",
  "/analytics",
  "/blocks",
  "/transactions",
  "/verification",
  "/?search=",
  /** Account/object modules tab */
  "/modules",
  /** Module code sub-tab (published/decompiled/disassembly) */
  "/modules/code/",
  /** Validator list default tab */
  "/validators/all",
  /** Transaction detail tab */
  "userTxnOverview",
  "balanceChange",
  /** User transaction Sentio call trace tab */
  "/trace",
  /** Account multisig tab */
  "/multisig",
  /** Validators enhanced delegation tab */
  "enhanced_delegation",
] as const;

const _dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(_dirname, "..", "..", "public");

describe("LLM docs route coverage", () => {
  const shortDoc = readFileSync(join(publicDir, "llms.txt"), "utf8");
  const fullDoc = readFileSync(join(publicDir, "llms-full.txt"), "utf8");

  it("llms-full.txt documents every core path pattern", () => {
    for (const snippet of REQUIRED_PATH_SNIPPETS) {
      expect(
        fullDoc,
        `Expected llms-full.txt to include "${snippet}"`,
      ).toContain(snippet);
    }
  });

  it("llms.txt documents every core path pattern", () => {
    for (const snippet of REQUIRED_PATH_SNIPPETS) {
      expect(shortDoc, `Expected llms.txt to include "${snippet}"`).toContain(
        snippet,
      );
    }
  });
});
