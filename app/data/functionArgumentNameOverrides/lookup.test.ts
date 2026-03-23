import {describe, expect, it} from "vitest";
import {lookupFunctionArgumentNameOverride} from "./lookup";

describe("lookupFunctionArgumentNameOverride", () => {
  it("returns null when the address cannot be standardized", () => {
    expect(
      lookupFunctionArgumentNameOverride(
        "not-an-address",
        "admin_apis",
        "initialize",
        2,
      ),
    ).toBeNull();
  });

  it("returns null when no override exists", () => {
    expect(
      lookupFunctionArgumentNameOverride("0x1", "coin", "transfer", 2),
    ).toBeNull();
  });

  it("returns null when non-signer arg count does not match", () => {
    expect(
      lookupFunctionArgumentNameOverride(
        "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06",
        "admin_apis",
        "initialize",
        99,
      ),
    ).toBeNull();
  });

  it("returns Decibel stub names for a known entry function", () => {
    expect(
      lookupFunctionArgumentNameOverride(
        "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06",
        "admin_apis",
        "initialize",
        2,
      ),
    ).toEqual(["collateral_asset", "backstop_liquidator"]);
  });

  it("matches registry keys regardless of address casing in input", () => {
    expect(
      lookupFunctionArgumentNameOverride(
        "0x50EAD22AFD6FFD9769E3B3D6E0E64A2A350D68E8B102C4E72E33D0B8CFDFDB06",
        "vault_api",
        "activate_vault",
        1,
      ),
    ).toEqual(["vault"]);
  });
});
