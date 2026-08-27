/**
 * Aptos Labs API Gateway (Geomi) authentication helpers.
 *
 * Geomi documents client and server keys as:
 *   Authorization: Bearer <key>
 * The TypeScript SDK does the same from `clientConfig.API_KEY`.
 *
 * A custom `api-key` header is **ignored**. Requests still succeed (anonymous
 * 200s) so it looks like auth "worked", but Geomi attributes zero compute units
 * to the key and 429s are the shared anonymous IP bucket — not that key's quota.
 * Do not resurrect that header as a "fix" for 429s.
 *
 * Geomi `AG-*` **client** keys additionally require a browser `Origin` that
 * matches the origin registered on the key. SSR must use a **server** key
 * (`APTOS_<NETWORK>_API_KEY`, typically `aptoslabs_…`) which does not need Origin.
 */

export function aptosGatewayApiKeyHeaders(
  apiKey: string | undefined,
): Record<string, string> {
  const trimmed = apiKey?.trim();
  if (!trimmed) return {};
  return {Authorization: `Bearer ${trimmed}`};
}

export function aptosSdkClientConfig(
  apiKey: string | undefined,
): {API_KEY: string} | undefined {
  const trimmed = apiKey?.trim();
  if (!trimmed) return undefined;
  return {API_KEY: trimmed};
}
