import {useQuery} from "@tanstack/react-query";
import {compareSemverDesc, isStableSemver} from "./semver";

/**
 * Hard cap on how many recent releases we render per registry. We keep the
 * limit modest because the data is only used to populate the drill-in list
 * shown when a user expands a card; rendering hundreds of rows is wasteful and
 * exposes us to churn from very chatty release feeds (npm in particular has
 * hundreds of versions for `@aptos-labs/ts-sdk`).
 */
const RECENT_LIMIT = 25;

export type ReleaseEntry = {
  version: string;
  publishedAt: string | null;
  link: string;
  isPrerelease: boolean;
};

export type ReleaseSuccess = {
  status: "success";
  /**
   * Headline version shown on the card. Resolves to the latest stable SemVer
   * release where one is available within `recent`, falling back to the most
   * recent release otherwise (in which case `isStable` is false).
   */
  version: string;
  publishedAt: string | null;
  link: string;
  /** True when the headline `version` is a stable SemVer release. */
  isStable: boolean;
  /** Recent releases (newest first), capped at `RECENT_LIMIT`. */
  recent: ReleaseEntry[];
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

/**
 * Pick the latest stable release from a sorted-by-date list. Falls back to
 * the first entry when no stable exists, so the card always renders something
 * the user can act on.
 */
function pickHeadline(recent: ReleaseEntry[]): {
  entry: ReleaseEntry;
  isStable: boolean;
} | null {
  if (recent.length === 0) return null;
  const stable = recent.find((r) => !r.isPrerelease);
  if (stable) return {entry: stable, isStable: true};
  return {entry: recent[0], isStable: false};
}

async function fetchNpm(): Promise<ReleaseResult> {
  try {
    // We deliberately hit the *full* registry document rather than the
    // abbreviated `application/vnd.npm.install-v1+json` variant: the
    // abbreviated response **does not include the `time` field**, which is
    // exactly what we need to render publish dates older than React Query's
    // cache window. Without `time` we'd lose the relative-date column on
    // every drill-in row — the regression we recently fixed.
    //
    // The full doc can be large (`@aptos-labs/ts-sdk` has hundreds of
    // versions), but it's gzipped on the wire, served from npm's CDN, and
    // fetched at most once per `staleTime` window. We only read the fields
    // we need (`time` and `versions` keys) and discard the rest.
    const res = await fetch("https://registry.npmjs.org/@aptos-labs/ts-sdk");
    if (!res.ok) throw new Error(`npm returned ${res.status}`);
    const data = (await res.json()) as {
      "dist-tags"?: {latest?: string};
      time?: Record<string, string>;
      versions?: Record<string, unknown>;
    };
    const versionsMap = data.versions ?? {};
    const versionList = Object.keys(versionsMap);
    if (versionList.length === 0) {
      throw new Error("npm response had no versions");
    }
    const recent: ReleaseEntry[] = versionList
      .map((version) => {
        const publishedAt = data.time?.[version] ?? null;
        return {
          version,
          publishedAt,
          link: `https://www.npmjs.com/package/@aptos-labs/ts-sdk/v/${version}`,
          isPrerelease: !isStableSemver(version),
        };
      })
      .sort((a, b) => {
        // Prefer publish date for ordering when both have one (matches what
        // users see on npmjs.com); fall back to SemVer comparison otherwise.
        if (a.publishedAt && b.publishedAt) {
          return b.publishedAt.localeCompare(a.publishedAt);
        }
        return compareSemverDesc(a.version, b.version);
      })
      .slice(0, RECENT_LIMIT);
    const headline = pickHeadline(recent);
    if (!headline) throw new Error("npm returned no usable versions");
    return {
      status: "success",
      version: headline.entry.version,
      publishedAt: headline.entry.publishedAt,
      link: headline.entry.link,
      isStable: headline.isStable,
      recent,
    };
  } catch (e) {
    return {status: "error", message: String(e)};
  }
}

async function fetchPyPI(): Promise<ReleaseResult> {
  try {
    const res = await fetch("https://pypi.org/pypi/aptos-sdk/json");
    if (!res.ok) throw new Error(`PyPI returned ${res.status}`);
    const data = (await res.json()) as {
      info: {version: string};
      releases?: Record<
        string,
        Array<{upload_time_iso_8601?: string; yanked?: boolean}> | undefined
      >;
    };
    const releasesMap = data.releases ?? {};
    const recent: ReleaseEntry[] = Object.entries(releasesMap)
      // Skip versions with no uploaded files (entry === []), and versions
      // where every file was yanked.
      .filter(
        ([, files]) =>
          Array.isArray(files) &&
          files.length > 0 &&
          !files.every((f) => f.yanked === true),
      )
      .map(([version, files]) => ({
        version,
        publishedAt: files?.[0]?.upload_time_iso_8601 ?? null,
        link: `https://pypi.org/project/aptos-sdk/${version}/`,
        isPrerelease: !isStableSemver(version),
      }))
      .sort((a, b) => {
        if (a.publishedAt && b.publishedAt) {
          return b.publishedAt.localeCompare(a.publishedAt);
        }
        return compareSemverDesc(a.version, b.version);
      })
      .slice(0, RECENT_LIMIT);
    const headline = pickHeadline(recent);
    if (!headline) {
      // Fall back to PyPI's own `info.version` if our enumeration came up
      // empty (e.g. project metadata only); this matches the previous behavior.
      const {version} = data.info;
      return {
        status: "success",
        version,
        publishedAt: null,
        link: `https://pypi.org/project/aptos-sdk/${version}/`,
        isStable: isStableSemver(version),
        recent: [],
      };
    }
    return {
      status: "success",
      version: headline.entry.version,
      publishedAt: headline.entry.publishedAt,
      link: headline.entry.link,
      isStable: headline.isStable,
      recent,
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
      versions?: Array<{
        num: string;
        created_at: string;
        yanked?: boolean;
      }>;
    };
    const recent: ReleaseEntry[] = (data.versions ?? [])
      .filter((v) => v.yanked !== true)
      .map((v) => ({
        version: v.num,
        publishedAt: v.created_at,
        link: `https://crates.io/crates/aptos-sdk/${v.num}`,
        isPrerelease: !isStableSemver(v.num),
      }))
      .sort((a, b) => {
        if (a.publishedAt && b.publishedAt) {
          return b.publishedAt.localeCompare(a.publishedAt);
        }
        return compareSemverDesc(a.version, b.version);
      })
      .slice(0, RECENT_LIMIT);
    const headline = pickHeadline(recent);
    if (!headline) {
      // crates.io always ships a `versions` array on this endpoint, but if it
      // were ever empty fall back to `crate.newest_version` so the card still
      // shows a number rather than an error.
      const version = data.crate.newest_version;
      return {
        status: "success",
        version,
        publishedAt: data.crate.updated_at,
        link: `https://crates.io/crates/aptos-sdk/${version}`,
        isStable: isStableSemver(version),
        recent: [],
      };
    }
    return {
      status: "success",
      version: headline.entry.version,
      publishedAt: headline.entry.publishedAt,
      link: headline.entry.link,
      isStable: headline.isStable,
      recent,
    };
  } catch (e) {
    return {status: "error", message: String(e)};
  }
}

async function fetchGoProxy(): Promise<ReleaseResult> {
  try {
    // The Go module proxy `@latest` endpoint only returns the single most
    // recent version — there is no documented "list" endpoint we can rely on
    // without scraping pkg.go.dev. We surface that one entry both as the
    // headline and as the only `recent` item; the drill-in list is therefore
    // intentionally short for Go.
    const res = await fetch(
      "https://proxy.golang.org/github.com/aptos-labs/aptos-go-sdk/@latest",
    );
    if (!res.ok) throw new Error(`Go proxy returned ${res.status}`);
    const data = (await res.json()) as {Version: string; Time: string};
    const entry: ReleaseEntry = {
      version: data.Version,
      publishedAt: data.Time,
      link: `https://pkg.go.dev/github.com/aptos-labs/aptos-go-sdk@${data.Version}`,
      isPrerelease: !isStableSemver(data.Version),
    };
    return {
      status: "success",
      version: entry.version,
      publishedAt: entry.publishedAt,
      link: entry.link,
      isStable: !entry.isPrerelease,
      recent: [entry],
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
    if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

    const res = await fetch(
      "https://api.github.com/repos/aptos-labs/aptos-core/releases?per_page=100",
      {headers},
    );
    if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
    const releases = (await res.json()) as Array<{
      tag_name: string;
      html_url: string;
      published_at: string;
      prerelease?: boolean;
      draft?: boolean;
    }>;

    const buildSubset = (tagPrefix: string, label: string): ReleaseResult => {
      const recent: ReleaseEntry[] = releases
        .filter((r) => !r.draft && r.tag_name.startsWith(tagPrefix))
        .map((r) => {
          const version = r.tag_name.slice(tagPrefix.length - 1); // keep the leading "v"
          // GitHub's `prerelease` flag is operator-controlled; combine with a
          // SemVer pre-release suffix check so we treat both as not stable.
          const isPrerelease =
            r.prerelease === true || !isStableSemver(version);
          return {
            version,
            publishedAt: r.published_at,
            link: r.html_url,
            isPrerelease,
          };
        })
        .sort((a, b) => {
          if (a.publishedAt && b.publishedAt) {
            return b.publishedAt.localeCompare(a.publishedAt);
          }
          return compareSemverDesc(a.version, b.version);
        })
        .slice(0, RECENT_LIMIT);
      const headline = pickHeadline(recent);
      if (!headline) {
        return {
          status: "error",
          message: `No ${label} release found in last 100`,
        };
      }
      return {
        status: "success",
        version: headline.entry.version,
        publishedAt: headline.entry.publishedAt,
        link: headline.entry.link,
        isStable: headline.isStable,
        recent,
      };
    };

    return {
      cli: buildSubset("aptos-cli-v", "CLI"),
      node: buildSubset("aptos-node-v", "node"),
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
