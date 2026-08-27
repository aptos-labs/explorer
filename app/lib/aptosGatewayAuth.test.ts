import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";
import {
  aptosGatewayApiKeyHeaders,
  aptosSdkClientConfig,
} from "./aptosGatewayAuth";

const AUTH_SRC = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "aptosGatewayAuth.ts"),
  "utf8",
);
const CREATE_CLIENT_SRC = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../api/createClient.ts"),
  "utf8",
);
const GLOBAL_CONFIG_SRC = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../global-config/GlobalConfig.tsx",
  ),
  "utf8",
);

describe("aptosGatewayApiKeyHeaders", () => {
  // Covers FEAT-RATELIMIT-004 — Geomi keys must use Authorization: Bearer
  it("maps a trimmed key to Authorization Bearer", () => {
    expect(aptosGatewayApiKeyHeaders("  AG-ABC  ")).toEqual({
      Authorization: "Bearer AG-ABC",
    });
  });

  it("returns an empty object for missing or whitespace-only keys", () => {
    expect(aptosGatewayApiKeyHeaders(undefined)).toEqual({});
    expect(aptosGatewayApiKeyHeaders("   ")).toEqual({});
  });

  it("does not emit the ignored api-key header", () => {
    expect(aptosGatewayApiKeyHeaders("AG-ABC")).not.toHaveProperty("api-key");
    expect(aptosGatewayApiKeyHeaders("AG-ABC")).not.toHaveProperty("x-api-key");
  });
});

describe("aptosSdkClientConfig", () => {
  it("passes the key through the SDK API_KEY field (Bearer on the wire)", () => {
    expect(aptosSdkClientConfig("  AG-ABC  ")).toEqual({API_KEY: "AG-ABC"});
    expect(aptosSdkClientConfig(undefined)).toBeUndefined();
  });
});

describe("FEAT-RATELIMIT-004 source contract", () => {
  it("documents that api-key is ignored by the gateway", () => {
    expect(AUTH_SRC).toMatch(/custom `api-key` header is \*\*ignored\*\*/);
    expect(AUTH_SRC).toMatch(/Authorization: Bearer/);
  });

  it("wires SDK clients through aptosSdkClientConfig, not a custom api-key header", () => {
    expect(CREATE_CLIENT_SRC).toMatch(/aptosSdkClientConfig\(apiKey\)/);
    expect(CREATE_CLIENT_SRC).not.toMatch(/["']api-key["']/);
    expect(GLOBAL_CONFIG_SRC).toMatch(/aptosSdkClientConfig\(apiKey\)/);
    expect(GLOBAL_CONFIG_SRC).toMatch(/aptosGatewayApiKeyHeaders\(apiKey\)/);
    expect(GLOBAL_CONFIG_SRC).not.toMatch(/["']api-key["']/);
  });
});
