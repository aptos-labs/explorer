import {describe, expect, it} from "vitest";
import {parseNodeReleaseFromCommitMessage} from "./useGetNodeReleaseFromCommit";

const COMMIT_URL =
  "https://github.com/aptos-labs/aptos-core/commit/9bd3d6d15afcf579d4745b761fe8913026354f9d";

describe("parseNodeReleaseFromCommitMessage", () => {
  it("extracts both the branch and the full version from a release-bump commit", () => {
    // Real mainnet message at the time of writing.
    const msg =
      "[aptos-release-v1.43] Bump version to 1.43.2 (#19365)\n\nCo-authored-by: grao1991 <3603304+grao1991@users.noreply.github.com>";
    expect(parseNodeReleaseFromCommitMessage(msg, COMMIT_URL)).toEqual({
      fullVersion: "1.43.2",
      branchVersion: "1.43",
      commitUrl: COMMIT_URL,
    });
  });

  it("extracts just the branch when the commit is on a release branch but does not bump", () => {
    const msg =
      "[aptos-release-v1.44] Cherry-pick: fix flaky integration test (#19400)";
    expect(parseNodeReleaseFromCommitMessage(msg, COMMIT_URL)).toEqual({
      fullVersion: null,
      branchVersion: "1.44",
      commitUrl: COMMIT_URL,
    });
  });

  it("returns nulls when the commit is on main / feature branch with no release tag", () => {
    const msg = "Add new TPS benchmark (#12345)";
    expect(parseNodeReleaseFromCommitMessage(msg, COMMIT_URL)).toEqual({
      fullVersion: null,
      branchVersion: null,
      commitUrl: COMMIT_URL,
    });
  });

  it("handles release tags with a patch suffix (e.g. v1.43.1) without crashing", () => {
    // Some bump commits include the patch in the branch tag too.
    const msg = "[aptos-release-v1.43.1] Bump version to 1.43.2";
    expect(parseNodeReleaseFromCommitMessage(msg, COMMIT_URL)).toEqual({
      fullVersion: "1.43.2",
      branchVersion: "1.43.1",
      commitUrl: COMMIT_URL,
    });
  });

  it("ignores unrelated 'Bump version' lines without the release tag", () => {
    const msg = "chore(deps): Bump version to 9.9.9 of some-dep (#1)";
    expect(parseNodeReleaseFromCommitMessage(msg, COMMIT_URL)).toEqual({
      // No `[aptos-release-vX.Y]` tag → we refuse to treat the version as a
      // node release. This avoids generic dependency-bump commits showing up
      // as if they were a node release.
      fullVersion: null,
      branchVersion: null,
      commitUrl: COMMIT_URL,
    });
  });
});
