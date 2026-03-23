import {describe, expect, it} from "vitest";
import type {SentioCallTraceNode} from "./sentioCallTrace";
import {
  buildAccountModuleCodePath,
  buildAccountModuleRunPath,
  buildFailureMap,
  formatTraceError,
  getSentioCallTraceNetworkId,
  getSentioTransactionTraceViewerUrl,
  isNodeFailed,
  isSentioCallTraceError,
  isSentioCallTraceNode,
  normalizeSentioAddress,
  parseMoveFunctionParts,
  subtreeHasFailure,
} from "./sentioCallTrace";

describe("getSentioCallTraceNetworkId", () => {
  it("returns 1 for mainnet", () => {
    expect(getSentioCallTraceNetworkId("mainnet")).toBe(1);
  });

  it("returns undefined for non-mainnet networks", () => {
    expect(getSentioCallTraceNetworkId("testnet")).toBeUndefined();
    expect(getSentioCallTraceNetworkId("devnet")).toBeUndefined();
  });
});

describe("getSentioTransactionTraceViewerUrl", () => {
  it("builds mainnet viewer URL with 0x hash", () => {
    expect(getSentioTransactionTraceViewerUrl("mainnet", "0xabc")).toBe(
      "https://app.sentio.xyz/tx/aptos_mainnet/0xabc",
    );
  });

  it("prefixes hash when missing 0x", () => {
    expect(getSentioTransactionTraceViewerUrl("mainnet", "abc")).toBe(
      "https://app.sentio.xyz/tx/aptos_mainnet/0xabc",
    );
  });

  it("returns null outside mainnet", () => {
    expect(getSentioTransactionTraceViewerUrl("testnet", "0xabc")).toBeNull();
  });
});

describe("parseMoveFunctionParts", () => {
  it("parses module::function", () => {
    expect(parseMoveFunctionParts("coin::transfer")).toEqual({
      module: "coin",
      fn: "transfer",
    });
  });

  it("returns null when there is no module separator", () => {
    expect(parseMoveFunctionParts("transfer")).toBeNull();
  });
});

describe("buildAccountModuleRunPath", () => {
  it("builds run tab path with encoded segments", () => {
    expect(buildAccountModuleRunPath("0x1", "coin", "transfer")).toBe(
      "/account/0x1/modules/run/coin/transfer",
    );
  });
});

describe("buildAccountModuleCodePath", () => {
  it("builds code tab path", () => {
    expect(buildAccountModuleCodePath("0x1", "coin")).toBe(
      "/account/0x1/modules/code/coin",
    );
  });
});

describe("normalizeSentioAddress", () => {
  it("adds 0x and standardizes short addresses", () => {
    expect(normalizeSentioAddress("1")).toBe(
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    );
  });
});

const SAMPLE_ERROR = {
  major_status: 4016,
  sub_status: 4,
  message: null,
  location: null,
};

function makeNode(
  overrides?: Partial<SentioCallTraceNode>,
): SentioCallTraceNode {
  return {
    from: "0x1",
    to: "0x1",
    contractName: "c",
    functionName: "m::f",
    inputs: [],
    returnValue: [],
    typeArgs: [],
    calls: [],
    gasUsed: 0,
    ...overrides,
  };
}

describe("isSentioCallTraceError", () => {
  it("accepts a valid error object", () => {
    expect(isSentioCallTraceError(SAMPLE_ERROR)).toBe(true);
  });

  it("rejects null", () => {
    expect(isSentioCallTraceError(null)).toBe(false);
  });

  it("rejects an empty object (missing major_status)", () => {
    expect(isSentioCallTraceError({})).toBe(false);
  });

  it("rejects an array", () => {
    expect(isSentioCallTraceError([])).toBe(false);
  });

  it("rejects string", () => {
    expect(isSentioCallTraceError("error")).toBe(false);
  });
});

describe("isNodeFailed", () => {
  it("returns false for a node without error", () => {
    expect(isNodeFailed(makeNode())).toBe(false);
  });

  it("returns true for a node with valid error object", () => {
    expect(isNodeFailed(makeNode({error: SAMPLE_ERROR}))).toBe(true);
  });

  it("returns false for a node with malformed error (missing major_status)", () => {
    const node = makeNode();
    (node as Record<string, unknown>).error = {};
    expect(isNodeFailed(node)).toBe(false);
  });
});

