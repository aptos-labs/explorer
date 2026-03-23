// @vitest-environment jsdom
import Cookies from "js-cookie";
import {afterEach, describe, expect, it, vi} from "vitest";
import {useFeatureName} from "./GlobalConfig";

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => ({}),
}));

describe("useFeatureName", () => {
  afterEach(() => {
    Cookies.remove("feature_name");
    vi.unstubAllEnvs();
  });

  it("returns 'prod' by default when no cookie or env is set", () => {
    expect(useFeatureName()).toBe("prod");
  });

  it("reads 'dev' from a feature_name cookie", () => {
    Cookies.set("feature_name", "dev");
    expect(useFeatureName()).toBe("dev");
  });

  it("reads 'earlydev' from a feature_name cookie", () => {
    Cookies.set("feature_name", "earlydev");
    expect(useFeatureName()).toBe("earlydev");
  });

  it("ignores invalid cookie values and falls back to default", () => {
    Cookies.set("feature_name", "bogus");
    expect(useFeatureName()).toBe("prod");
  });

  it("reads from VITE_FEATURE_NAME env var", () => {
    vi.stubEnv("VITE_FEATURE_NAME", "dev");
    expect(useFeatureName()).toBe("dev");
  });

  it("cookie takes priority over VITE_FEATURE_NAME", () => {
    vi.stubEnv("VITE_FEATURE_NAME", "earlydev");
    Cookies.set("feature_name", "dev");
    expect(useFeatureName()).toBe("dev");
  });

  it("falls back to env when cookie is invalid", () => {
    vi.stubEnv("VITE_FEATURE_NAME", "earlydev");
    Cookies.set("feature_name", "invalid");
    expect(useFeatureName()).toBe("earlydev");
  });

  it("falls back to default when both cookie and env are invalid", () => {
    vi.stubEnv("VITE_FEATURE_NAME", "nope");
    Cookies.set("feature_name", "invalid");
    expect(useFeatureName()).toBe("prod");
  });
});
