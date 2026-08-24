import {readFileSync} from "node:fs";
import {mkdir, mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {afterEach, describe, expect, it} from "vitest";
import {
  CLIENT_BUILD_ENTRY,
  isSpaIndexHtmlOutput,
  isSpaShellHtml,
  resolveClientBuildInput,
  SPA_INDEX_HTML_FILES,
  SPA_INDEX_HTML_OUTPUT_DIRS,
  spaIndexHtmlOutputPaths,
  stripSpaIndexHtmlFromBuildOutputs,
} from "./omitSpaIndexHtml";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, {recursive: true, force: true})),
  );
});

describe("isSpaIndexHtmlOutput", () => {
  // Covers FEAT-SEO-004 — production must not publish the Vite SPA shell
  it("matches the SPA index document and compressed copies", () => {
    expect(SPA_INDEX_HTML_FILES).toEqual([
      "index.html",
      "index.html.gz",
      "index.html.br",
    ]);
    expect(isSpaIndexHtmlOutput("index.html")).toBe(true);
    expect(isSpaIndexHtmlOutput("index.html.gz")).toBe(true);
    expect(isSpaIndexHtmlOutput("index.html.br")).toBe(true);
    expect(isSpaIndexHtmlOutput("assets/index.html")).toBe(true);
  });

  it("does not match hashed client assets or other HTML", () => {
    expect(isSpaIndexHtmlOutput("assets/client-abc123.js")).toBe(false);
    expect(isSpaIndexHtmlOutput("404.html")).toBe(false);
    expect(isSpaIndexHtmlOutput("index.htm")).toBe(false);
  });
});

describe("resolveClientBuildInput", () => {
  // Covers FEAT-SEO-004 — Nitro must bundle app/client.tsx, not index.html
  it("points at the TanStack Start client entry, not the Vite HTML shell", () => {
    expect(CLIENT_BUILD_ENTRY).toBe("app/client.tsx");
    expect(resolveClientBuildInput("/repo")).toBe(
      join("/repo", "app/client.tsx"),
    );
    expect(resolveClientBuildInput("/repo")).not.toMatch(/index\.html$/);
  });

  it("is wired as the Vite client rollup/rolldown input", () => {
    const repoRoot = join(
      fileURLToPath(new URL(".", import.meta.url)),
      "../..",
    );
    const viteConfig = readFileSync(join(repoRoot, "vite.config.ts"), "utf8");
    expect(viteConfig).toContain("input: clientBuildInput");
    expect(viteConfig).toContain("resolveClientBuildInput");
    expect(viteConfig).toContain("renderer: false");
  });
});

describe("isSpaShellHtml", () => {
  it("detects the unbundled /app/client.tsx module script", () => {
    expect(
      isSpaShellHtml(`<script type="module" src="/app/client.tsx"></script>`),
    ).toBe(true);
    expect(
      isSpaShellHtml(
        `<script type="module" src="/assets/client-abc.js"></script>`,
      ),
    ).toBe(false);
  });
});

describe("stripSpaIndexHtmlFromBuildOutputs", () => {
  it("deletes SPA index.html from Nitro and Vite output roots", async () => {
    const root = await mkdtemp(join(tmpdir(), "spa-index-"));
    tempDirs.push(root);

    expect(SPA_INDEX_HTML_OUTPUT_DIRS).toContain(".vercel/output/static");
    const vercelStatic = join(root, ".vercel/output/static");
    await mkdir(vercelStatic, {recursive: true});
    await writeFile(
      join(vercelStatic, "index.html"),
      `<script type="module" src="/app/client.tsx"></script>`,
    );
    await writeFile(join(vercelStatic, "favicon.svg"), "<svg></svg>");

    const removed = await stripSpaIndexHtmlFromBuildOutputs(root);
    expect(removed).toContain(join(vercelStatic, "index.html"));
    await expect(
      readFile(join(vercelStatic, "favicon.svg"), "utf8"),
    ).resolves.toBe("<svg></svg>");
    expect(
      spaIndexHtmlOutputPaths(root).some((p) => p.endsWith("index.html")),
    ).toBe(true);
  });

  it("also strips an extra outDir passed by the Vite plugin", async () => {
    const root = await mkdtemp(join(tmpdir(), "spa-index-"));
    tempDirs.push(root);
    const extra = join(root, "custom-out");
    await mkdir(extra, {recursive: true});
    await writeFile(join(extra, "index.html.br"), "fake");

    const removed = await stripSpaIndexHtmlFromBuildOutputs(root, [extra]);
    expect(removed).toContain(join(extra, "index.html.br"));
  });
});
