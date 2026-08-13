/**
 * Parse an HTTP `Accept` header and decide whether the client prefers
 * `text/markdown` over HTML.
 *
 * Returns true when `text/markdown` appears as a media range with a non-zero
 * q-value (defaulting to 1 per RFC 9110) that is at least as high as any
 * `text/html` q-value. Browser Accept lists that omit markdown stay on HTML.
 * Used by SSR (`negotiateMarkdownRequest`) so AI agents can fetch a markdown
 * view without affecting browsers.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;

  let markdownQ = 0;
  let htmlQ = 0;
  const ranges = accept.split(",").map((part) => part.trim().toLowerCase());
  for (const range of ranges) {
    const [mediaTypeRaw, ...params] = range.split(";");
    const mediaType = mediaTypeRaw.trim();
    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    let q = 1;
    if (qParam) {
      const parsed = Number.parseFloat(qParam.slice(2));
      q = Number.isFinite(parsed) ? parsed : 0;
    }
    if (q <= 0) continue;
    if (mediaType === "text/markdown") {
      markdownQ = Math.max(markdownQ, q);
    } else if (mediaType === "text/html") {
      htmlQ = Math.max(htmlQ, q);
    }
  }

  return markdownQ > 0 && markdownQ >= htmlQ;
}
