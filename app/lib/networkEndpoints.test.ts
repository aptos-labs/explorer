// Covers FEAT-SETTINGS-005 — public testnet/devnet endpoints
import {describe, expect, it} from "vitest";
import {networks} from "./constants";
import {
  appliedNonStagingEndpoints,
  PUBLIC_FULLNODE_URLS,
  resolveFullnodeUrl,
  resolveGraphqlURI,
  STAGING_FULLNODE_URLS,
} from "./networkEndpoints";

const STAGING_TESTNET = STAGING_FULLNODE_URLS.testnet ?? "";
const PUBLIC_TESTNET = PUBLIC_FULLNODE_URLS.testnet ?? "";
const STAGING_DEVNET = STAGING_FULLNODE_URLS.devnet ?? "";
const PUBLIC_DEVNET = PUBLIC_FULLNODE_URLS.devnet ?? "";

describe("FEAT-SETTINGS-005 — fullnode URL preference", () => {
  it("keeps staging testnet and devnet until the preference is on", () => {
    expect(resolveFullnodeUrl("testnet", false, STAGING_TESTNET)).toBe(
      STAGING_TESTNET,
    );
    expect(resolveFullnodeUrl("devnet", false, STAGING_DEVNET)).toBe(
      STAGING_DEVNET,
    );
  });

  it("uses the public Aptos Labs hosts when the preference is on", () => {
    expect(resolveFullnodeUrl("testnet", true, STAGING_TESTNET)).toBe(
      PUBLIC_TESTNET,
    );
    expect(resolveFullnodeUrl("devnet", true, STAGING_DEVNET)).toBe(
      PUBLIC_DEVNET,
    );
    expect(resolveFullnodeUrl("testnet", true, `${STAGING_TESTNET}/`)).toBe(
      PUBLIC_TESTNET,
    );
  });

  it("leaves mainnet and non-staging build overrides unchanged", () => {
    expect(
      resolveFullnodeUrl(
        "mainnet",
        true,
        "https://api.mainnet.aptoslabs.com/v1",
      ),
    ).toBe("https://api.mainnet.aptoslabs.com/v1");
    expect(
      resolveFullnodeUrl("testnet", true, "https://fullnode.example/v1"),
    ).toBe("https://fullnode.example/v1");
    expect(resolveFullnodeUrl("local", true, "http://127.0.0.1:8080/v1")).toBe(
      "http://127.0.0.1:8080/v1",
    );
  });

  it("swaps GraphQL only together with the default staging fullnode", () => {
    expect(
      resolveGraphqlURI(
        "testnet",
        true,
        `${STAGING_TESTNET}/graphql`,
        STAGING_TESTNET,
      ),
    ).toBe(`${PUBLIC_TESTNET}/graphql`);
    expect(
      resolveGraphqlURI(
        "devnet",
        false,
        `${STAGING_DEVNET}/graphql`,
        STAGING_DEVNET,
      ),
    ).toBe(`${STAGING_DEVNET}/graphql`);
    expect(
      resolveGraphqlURI(
        "testnet",
        true,
        `${STAGING_TESTNET}/graphql`,
        "https://fullnode.example/v1",
      ),
    ).toBe(`${STAGING_TESTNET}/graphql`);
    expect(
      resolveGraphqlURI(
        "mainnet",
        true,
        "https://api.mainnet.aptoslabs.com/v1/graphql",
        "https://api.mainnet.aptoslabs.com/v1",
      ),
    ).toBe("https://api.mainnet.aptoslabs.com/v1/graphql");
  });

  it("swaps the explorer's configured staging defaults", () => {
    expect(resolveFullnodeUrl("testnet", false)).toBe(networks.testnet);
    expect(resolveFullnodeUrl("devnet", false)).toBe(networks.devnet);
    expect(networks.testnet).toBe(STAGING_TESTNET);
    expect(networks.devnet).toBe(STAGING_DEVNET);
    expect(resolveFullnodeUrl("testnet", true)).toBe(PUBLIC_TESTNET);
    expect(resolveFullnodeUrl("devnet", true)).toBe(PUBLIC_DEVNET);
    expect(resolveGraphqlURI("testnet", true)).toBe(
      `${PUBLIC_TESTNET}/graphql`,
    );
    expect(resolveGraphqlURI("devnet", true)).toBe(`${PUBLIC_DEVNET}/graphql`);
  });

  it("applies the preference only after hydration", () => {
    expect(appliedNonStagingEndpoints(true, false)).toBe(false);
    expect(appliedNonStagingEndpoints(false, true)).toBe(false);
    expect(appliedNonStagingEndpoints(true, true)).toBe(true);
  });
});
