// Covers FEAT-ACCOUNT-003 — Defunct protocol registry
import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";
import {
  MIN_OWNER_WITHDRAWAL_PERCENT,
  type DefunctProtocolStatus,
} from "../types/defunctProtocol";
import {mainnetKnownAddresses} from "./mainnet/knownAddresses";
import {tryStandardizeAddress} from "../utils";
import {
  defunctProtocols,
  getDefunctProtocol,
  getWithdrawalPlugin,
  withdrawalPlugins,
} from "./defunctProtocols";

const _dirname = dirname(fileURLToPath(import.meta.url));

/** Status comments on known-address labels that must have a registry entry. */
const STATUS_COMMENT_RE =
  /"(0x[0-9a-fA-F]+)":\s*(?:\r?\n\s*)?"[^"]+",?\s*\/\/\s*(defunct|winding_down|deprecated)/g;

function labeledProtocolStatuses(source: string): {
  address: string;
  status: DefunctProtocolStatus;
}[] {
  return [...source.matchAll(STATUS_COMMENT_RE)].flatMap((match) => {
    const address = tryStandardizeAddress(match[1]);
    if (!address) return [];
    return [{address, status: match[2] as DefunctProtocolStatus}];
  });
}

function knownNameFor(address: string): string | undefined {
  const standardized = tryStandardizeAddress(address);
  if (!standardized) return undefined;
  for (const [key, name] of Object.entries(mainnetKnownAddresses)) {
    if (tryStandardizeAddress(key) === standardized) return name;
  }
  return undefined;
}

describe("defunctProtocols registry", () => {
  it("should have at least one defunct protocol", () => {
    expect(defunctProtocols.length).toBeGreaterThan(0);
  });

  it("every protocol should have required fields", () => {
    for (const p of defunctProtocols) {
      expect(p.address).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.status).toBeTruthy();
      expect(p.description).toBeTruthy();
    }
  });

  it("should have unique addresses after standardization", () => {
    const addresses = defunctProtocols.map((p) =>
      tryStandardizeAddress(p.address),
    );
    expect(addresses.every(Boolean)).toBe(true);
    expect(new Set(addresses).size).toBe(addresses.length);
  });

  it("every withdrawal plugin should satisfy the 90% owner requirement", () => {
    for (const [addr, plugin] of withdrawalPlugins) {
      expect(plugin.ownerPercentage).toBeGreaterThanOrEqual(
        MIN_OWNER_WITHDRAWAL_PERCENT,
      );
      expect(plugin.protocolAddress.toLowerCase()).toBe(addr);
    }
  });

  it("withdrawal plugin keys should be standardized 64-char addresses", () => {
    for (const [key] of withdrawalPlugins) {
      expect(key).toBe(tryStandardizeAddress(key));
    }
  });

  it("keeps Obric listed even after it was removed from known-address labels", () => {
    const obric = getDefunctProtocol(
      "0xc7ea756470f72ae761b7986e4ed6fd409aad183b1b2d3d2f674d979852f45c4b",
    );
    expect(obric?.name).toBe("Obric");
    expect(
      mainnetKnownAddresses[
        "0xc7ea756470f72ae761b7986e4ed6fd409aad183b1b2d3d2f674d979852f45c4b"
      ],
    ).toBeUndefined();
  });
});

describe("FEAT-ACCOUNT-003 — known-address status comments match the registry", () => {
  const source = readFileSync(
    join(_dirname, "mainnet", "knownAddresses.ts"),
    "utf8",
  );
  const labeled = labeledProtocolStatuses(source);

  it("parses at least the originally commented DEX labels", () => {
    const names = labeled
      .map(({address}) => knownNameFor(address))
      .filter(Boolean);
    expect(names).toEqual(
      expect.arrayContaining([
        "SushiSwap",
        "AptoSwap",
        "AuxExchange",
        "Econia Labs",
        "Cetus 1",
        "Cetus 2",
        "AnimeSwap",
      ]),
    );
  });

  it("every // defunct, // winding_down, or // deprecated label is in defunctProtocols", () => {
    expect(labeled.length).toBeGreaterThan(0);
    for (const {address, status} of labeled) {
      const protocol = getDefunctProtocol(address);
      expect(
        protocol,
        `${address} (${knownNameFor(address) ?? "unlabeled"}) is commented ${status} but missing from defunctProtocols`,
      ).toBeDefined();
      expect(protocol?.status).toBe(status);
      const knownName = knownNameFor(address);
      if (knownName) {
        expect(protocol?.name).toBe(knownName);
      }
    }
  });

  it("registry entries that still have a known-address label carry a matching status comment", () => {
    const byAddress = new Map(
      labeled.map((entry) => [entry.address, entry.status]),
    );
    for (const protocol of defunctProtocols) {
      const knownName = knownNameFor(protocol.address);
      if (!knownName) continue;
      expect(
        byAddress.get(tryStandardizeAddress(protocol.address) ?? ""),
        `${protocol.name} (${protocol.address}) is in defunctProtocols and knownAddresses but has no // ${protocol.status} comment`,
      ).toBe(protocol.status);
    }
  });
});

