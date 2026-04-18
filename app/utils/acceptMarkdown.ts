/**
 * Parse an HTTP `Accept` header and decide whether the client prefers
 * `text/markdown`.
 *
 * Returns true when `text/markdown` appears as a media range with a non-zero
 * q-value (or with no explicit q-value — defaulting to 1 per RFC 9110). This
 * is used by the edge markdown-negotiation function to serve a markdown view
 * of the homepage for AI agents without affecting browser requests.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;
  const ranges = accept.split(",").map((part) => part.trim().toLowerCase());
  for (const range of ranges) {
    if (!range.startsWith("text/markdown")) continue;
    const params = range.split(";").slice(1);
    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    if (!qParam) return true;
    const q = Number.parseFloat(qParam.slice(2));
    if (Number.isFinite(q) && q > 0) return true;
  }
  return false;
}
