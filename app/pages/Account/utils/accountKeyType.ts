/**
 * Account key-type extraction.
 *
 * Given a transaction submitted by an account (or just its `signature` field),
 * derive a human-readable description of the authentication scheme the
 * account most recently used to sign. For MultiKey schemes, also list the
 * sub-key types so users can see exactly which key types make up the
 * threshold key.
 *
 * Aptos REST `signature` shapes (sender authenticator):
 *   - `ed25519_signature`           — legacy single Ed25519 key.
 *   - `multi_ed25519_signature`     — legacy K-of-N Ed25519 multi-sig.
 *   - `single_sender`               — modern wrapper, with two variants:
 *       - SingleKey:  `{ public_key: { type, value }, signature: { type, value } }`
 *       - MultiKey:   `{ public_keys: [{ type, value }], signatures: [...],
 *                        signatures_required: N }`
 *
 * Multi-agent and fee-payer authenticators wrap a sender authenticator under
 * `signature.sender`; this module unwraps those before classifying.
 */

export type SubKeyType = {
  type: string;
  display: string;
};

export type AccountKeyTypeInfo = {
  /** Human-readable scheme label, e.g. "Single Key", "MultiKey", "Ed25519". */
  scheme: string;
  /** Optional sub-label describing the inner key type (Single Key only). */
  innerType?: string;
  /** Sub-keys for MultiKey / Multi-Ed25519 schemes. */
  subKeys?: SubKeyType[];
  /** Number of signatures required (MultiKey / Multi-Ed25519). */
  signaturesRequired?: number;
  /** Total number of public keys (MultiKey / Multi-Ed25519). */
  totalKeys?: number;
  /** Raw underlying signature `type` field (e.g. `single_sender`). */
  rawType: string;
};

/**
 * Map an inner public-key `type` string from the Aptos REST API into a
 * human-friendly label. Unknown values are returned as-is so we never hide
 * forward-compatible fields the API may add.
 */
export function humanizeInnerKeyType(type: string): string {
  switch (type) {
    case "ed25519":
      return "Ed25519";
    case "secp256k1_ecdsa":
      return "Secp256k1 ECDSA";
    case "secp256r1_ecdsa":
      return "Secp256r1 ECDSA";
    case "keyless":
      return "Keyless";
    case "federated_keyless":
      return "Federated Keyless";
    default:
      return type.replaceAll("_", " ");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Unwrap multi-agent / fee-payer wrappers to the primary signer authenticator.
 * For other shapes, returns the input untouched.
 */
export function unwrapSenderAuthenticator(signature: unknown): unknown {
  if (!isRecord(signature)) {
    return signature;
  }
  const t = signature.type;
  if (t === "multi_agent_signature" || t === "fee_payer_signature") {
    if ("sender" in signature) {
      return signature.sender;
    }
  }
  return signature;
}

/**
 * Extract a structured key-type description from a transaction's `signature`
 * (or any sender authenticator). Returns `null` when the signature is missing
 * or completely unrecognized.
 */
export function extractAccountKeyTypeFromSignature(
  signature: unknown,
): AccountKeyTypeInfo | null {
  const sender = unwrapSenderAuthenticator(signature);
  if (!isRecord(sender)) {
    return null;
  }

  const rawType = typeof sender.type === "string" ? sender.type : "";

  if (rawType === "ed25519_signature") {
    return {
      scheme: "Ed25519",
      rawType,
    };
  }

  if (rawType === "multi_ed25519_signature") {
    const publicKeys = Array.isArray(sender.public_keys)
      ? sender.public_keys.filter((k): k is string => typeof k === "string")
      : [];
    const threshold =
      typeof sender.threshold === "number"
        ? sender.threshold
        : typeof sender.threshold === "string"
          ? Number.parseInt(sender.threshold, 10)
          : undefined;
    return {
      scheme: "Multi-Ed25519",
      rawType,
      subKeys: publicKeys.map(() => ({type: "ed25519", display: "Ed25519"})),
      signaturesRequired: Number.isFinite(threshold) ? threshold : undefined,
      totalKeys: publicKeys.length || undefined,
    };
  }

  if (rawType === "single_sender") {
    if (Array.isArray(sender.public_keys)) {
      const subKeys: SubKeyType[] = [];
      for (const pk of sender.public_keys) {
        if (isRecord(pk) && typeof pk.type === "string") {
          subKeys.push({
            type: pk.type,
            display: humanizeInnerKeyType(pk.type),
          });
        }
      }
      const signaturesRequired =
        typeof sender.signatures_required === "number"
          ? sender.signatures_required
          : typeof sender.signatures_required === "string"
            ? Number.parseInt(sender.signatures_required, 10)
            : undefined;
      return {
        scheme: "MultiKey",
        rawType,
        subKeys,
        signaturesRequired: Number.isFinite(signaturesRequired)
          ? signaturesRequired
          : undefined,
        totalKeys: subKeys.length || undefined,
      };
    }

    if (
      isRecord(sender.public_key) &&
      typeof sender.public_key.type === "string"
    ) {
      const innerRaw = sender.public_key.type;
      return {
        scheme: "Single Key",
        rawType,
        innerType: humanizeInnerKeyType(innerRaw),
        subKeys: [{type: innerRaw, display: humanizeInnerKeyType(innerRaw)}],
        totalKeys: 1,
      };
    }

    return {
      scheme: "Single Key",
      rawType,
    };
  }

  return null;
}
