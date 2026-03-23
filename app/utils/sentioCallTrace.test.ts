import {describe, expect, it} from "vitest";
import type {SentioCallTraceNode} from "./sentioCallTrace";
import {
  buildAccountModuleCodePath,
  buildAccountModuleRunPath,
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
  it("returns false for a node without pcError", () => {
    expect(isNodeFailed(makeNode())).toBe(false);
  });

  it("returns false for a node with empty pcError", () => {
    expect(isNodeFailed(makeNode({pcError: ""}))).toBe(false);
  });

  it("returns true for a node with pcError", () => {
    expect(isNodeFailed(makeNode({pcError: "ABORTED (code 0x1)"}))).toBe(true);
  });
});

describe("subtreeHasFailure", () => {
  it("returns false when no node has pcError", () => {
    const root = makeNode({calls: [makeNode(), makeNode()]});
    expect(subtreeHasFailure(root)).toBe(false);
  });

  it("returns true when root itself has pcError", () => {
    const root = makeNode({pcError: "error"});
    expect(subtreeHasFailure(root)).toBe(true);
  });

  it("returns true when a deeply nested child has pcError", () => {
    const root = makeNode({
      calls: [
        makeNode({
          calls: [makeNode({pcError: "ABORTED"})],
        }),
      ],
    });
    expect(subtreeHasFailure(root)).toBe(true);
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

  it("accepts a node with pcError field", () => {
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
        pcError: "ABORTED (code 0x1)",
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
