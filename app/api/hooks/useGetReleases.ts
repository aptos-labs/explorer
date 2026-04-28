import {useQuery} from "@tanstack/react-query";

export type ReleaseSuccess = {
  status: "success";
  version: string;
  publishedAt: string | null;
  link: string;
};

export type ReleaseError = {
  status: "error";
  message: string;
};

export type ReleaseResult = ReleaseSuccess | ReleaseError;

export type ReleasesData = {
  cli: ReleaseResult;
  node: ReleaseResult;
  typescript: ReleaseResult;
  python: ReleaseResult;
  rust: ReleaseResult;
  go: ReleaseResult;
};

async function fetchNpm(): Promise<ReleaseResult> {
  try {
    const res = await fetch(
      "https://registry.npmjs.org/@aptos-labs/ts-sdk/latest",
    );
    if (!res.ok) throw new Error(`npm returned ${res.status}`);
    const data = (await res.json()) as {version: string};
    return {
      status: "success",
      version: data.version,
      publishedAt: null,
      link: `https://www.npmjs.com/package/@aptos-labs/ts-sdk/v/${data.version}`,
    };
  } catch (e) {
    return {status: "error", message: String(e)};
  }
}

async function fetchPyPI(): Promise<ReleaseResult> {
  try {
    const res = await fetch("https://pypi.org/pypi/aptos-sdk/json");
    if (!res.ok) throw new Error(`PyPI returned ${res.status}`);
    const data = (await res.json()) as {info: {version: string}};
    const {version} = data.info;
    return {
      status: "success",
      version,
      publishedAt: null,
      link: `https://pypi.org/project/aptos-sdk/${version}/`,
    };
  } catch (e) {
    return {status: "error", message: String(e)};
  }
}

async function fetchCratesIo(): Promise<ReleaseResult> {
  try {
    const res = await fetch("https://crates.io/api/v1/crates/aptos-sdk", {
      headers: {
        "User-Agent": "aptos-explorer (https://explorer.aptoslabs.com)",
      },
    });
    if (!res.ok) throw new Error(`crates.io returned ${res.status}`);
    const data = (await res.json()) as {
      crate: {newest_version: string; updated_at: string};
    };
    const version = data.crate.newest_version;
    return {
      status: "success",
      version,
      publishedAt: data.crate.updated_at,
      link: `https://crates.io/crates/aptos-sdk/${version}`,
    };
  } catch (e) {
    return {status: "error", message: String(e)};
  }
}

async function fetchGoProxy(): Promise<ReleaseResult> {
  try {
    const res = await fetch(
      "https://proxy.golang.org/github.com/aptos-labs/aptos-go-sdk/@latest",
    );
    if (!res.ok) throw new Error(`Go proxy returned ${res.status}`);
    const data = (await res.json()) as {Version: string; Time: string};
    return {
      status: "success",
      version: data.Version,
      publishedAt: data.Time,
      link: `https://pkg.go.dev/github.com/aptos-labs/aptos-go-sdk@${data.Version}`,
    };
  } catch (e) {
    return {status: "error", message: String(e)};
  }
}

async function fetchGitHubCoreReleases(): Promise<{
  cli: ReleaseResult;
  node: ReleaseResult;
}> {
  try {
    const githubToken = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };
    if (githubToken) headers["Authorization"] = `Bearer ${githubToken}`;

    const res = await fetch(
      "https://api.github.com/repos/aptos-labs/aptos-core/releases?per_page=50",
      {headers},
    );
    if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
    const releases = (await res.json()) as {
      tag_name: string;
      html_url: string;
      published_at: string;
    }[];

    const cliRelease = releases.find((r) =>
      r.tag_name.startsWith("aptos-cli-v"),
    );
    const nodeRelease = releases.find((r) =>
      r.tag_name.startsWith("aptos-node-v"),
    );

    return {
      cli: cliRelease
        ? {
            status: "success",
            version: cliRelease.tag_name.replace("aptos-cli-", ""),
            publishedAt: cliRelease.published_at,
            link: cliRelease.html_url,
          }
        : {status: "error", message: "No CLI release found in last 50"},
      node: nodeRelease
        ? {
            status: "success",
            version: nodeRelease.tag_name.replace("aptos-node-", ""),
            publishedAt: nodeRelease.published_at,
            link: nodeRelease.html_url,
          }
        : {status: "error", message: "No node release found in last 50"},
    };
  } catch (e) {
    const msg = String(e);
    return {
      cli: {status: "error", message: msg},
      node: {status: "error", message: msg},
    };
  }
}

export async function fetchReleases(): Promise<ReleasesData> {
  const [githubCore, typescript, python, rust, go] = await Promise.all([
    fetchGitHubCoreReleases(),
    fetchNpm(),
    fetchPyPI(),
    fetchCratesIo(),
    fetchGoProxy(),
  ]);

  return {
    cli: githubCore.cli,
    node: githubCore.node,
    typescript,
    python,
    rust,
    go,
  };
}

export function useGetReleases() {
  return useQuery({
    queryKey: ["releases"],
    queryFn: fetchReleases,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
