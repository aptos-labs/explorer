import {useQuery} from "@tanstack/react-query";

/**
 * Aptos node release version resolved from a commit hash on
 * `aptos-labs/aptos-core`.
 *
 * The fullnode `GET /v1/` endpoint exposes the running binary's `git_hash`,
 * which is just a sha — operators usually want to know "what release is that?".
 *
 * Aptos cuts node releases on `aptos-release-vX.Y` branches; the bot that
 * lands a release-bump commit always uses a message of the form
 *
 *   `[aptos-release-v1.43] Bump version to 1.43.2 (#19365)`
 *
 * (and even non-bump commits on the branch keep the `[aptos-release-vX.Y]`
 * prefix). That makes the message itself the cheapest reliable way to map
 * a hash back to a release without walking N tag SHAs.
 */
export type NodeRelease = {
  /**
   * Full SemVer of the node binary (e.g. `"1.43.2"`) when we could parse a
   * `Bump version to X.Y.Z` line from the commit message. `null` when the
   * commit is on a release branch but doesn't itself bump the patch.
   */
  fullVersion: string | null;
  /**
   * Minor release branch in `X.Y` form (e.g. `"1.43"`). `null` when the
   * commit is not on a release branch (typically a `main` or feature
   * build). Always exactly two numeric components — never a patched
   * `X.Y.Z` — because Aptos cuts release branches per minor and the
   * matching GitHub branch URL is `aptos-release-vX.Y`. The parser
   * deliberately ignores commits with a malformed three-component tag
   * so callers don't end up rendering `v1.43.1.x` or linking to a
   * non-existent `aptos-release-v1.43.1` branch.
   */
  branchVersion: string | null;
  /** GitHub URL pointing at the commit, for click-through verification. */
  commitUrl: string;
};

// Strict `vX.Y` — Aptos never cuts patched release branches (the patch
// number lives in the `Bump version to X.Y.Z` line below). A loose match
// like `\d+\.\d+(?:\.\d+)?` would let a malformed `[aptos-release-v1.43.1]`
// flow through as `branchVersion = "1.43.1"`, which would then render
// `v1.43.1.x` and link to a non-existent branch.
const RELEASE_BRANCH_RE = /\[aptos-release-v(\d+\.\d+)\]/;
const BUMP_VERSION_RE = /Bump version to (\d+\.\d+\.\d+)/;

/**
 * Parse the GitHub commit `message` field for the release branch tag and the
 * `Bump version to` line. Exported for tests; the hook below uses it.
 */
export function parseNodeReleaseFromCommitMessage(
  message: string,
  commitUrl: string,
): NodeRelease {
  const branchMatch = message.match(RELEASE_BRANCH_RE);
  // Only trust a `Bump version to X.Y.Z` line when we also see a release
  // branch tag in the same message — generic dependency bumps (e.g.
  // `Bump version to 9.9.9 of some-dep`) should not masquerade as a node
  // release.
  const bumpMatch = branchMatch ? message.match(BUMP_VERSION_RE) : null;
  return {
    fullVersion: bumpMatch ? bumpMatch[1] : null,
    branchVersion: branchMatch ? branchMatch[1] : null,
    commitUrl,
  };
}

async function fetchNodeRelease(gitHash: string): Promise<NodeRelease> {
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

  const url = `https://api.github.com/repos/aptos-labs/aptos-core/commits/${gitHash}`;
  const res = await fetch(url, {headers});
  if (!res.ok) {
    throw new Error(`GitHub returned ${res.status} for commit ${gitHash}`);
  }
  const data = (await res.json()) as {
    commit: {message: string};
    html_url: string;
  };
  return parseNodeReleaseFromCommitMessage(data.commit.message, data.html_url);
}

/**
 * Resolve a fullnode `git_hash` into the matching `aptos-node` release
 * version. Returns `null` while the hash is unknown so callers can choose
 * to skip the row instead of rendering an empty value.
 */
export function useGetNodeReleaseFromCommit(gitHash: string | null) {
  return useQuery({
    queryKey: ["deployments", "nodeRelease", gitHash],
    queryFn: () => {
      if (!gitHash) {
        // Should never run because of `enabled` below, but keeps the type
        // narrow for `queryFn`'s return.
        throw new Error("gitHash is required");
      }
      return fetchNodeRelease(gitHash);
    },
    enabled: !!gitHash,
    // Commit -> release mapping never changes for a given sha, so cache hard.
    staleTime: 60 * 60_000,
    gcTime: 24 * 60 * 60_000,
    retry: 1,
  });
}
