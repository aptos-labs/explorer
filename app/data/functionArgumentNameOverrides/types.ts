/**
 * Manual labels for Move function arguments shown in the transaction payload UI and
 * the account Run / View contract tab.
 *
 * ## Key format
 *
 * `{standardizedModuleAddress}::{moduleName}::{functionName}`
 *
 * - `standardizedModuleAddress`: `tryStandardizeAddress` / long form, e.g. `0x` + 64 hex (lowercase).
 * - `moduleName`: Move module name as in the ABI (e.g. `admin_apis`).
 * - `functionName`: Exposed function name (e.g. `initialize`).
 *
 * ## Value format
 *
 * `readonly string[]` listing **non-signer** parameters in ABI order — the same sequence as
 * serialized `function_arguments` in an entry payload (and as `fn.params` with every
 * `signer` / `&signer` removed). View functions use all params in order.
 *
 * When an entry function includes `&signer`, omit that slot from the override array.
 *
 * Overrides take precedence over names parsed from published Move source when the array
 * length matches the expected non-signer argument count.
 */

export type FunctionArgumentNameOverrideKey = string;

export type FunctionArgumentNameOverrideMap = Record<
  FunctionArgumentNameOverrideKey,
  readonly string[]
>;