describe("getDefunctProtocol", () => {
  it("should find SushiSwap by address", () => {
    const result = getDefunctProtocol(
      "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c",
    );
    expect(result).toBeDefined();
    expect(result?.name).toBe("SushiSwap");
  });

  it("finds newly listed defunct labels", () => {
    expect(
      getDefunctProtocol(
        "0xc0deb00c405f84c85dc13442e305df75d1288100cdd82675695f6148c7ece51c",
      )?.name,
    ).toBe("Econia Labs");
    expect(
      getDefunctProtocol(
        "0x487e905f899ccb6d46fdaec56ba1e0c4cf119862a16c409904b8c78fab1f5e8a",
      )?.name,
    ).toBe("Tapp Exchange");
    expect(
      getDefunctProtocol(
        "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06",
      )?.name,
    ).toBe("Merkle Trade");
    expect(
      getDefunctProtocol(
        "0xb7d960e5f0a58cc0817774e611d7e3ae54c6843816521f02d7ced583d6434896",
      )?.name,
    ).toBe("Aptin Finance v1");
    expect(
      getDefunctProtocol(
        "0x2c7bccf7b31baf770fdbcc768d9e9cb3d87805e255355df5db32ac9a669010a2",
      )?.name,
    ).toBe("Topaz Marketplace");
    expect(
      getDefunctProtocol(
        "0xface729284ae5729100b3a9ad7f7cc025ea09739cd6e7252aff0beb53619cafe",
      )?.name,
    ).toBe("Emojicoin.fun");
    expect(
      getDefunctProtocol(
        "0x4b947ed016c64bde81972d69ea7d356de670d57fd2608b129f4d94ac0d0ee61",
      )?.name,
    ).toBe("Emojicoin.fun Registry");
    expect(
      getDefunctProtocol(
        "0x04b947ed016c64bde81972d69ea7d356de670d57fd2608b129f4d94ac0d0ee61",
      )?.name,
    ).toBe("Emojicoin.fun Registry");
    expect(
      getDefunctProtocol(
        "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3",
      )?.name,
    ).toBe("Aries Markets");
    expect(
      getDefunctProtocol(
        "0x2cc52445acc4c5e5817a0ac475976fbef966fedb6e30e7db792e10619c76181f",
      )?.name,
    ).toBe("Kofi");
    expect(
      getDefunctProtocol(
        "0x68476f9d437e3f32fd262ba898b5e3ee0a23a1d586a6cf29a28add35f253f6f7",
      )?.name,
    ).toBe("Meso Finance");
    expect(
      getDefunctProtocol(
        "0x890812a6bbe27dd59188ade3bbdbe40a544e6e104319b7ebc6617d3eb947ac07",
      )?.name,
    ).toBe("Hippo Aggregator");
    expect(
      getDefunctProtocol(
        "0xd1fd99c1944b84d1670a2536417e997864ad12303d19eac725891691b04d614e",
      )?.name,
    ).toBe("Bluemove Marketplace");
    expect(
      getDefunctProtocol(
        "0xcd7b88c2181881bf8e7ef741cae867aee038e75df94224496a4a81627edf7f65",
      )?.name,
    ).toBe("Defy");
    expect(
      getDefunctProtocol(
        "0x17f1e926a81639e9557f4e4934df93452945ec30bc962e11351db59eb0d78c33",
      )?.name,
    ).toBe("VibrantX");
  });

  it("finds Aave Aptos as winding_down", () => {
    const pool = getDefunctProtocol(
      "0x39ddcd9e1a39fa14f25e3f9ec8a86074d05cc0881cbf667df8a6ee70942016fb",
    );
    expect(pool?.name).toBe("Aave Pool");
    expect(pool?.status).toBe("winding_down");
  });

  it("should be case-insensitive", () => {
    const result = getDefunctProtocol(
      "0x31A6675CBE84365BF2B0CBCE617ECE6C47023EF70826533BDE5203D32171DC3C",
    );
    expect(result).toBeDefined();
    expect(result?.name).toBe("SushiSwap");
  });

  it("should return undefined for unknown address", () => {
    expect(getDefunctProtocol("0xdeadbeef")).toBeUndefined();
  });
});

describe("getWithdrawalPlugin", () => {
  it("should return undefined for protocols without plugins", () => {
    expect(
      getWithdrawalPlugin(
        "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c",
      ),
    ).toBeUndefined();
  });
});
