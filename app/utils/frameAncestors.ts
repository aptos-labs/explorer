/**
 * Clickjacking policy for explorer HTML (and other SSR) responses.
 *
 * `X-Frame-Options` cannot allowlist a third-party origin (`ALLOW-FROM` is
 * obsolete). Petra Vault embeds explorer at https://vault.petra.app, so the
 * allowlist is CSP `frame-ancestors` with `'self'` plus that origin.
 *
 * Do not also send `X-Frame-Options: DENY`: Safari can still honor DENY
 * when both headers are present, which would keep Vault broken.
 *
 * Kept in sync with the `Content-Security-Policy` values in `vercel.json`.
 * Host `headers` apply to static assets; SSR function responses may not
 * inherit them, so `app/ssr.tsx` attaches this itself.
 */
export const PETRA_VAULT_ORIGIN = "https://vault.petra.app";

export const FRAME_ANCESTORS_CSP = `frame-ancestors 'self' ${PETRA_VAULT_ORIGIN}`;

export function attachFrameAncestorsHeader(response: Response): Response {
  const headers = new Headers(response.headers);
  if (headers.has("Content-Security-Policy")) {
    return response;
  }

  headers.set("Content-Security-Policy", FRAME_ANCESTORS_CSP);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
