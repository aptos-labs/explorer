import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {getClientApiKeyTelemetrySource} from "./apiKeyTelemetry";

vi.mock("../settings/clientSettings", () => ({
  getGeomiDevApiKeyOverride: vi.fn(),
}));

import {getGeomiDevApiKeyOverride} from "../settings/clientSettings";

const mockOverride = vi.mocked(getGeomiDevApiKeyOverride);

describe("getClientApiKeyTelemetrySource", () => {
  beforeEach(() => {
    mockOverride.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns user_override when a geomi override exists", () => {
    mockOverride.mockReturnValue("  my-key  ");
    expect(getClientApiKeyTelemetrySource("mainnet")).toBe("user_override");
  });
});
