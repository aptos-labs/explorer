import {describe, expect, it} from "vitest";
// Covers FEAT-ACCOUNT-010 — Info Tab key type identification
import {
  extractAccountKeyTypeFromSignature,
  humanizeInnerKeyType,
  unwrapSenderAuthenticator,
} from "./accountKeyType";

const ed25519Account = {
  type: "ed25519_signature",
  public_key:
    "0x8d2a6dc60eaeacf89cba9e53db787d77165c63be218175c24009252eaf57c513",
  signature:
    "0x19ad346523d83bd0626aaf8e6910c4ec1f54f124eb6fefc2fdd004619e54a281ca4ae756675d331458bd968a1cf7a42263fc6fe1aebe0cd91d041bd291355503",
};

describe("humanizeInnerKeyType", () => {
  it("maps known scheme strings to friendly labels", () => {
    expect(humanizeInnerKeyType("ed25519")).toBe("Ed25519");
    expect(humanizeInnerKeyType("secp256k1_ecdsa")).toBe("Secp256k1 ECDSA");
    expect(humanizeInnerKeyType("secp256r1_ecdsa")).toBe("Secp256r1 ECDSA");
    expect(humanizeInnerKeyType("keyless")).toBe("Keyless");
    expect(humanizeInnerKeyType("federated_keyless")).toBe("Federated Keyless");
  });

  it("falls back to a humanized version of unknown types", () => {
    expect(humanizeInnerKeyType("some_future_scheme")).toBe(
      "some future scheme",
    );
  });
});

describe("unwrapSenderAuthenticator", () => {
  it("returns the inner sender authenticator for multi_agent_signature", () => {
    const sig = {
      type: "multi_agent_signature",
      sender: ed25519Account,
      secondary_signer_addresses: [],
      secondary_signers: [],
    };
    expect(unwrapSenderAuthenticator(sig)).toEqual(ed25519Account);
  });

  it("returns the inner sender authenticator for fee_payer_signature", () => {
    const sig = {
      type: "fee_payer_signature",
      fee_payer_address: "0xabc",
      sender: ed25519Account,
      secondary_signer_addresses: [],
      secondary_signers: [],
      fee_payer_signer: ed25519Account,
    };
    expect(unwrapSenderAuthenticator(sig)).toEqual(ed25519Account);
  });

  it("returns the input untouched for top-level authenticators", () => {
    expect(unwrapSenderAuthenticator(ed25519Account)).toEqual(ed25519Account);
  });

  it("returns the input untouched when not an object", () => {
    expect(unwrapSenderAuthenticator(undefined)).toBeUndefined();
    expect(unwrapSenderAuthenticator(null)).toBeNull();
  });
});

describe("extractAccountKeyTypeFromSignature", () => {
  it("classifies legacy ed25519_signature", () => {
    expect(extractAccountKeyTypeFromSignature(ed25519Account)).toEqual({
      scheme: "Ed25519",
      rawType: "ed25519_signature",
    });
  });

  it("classifies legacy multi_ed25519_signature with threshold and key count", () => {
    const sig = {
      type: "multi_ed25519_signature",
      public_keys: ["0xaa", "0xbb", "0xcc"],
      signatures: ["0x11", "0x22"],
      threshold: 2,
      bitmap: "0x03",
    };
    expect(extractAccountKeyTypeFromSignature(sig)).toEqual({
      scheme: "Multi-Ed25519",
      rawType: "multi_ed25519_signature",
      subKeys: [
        {type: "ed25519", display: "Ed25519"},
        {type: "ed25519", display: "Ed25519"},
        {type: "ed25519", display: "Ed25519"},
      ],
      signaturesRequired: 2,
      totalKeys: 3,
    });
  });

  it("classifies single_sender SingleKey variants by inner public_key type", () => {
    const sig = {
      type: "single_sender",
      public_key: {
        type: "secp256k1_ecdsa",
        value: "0x049b...",
      },
      signature: {
        type: "secp256k1_ecdsa",
        value: "0x357a...",
      },
    };
    expect(extractAccountKeyTypeFromSignature(sig)).toEqual({
      scheme: "Single Key",
      innerType: "Secp256k1 ECDSA",
      rawType: "single_sender",
      subKeys: [{type: "secp256k1_ecdsa", display: "Secp256k1 ECDSA"}],
      totalKeys: 1,
    });
  });

  it("classifies single_sender Ed25519 SingleKey", () => {
    const sig = {
      type: "single_sender",
      public_key: {type: "ed25519", value: "0xaa"},
      signature: {type: "ed25519", value: "0xbb"},
    };
    const result = extractAccountKeyTypeFromSignature(sig);
    expect(result?.scheme).toBe("Single Key");
    expect(result?.innerType).toBe("Ed25519");
  });

  it("classifies single_sender MultiKey with mixed sub-key types", () => {
    const sig = {
      type: "single_sender",
      public_keys: [
        {type: "ed25519", value: "0xaa"},
        {type: "secp256k1_ecdsa", value: "0xbb"},
        {type: "keyless", value: "0xcc"},
      ],
      signatures: [
        {index: 0, signature: {type: "ed25519", value: "0x11"}},
        {index: 1, signature: {type: "secp256k1_ecdsa", value: "0x22"}},
      ],
      signatures_required: 2,
    };
    expect(extractAccountKeyTypeFromSignature(sig)).toEqual({
      scheme: "MultiKey",
      rawType: "single_sender",
      subKeys: [
        {type: "ed25519", display: "Ed25519"},
        {type: "secp256k1_ecdsa", display: "Secp256k1 ECDSA"},
        {type: "keyless", display: "Keyless"},
      ],
      signaturesRequired: 2,
      totalKeys: 3,
    });
  });

  it("unwraps multi_agent_signature.sender before classifying", () => {
    const sig = {
      type: "multi_agent_signature",
      sender: ed25519Account,
      secondary_signer_addresses: [],
      secondary_signers: [],
    };
    const result = extractAccountKeyTypeFromSignature(sig);
    expect(result?.scheme).toBe("Ed25519");
    expect(result?.rawType).toBe("ed25519_signature");
  });

  it("unwraps fee_payer_signature.sender before classifying", () => {
    const sig = {
      type: "fee_payer_signature",
      fee_payer_address: "0xfee",
      sender: {
        type: "single_sender",
        public_key: {type: "keyless", value: "0xkk"},
        signature: {type: "keyless", value: "0xss"},
      },
      secondary_signer_addresses: [],
      secondary_signers: [],
      fee_payer_signer: ed25519Account,
    };
    const result = extractAccountKeyTypeFromSignature(sig);
    expect(result?.scheme).toBe("Single Key");
    expect(result?.innerType).toBe("Keyless");
  });

  it("returns null for unrecognized or missing signature shapes", () => {
    expect(extractAccountKeyTypeFromSignature(undefined)).toBeNull();
    expect(extractAccountKeyTypeFromSignature(null)).toBeNull();
    expect(extractAccountKeyTypeFromSignature({})).toBeNull();
    expect(
      extractAccountKeyTypeFromSignature({type: "future_unknown_scheme"}),
    ).toBeNull();
  });
});
