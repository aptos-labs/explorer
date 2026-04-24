/**
 * Aptos Labs API Gateway (geomi.dev `AG-*` keys) expects the key in the
 * `api-key` header. Sending `Authorization: Bearer <key>` is rejected with 401,
 * so usage is not attributed to the key in Geomi dashboards.
 */
export function aptosGatewayApiKeyHeaders(
  apiKey: string,
): Record<string, string> {
  const trimmed = apiKey.trim();
  if (!trimmed) return {};
  return {"api-key": trimmed};
}
