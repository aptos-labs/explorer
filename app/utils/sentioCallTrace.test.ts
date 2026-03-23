import {describe, expect, it} from "vitest";
import type {SentioCallTraceNode} from "./sentioCallTrace";
import {
  buildAccountModuleCodePath,
  buildAccountModuleRunPath,
  formatTraceError,
  getSentioCallTraceNetworkId,
  getSentioTransactionTraceViewerUrl,
  isNodeFailed,
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

describe("isNodeFailed", () => {
  it("returns false for a node without error", () => {
    expect(isNodeFailed(makeNode())).toBe(false);
  });

  it("returns true for a node with error object", () => {
    expect(isNodeFailed(makeNode({error: SAMPLE_ERROR}))).toBe(true);
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