describe("subtreeHasFailure", () => {
  it("returns false when no node has error", () => {
    const root = makeNode({calls: [makeNode(), makeNode()]});
    expect(subtreeHasFailure(root)).toBe(false);
  });

  it("returns true when root itself has error", () => {
    const root = makeNode({error: SAMPLE_ERROR});
    expect(subtreeHasFailure(root)).toBe(true);
  });

  it("returns true when a deeply nested child has error", () => {
    const root = makeNode({
      calls: [
        makeNode({
          calls: [makeNode({error: SAMPLE_ERROR})],
        }),
      ],
    });
    expect(subtreeHasFailure(root)).toBe(true);
  });
});

describe("buildFailureMap", () => {
  it("marks all nodes false when no failures exist", () => {
    const child = makeNode();
    const root = makeNode({calls: [child]});
    const map = buildFailureMap(root);
    expect(map.get(root)).toBe(false);
    expect(map.get(child)).toBe(false);
  });

  it("marks the failed node and ancestors as true", () => {
    const leaf = makeNode({error: SAMPLE_ERROR});
    const mid = makeNode({calls: [leaf]});
    const root = makeNode({calls: [mid]});
    const map = buildFailureMap(root);
    expect(map.get(root)).toBe(true);
    expect(map.get(mid)).toBe(true);
    expect(map.get(leaf)).toBe(true);
  });

  it("marks only the branch with the failure", () => {
    const failLeaf = makeNode({error: SAMPLE_ERROR});
    const okLeaf = makeNode();
    const root = makeNode({calls: [failLeaf, okLeaf]});
    const map = buildFailureMap(root);
    expect(map.get(root)).toBe(true);
    expect(map.get(failLeaf)).toBe(true);
    expect(map.get(okLeaf)).toBe(false);
  });
});

describe("formatTraceError", () => {
  it("formats error with major and sub status", () => {
    expect(formatTraceError(SAMPLE_ERROR)).toBe("status 4016 \u2013 sub 4");
  });

  it("includes message when present", () => {
    expect(formatTraceError({...SAMPLE_ERROR, message: "abort reason"})).toBe(
      "status 4016 \u2013 sub 4 \u2013 abort reason",
    );
  });

  it("includes location when present", () => {
    expect(formatTraceError({...SAMPLE_ERROR, location: "0x1::module"})).toBe(
      "status 4016 \u2013 sub 4 \u2013 at 0x1::module",
    );
  });

  it("omits sub_status when null", () => {
    expect(formatTraceError({...SAMPLE_ERROR, sub_status: null})).toBe(
      "status 4016",
    );
  });
});

describe("isSentioCallTraceNode", () => {
  it("accepts a minimal valid node", () => {
    expect(
      isSentioCallTraceNode({
        from: "0x1",
        to: "0x1",
        contractName: "c",
        functionName: "m::f",
        inputs: [],
        returnValue: [],
        typeArgs: [],
        calls: [],
        gasUsed: 0,
      }),
    ).toBe(true);
  });

  it("rejects non-objects", () => {
    expect(isSentioCallTraceNode(null)).toBe(false);
    expect(isSentioCallTraceNode("x")).toBe(false);
  });

  it("accepts a node with error field", () => {
    expect(
      isSentioCallTraceNode({
        from: "0x1",
        to: "0x1",
        contractName: "c",
        functionName: "m::f",
        inputs: [],
        returnValue: [],
        typeArgs: [],
        calls: [],
        gasUsed: 0,
        error: SAMPLE_ERROR,
      }),
    ).toBe(true);
  });

  it("rejects a node with an invalid child call", () => {
    expect(
      isSentioCallTraceNode({
        from: "0x1",
        to: "0x1",
        contractName: "c",
        functionName: "m::f",
        inputs: [],
        returnValue: [],
        typeArgs: [],
        calls: [{}],
        gasUsed: 0,
      }),
    ).toBe(false);
  });
});
