/**
 * Resolve the callable default export from a CJS module that may be wrapped
 * once or twice by ESM interop (`import x from "cjs"` → function, namespace
 * object, or `{ default: fn }` nested under another `default`).
 */

function describeInteropShape(mod: unknown): string {
  if (mod === null) {
    return "null";
  }
  if (typeof mod !== "object") {
    return typeof mod;
  }
  const first =
    "default" in mod ? (mod as {default: unknown}).default : undefined;
  const second =
    first && typeof first === "object" && "default" in first
      ? (first as {default: unknown}).default
      : undefined;
  return `root=${typeof mod}, default=${typeof first}, default.default=${typeof second}`;
}

export function resolveCjsDefaultExport<
  T extends (...args: never[]) => unknown,
>(mod: unknown, moduleId: string): T {
  if (typeof mod === "function") {
    return mod as T;
  }

  if (mod && typeof mod === "object" && "default" in mod) {
    const first = (mod as {default: unknown}).default;
    if (typeof first === "function") {
      return first as T;
    }
    if (first && typeof first === "object" && "default" in first) {
      const second = (first as {default: unknown}).default;
      if (typeof second === "function") {
        return second as T;
      }
    }
  }

  throw new TypeError(
    `Expected a callable default export from "${moduleId}", interop shape: ${describeInteropShape(mod)}`,
  );
}
