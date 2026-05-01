import type {Types} from "~/types/aptos";

export function parseConfidentialStoreBool(
  values: Types.MoveValue[] | undefined,
): boolean {
  if (!values?.length) {
    return false;
  }
  const v = values[0];
  return v === true || v === "true";
}

export function parseConfidentialSupplyU64(
  values: Types.MoveValue[] | undefined,
): bigint | null {
  if (values === undefined || values.length === 0) {
    return null;
  }
  const raw = values[0];
  if (typeof raw === "string" && raw.length > 0) {
    return BigInt(raw);
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return BigInt(Math.trunc(raw));
  }
  return null;
}
