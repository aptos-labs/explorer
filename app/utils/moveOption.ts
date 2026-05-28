/** Move `option::Option<T>` as returned by the Aptos REST API (`{ vec: [...] }`). */
export type MoveOptionVec<T = unknown> = {vec: T[]};

/**
 * Unwraps a Move `Option` encoded as `{ vec: [value] }` or `{ vec: [] }` for `None`.
 */
export function unwrapMoveOptionVec<T = unknown>(opt: unknown): T | null {
  if (opt == null || typeof opt !== "object") {
    return null;
  }
  const vec = (opt as MoveOptionVec<T>).vec;
  if (!Array.isArray(vec) || vec.length === 0) {
    return null;
  }
  return vec[0] as T;
}
