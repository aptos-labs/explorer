import {useQuery} from "@tanstack/react-query";

export type AIP = {
  number: number;
  title: string;
  status: string;
  author: string;
  githubUrl: string;
};

/**
 * Strip a trailing YAML-style comment (` #...` — space then hash, to end of
 * line) from an *unquoted* scalar value. AIP frontmatter sometimes annotates
 * fields like `Status: Draft # discussion: <url>`; the `#` and everything
 * after it is meta, not data, so the explorer should ignore it. Quoted
 * strings preserve their `#` characters (which is also what YAML 1.2 does).
 */
function stripYamlComment(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value;
  }
  const idx = value.indexOf(" #");
  return idx === -1 ? value : value.slice(0, idx).trimEnd();
}

/**
 * Clean up the AIP `author:` frontmatter for display. AIP authors are written
 * in many shapes:
 *
 *   - bare github handle:           `igor-aptos`
 *   - comma-separated handles:      `davidiw, wrwg, msmouse`
 *   - name + email:                 `Alice <alice@example.com>`
 *   - markdown link:                `[Alice](https://github.com/alice)`
 *   - parenthesized url or handle:  `Alice (https://github.com/alice)` /
 *                                   `Alice (@alice)`
 *   - angle-bracketed url:          `Alice <https://github.com/alice>`
 *
 * The explorer's AIP table is supposed to be a glanceable index, not a
 * directory of contact details — strip emails and github links so each row
 * shows just the name(s).
 */
/**
 * Apply a regex replacement repeatedly until the string stops changing.
 * This is the standard mitigation for "incomplete multi-character
 * sanitization" — a single pass of `<[^>]*>` would still leak `<script>`
 * out of an input like `<<script>>`, but a fixed-point loop reduces such
 * nested patterns to empty.
 */
function replaceUntilStable(input: string, pattern: RegExp): string {
  let prev = input;
  // Cap iterations defensively in case a regex's replacement re-introduces
  // a match (none of ours do, but better safe than spinning forever).
  for (let i = 0; i < 16; i++) {
    const next = prev.replace(pattern, "");
    if (next === prev) return next;
    prev = next;
  }
  return prev;
}

export function cleanAuthors(raw: string): string {
  return raw
    .split(",")
    .map((token) => {
      let t = token;
      // `[Name](url)` → `Name`. Loop in case of nested-bracket trickery
      // like `[[Name](url)](url)`.
      let prev = t;
      for (let i = 0; i < 16; i++) {
        const next = prev.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
        if (next === prev) break;
        prev = next;
      }
      t = prev;
      // Drop `<...>` (catches both `<email>` and `<url>`). Loop until the
      // string stabilizes so nested patterns like `<<script>>` reduce
      // completely (CodeQL "incomplete multi-character sanitization").
      t = replaceUntilStable(t, /<[^>]*>/g);
      // Drop `(...)` (catches `(https://...)` and `(@handle)`).
      t = replaceUntilStable(t, /\([^)]*\)/g);
      // Drop any stray brackets/parens left over (e.g. unbalanced `>`
      // from inputs like `<<script>>`). Author names never legitimately
      // contain these characters in the AIP corpus.
      t = t.replace(/[<>()]/g, "");
      // Drop bare URLs that aren't wrapped in punctuation.
      t = t.replace(/https?:\/\/\S+/g, "");
      return t.replace(/\s+/g, " ").trim();
    })
    .filter((t) => t.length > 0)
    .join(", ");
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const rawValue = line.slice(colon + 1).trim();
    const value = stripYamlComment(rawValue).replace(/^["']|["']$/g, "");
    if (key && value) result[key] = value;
  }
  return result;
}

export async function fetchAIPs(): Promise<AIP[]> {
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (githubToken) headers["Authorization"] = `Bearer ${githubToken}`;

  const treeRes = await fetch(
    "https://api.github.com/repos/aptos-foundation/AIPs/git/trees/main?recursive=1",
    {headers},
  );
  if (!treeRes.ok) {
    if (treeRes.status === 403) throw new Error("RATE_LIMITED");
    throw new Error(`GitHub API error: ${treeRes.status}`);
  }
  const tree = (await treeRes.json()) as {
    tree: {path: string}[];
    truncated: boolean;
  };
  if (tree.truncated) throw new Error("AIP tree response was truncated");

  // AIP files in the repo are named like `aips/aip-001-some-slug.md` (with
  // leading-zero-padded numbers and a kebab-case slug). Older versions of the
  // repo also used `aips/aip-42.md`, so accept both shapes. The canonical AIP
  // number is taken from frontmatter (`aip: N`) where available, falling back
  // to the digits in the filename.
  const FILENAME_RE = /^aips\/aip-(\d+)(?:-[^/]*)?\.md$/;
  const aipFiles = tree.tree.filter((f) => FILENAME_RE.test(f.path));

  const fetchFile = async (file: {path: string}): Promise<AIP | null> => {
    try {
      const m = file.path.match(FILENAME_RE);
      if (!m) return null;
      const filenameNumber = parseInt(m[1], 10);

      const rawRes = await fetch(
        `https://raw.githubusercontent.com/aptos-foundation/AIPs/main/${file.path}`,
        {headers},
      );
      if (!rawRes.ok) return null;
      const content = await rawRes.text();
      const fm = parseFrontmatter(content);

      const frontmatterNumber = fm.aip ? parseInt(fm.aip, 10) : NaN;
      const number = Number.isFinite(frontmatterNumber)
        ? frontmatterNumber
        : filenameNumber;

      return {
        number,
        title: fm.title ?? `AIP-${number}`,
        status: fm.status ?? "Unknown",
        author: fm.author ? cleanAuthors(fm.author) : "",
        githubUrl: `https://github.com/aptos-foundation/AIPs/blob/main/${file.path}`,
      };
    } catch {
      return null;
    }
  };

  // Batch requests to avoid bursting the GitHub rate limit
  const BATCH_SIZE = 20;
  const allResults: (AIP | null)[] = [];
  for (let i = 0; i < aipFiles.length; i += BATCH_SIZE) {
    const batch = aipFiles.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(fetchFile));
    allResults.push(...batchResults);
  }
  const results = allResults;

  return results
    .filter((a): a is AIP => a !== null)
    .sort((a, b) => a.number - b.number);
}

export function useGetAIPs() {
  return useQuery({
    queryKey: ["aips"],
    queryFn: fetchAIPs,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
