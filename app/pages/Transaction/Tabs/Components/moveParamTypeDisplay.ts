import {parseTypeTag, TypeTagReference, type TypeTag} from "@aptos-labs/ts-sdk";
import {truncateAddress} from "../../../../utils/utils";

function unwrapTypeTagRefs(tag: TypeTag): {inner: TypeTag; refPrefix: string} {
  let refPrefix = "";
  let current: TypeTag = tag;
  while (current instanceof TypeTagReference) {
    refPrefix += "&";
    current = current.value;
  }
  return {inner: current, refPrefix};
}

/**
 * Shortens a Move type for compact badges (e.g. Option inner type).
 * Uses friendly names for std Object / String / Option / vector and truncates long addresses.
 */
export function shortenTypeTagForBadge(tag: TypeTag): string {
  const {inner, refPrefix} = unwrapTypeTagRefs(tag);

  if (inner.isVector()) {
    return `${refPrefix}vector<${shortenTypeTagForBadge(inner.value)}>`;
  }

  if (inner.isStruct()) {
    if (inner.isObject()) {
      if (inner.value.typeArgs.length === 0) {
        return `${refPrefix}Object`;
      }
      const args = inner.value.typeArgs
        .map((t) => shortenTypeTagForBadge(t))
        .join(", ");
      return `${refPrefix}Object<${args}>`;
    }
    if (inner.isString()) {
      return `${refPrefix}String`;
    }
    if (inner.isOption()) {
      const optInner = inner.value.typeArgs[0];
      if (!optInner) {
        return `${refPrefix}Option`;
      }
      return `${refPrefix}Option<${shortenTypeTagForBadge(optInner)}>`;
    }

    const addr = inner.value.address.toString();
    const shortAddr = addr.length > 12 ? truncateAddress(addr) : addr;
    const base = `${shortAddr}::${inner.value.moduleName.identifier}::${inner.value.name.identifier}`;
    if (inner.value.typeArgs.length === 0) {
      return `${refPrefix}${base}`;
    }
    const args = inner.value.typeArgs
      .map((t) => shortenTypeTagForBadge(t))
      .join(", ");
    return `${refPrefix}${base}<${args}>`;
  }

  return `${refPrefix}${inner.toString()}`;
}

export type ParamTypeDisplay =
  | {kind: "badge"; label: string; tooltip: string}
  | {kind: "plain"; text: string};

/**
 * Maps a Move type string to either a badge (Object, String, Option, vector…) or plain monospace text.
 */
export function getParamTypeDisplay(typeStr: string): ParamTypeDisplay {
  const trimmed = typeStr.trim();
  if (!trimmed || trimmed === "unknown") {
    return {kind: "plain", text: trimmed};
  }

  try {
    const tag = parseTypeTag(trimmed, {allowGenerics: true});
    const {inner, refPrefix} = unwrapTypeTagRefs(tag);

    if (inner.isStruct() && inner.isObject()) {
      return {
        kind: "badge",
        label: `${refPrefix}Object`,
        tooltip: trimmed,
      };
    }

    if (inner.isStruct() && inner.isString()) {
      return {
        kind: "badge",
        label: `${refPrefix}String`,
        tooltip: trimmed,
      };
    }

    if (inner.isStruct() && inner.isOption()) {
      const optInner = inner.value.typeArgs[0];
      const label = optInner
        ? `${refPrefix}Option<${shortenTypeTagForBadge(optInner)}>`
        : `${refPrefix}Option`;
      return {
        kind: "badge",
        label,
        tooltip: trimmed,
      };
    }

    if (inner.isVector()) {
      return {
        kind: "badge",
        label: `${refPrefix}vector<${shortenTypeTagForBadge(inner.value)}>`,
        tooltip: trimmed,
      };
    }

    return {kind: "plain", text: trimmed};
  } catch {
    return {kind: "plain", text: trimmed};
  }
}
