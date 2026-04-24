import {describe, expect, it} from "vitest";
import {aptosGatewayApiKeyHeaders} from "./aptosGatewayAuth";

describe("aptosGatewayApiKeyHeaders", () => {
  it("maps trimmed key to api-key header", () => {
    expect(aptosGatewayApiKeyHeaders("  AG-ABC  ")).toEqual({
      "api-key": "AG-ABC",
    });
  });

  it("returns empty object for whitespace-only key", () => {
    expect(aptosGatewayApiKeyHeaders("   ")).toEqual({});
  });
});
