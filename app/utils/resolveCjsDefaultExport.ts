/**
 * Resolve the callable default export from a CJS module that may be wrapped
 * once or twice by ESM interop (`import x from "cjs"` → function, namespace
 * object, or `{ default: fn }` nested under another `default`).
 */
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
    `Expected a callable default export from "${moduleId}", got ${typeof mod}`,
  );
}
