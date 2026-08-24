/**
 * Root `index.html` is the Vite *dev* shell: it loads `/app/client.tsx` as a
 * module. Production HTML is SSR from `app/routes/__root.tsx` (`<Scripts />`
 * injects hashed `/assets/*.js`). If that shell is published as a static file,
 * Vercel’s filesystem handler (or the Vite SPA fallback) serves it for `/`,
 * the browser requests `/app/client.tsx`, and the host returns `text/html`
 * (MIME check fails).
 */
export function isSpaIndexHtmlOutput(fileName: string): boolean {
  const base = (fileName.split(/[/\\]/).pop() ?? fileName).toLowerCase();
  return (
    base === "index.html" ||
    base === "index.html.gz" ||
    base === "index.html.br"
  );
}

export const SPA_INDEX_HTML_FILES = [
  "index.html",
  "index.html.gz",
  "index.html.br",
] as const;
