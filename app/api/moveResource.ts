import type {Types} from "~/types/aptos";

/**
 * `@aptos-labs/ts-sdk` `getAccountResource` returns the inner payload
 * (`MoveResource.data`), not the REST `{ type, data }` envelope this app
 * uses. Callers that read `resource.data.field` then crash or see empty
 * data (validators list, epoch, StakePool lockup).
 */
export function isRestMoveResource(
  value: unknown,
): value is Types.MoveResource {
  if (value == null || typeof value !== "object") return false;
  if (!("type" in value) || !("data" in value)) return false;
  const type = (value as {type: unknown}).type;
  return typeof type === "string" && type.includes("::");
}

/** Re-wrap an SDK `getAccountResource` result into `{ type, data }`. */
export function toMoveResource(
  resourceType: string,
  sdkPayload: unknown,
): Types.MoveResource {
  if (isRestMoveResource(sdkPayload)) {
    return sdkPayload;
  }
  return {
    type: resourceType,
    data: sdkPayload as Types.MoveResource["data"],
  };
}

/** Inner resource fields, whether the value is REST-wrapped or SDK-unwrapped. */
export function moveResourceData<T = unknown>(
  resource: unknown,
): T | undefined {
  if (resource == null) return undefined;
  if (isRestMoveResource(resource)) {
    return resource.data as T;
  }
  return resource as T;
}
