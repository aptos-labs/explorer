import {useQuery} from "@tanstack/react-query";

export type AIP = {
  number: number;
  title: string;
  status: string;
  author: string;
  githubUrl: string;
};

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line
      .slice(colon + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
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
  const tree = (await treeRes.json()) as {tree: {path: string}[]};

  const aipFiles = tree.tree.filter((f) => /^aips\/aip-\d+\.md$/.test(f.path));

  const results = await Promise.all(
    aipFiles.map(async (file): Promise<AIP | null> => {
      try {
        const m = file.path.match(/aip-(\d+)\.md$/);
        if (!m) return null;
        const number = parseInt(m[1], 10);

        const rawRes = await fetch(
          `https://raw.githubusercontent.com/aptos-foundation/AIPs/main/${file.path}`,
          {headers},
        );
        if (!rawRes.ok) return null;
        const content = await rawRes.text();
        const fm = parseFrontmatter(content);

        return {
          number,
          title: fm.title ?? `AIP-${number}`,
          status: fm.status ?? "Unknown",
          author: fm.author ?? "",
          githubUrl: `https://github.com/aptos-foundation/AIPs/blob/main/${file.path}`,
        };
      } catch {
        return null;
      }
    }),
  );

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
