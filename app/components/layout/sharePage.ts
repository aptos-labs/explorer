/**
 * Pure helper that shares the current page using the Web Share API when
 * available and falls back to copying the URL to the clipboard. Extracted
 * from the React component so it can be unit-tested without a DOM.
 *
 * Returns:
 * - `"shared"` — `navigator.share` resolved successfully
 * - `"copied"` — fell back to `navigator.clipboard.writeText`
 * - `"cancelled"` — user dismissed the system share sheet (`AbortError`)
 * - `"error"` — neither share nor clipboard worked
 */
export type ShareOutcome = "shared" | "copied" | "cancelled" | "error";

export interface SharePageInput {
  url: string;
  title?: string;
  text?: string;
}

export interface SharePageDeps {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data?: ShareData) => boolean;
  writeText?: (text: string) => Promise<void>;
}

function isAbortError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as {name: unknown}).name === "AbortError"
  );
}

export async function sharePage(
  input: SharePageInput,
  deps: SharePageDeps = {},
): Promise<ShareOutcome> {
  const data: ShareData = {
    url: input.url,
    ...(input.title ? {title: input.title} : {}),
    ...(input.text ? {text: input.text} : {}),
  };

  if (typeof deps.share === "function") {
    const usable = deps.canShare ? deps.canShare(data) : true;
    if (usable) {
      try {
        await deps.share(data);
        return "shared";
      } catch (err) {
        if (isAbortError(err)) return "cancelled";
        // Fall through to clipboard fallback on permission/other errors.
      }
    }
  }

  if (typeof deps.writeText === "function") {
    try {
      await deps.writeText(input.url);
      return "copied";
    } catch {
      return "error";
    }
  }

  return "error";
}

/**
 * Resolve runtime dependencies from `window.navigator`. Kept separate so
 * tests can pass a fully synthetic `deps` object without monkey-patching
 * globals.
 */
export function resolveShareDeps(): SharePageDeps {
  if (typeof navigator === "undefined") return {};
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };
  const deps: SharePageDeps = {};
  if (typeof nav.share === "function") {
    deps.share = nav.share.bind(nav);
  }
  if (typeof nav.canShare === "function") {
    deps.canShare = nav.canShare.bind(nav);
  }
  if (nav.clipboard && typeof nav.clipboard.writeText === "function") {
    deps.writeText = nav.clipboard.writeText.bind(nav.clipboard);
  }
  return deps;
}
