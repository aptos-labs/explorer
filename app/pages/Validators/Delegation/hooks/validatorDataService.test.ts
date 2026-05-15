import {beforeEach, describe, expect, it, vi} from "vitest";
import type {AptosClient} from "../../../../api/legacyClient";
import {Network} from "../../../../constants";

// Covers FEAT-VALIDATORS-003 — Delegation validators table loading behavior.
//
// Regression: when a wallet was connected, the table issued one
// `0x1::delegation_pool::get_stake` view call per validator (~150 on
// mainnet) sequentially, blocking the entire list from rendering for up
// to a minute. The fix is to first query the indexer for the small set
// of pools the user has any position in, and only call `get_stake` for
// those.

const queryIndexerMock = vi.fn();

vi.mock("../../../../global-config", () => ({
  getCachedV2Client: () => ({
    queryIndexer: queryIndexerMock,
  }),
}));

// Re-import after mocks are in place.
import {getBatchUserStakes} from "./validatorDataService";

const POOL_A =
  "0x000000000000000000000000000000000000000000000000000000000000000a";
const POOL_B =
  "0x000000000000000000000000000000000000000000000000000000000000000b";
const POOL_C =
  "0x000000000000000000000000000000000000000000000000000000000000000c";
const USER = "0x1";

describe("getBatchUserStakes", () => {
  beforeEach(() => {
    queryIndexerMock.mockReset();
  });

  it("returns zeros and never calls the view function when the wallet has no delegator positions", async () => {
    queryIndexerMock.mockResolvedValue({delegator_distinct_pool: []});
    const view = vi.fn();
    const client = {view} as unknown as AptosClient;

    const result = await getBatchUserStakes(
      USER,
      [POOL_A, POOL_B, POOL_C],
      client,
      Network.MAINNET,
    );

    expect(result).toEqual([0, 0, 0]);
    expect(view).not.toHaveBeenCalled();
    expect(queryIndexerMock).toHaveBeenCalledTimes(1);
  });

  it("only calls the view function for pools the wallet actually delegates to", async () => {
    queryIndexerMock.mockResolvedValue({
      delegator_distinct_pool: [{pool_address: POOL_B}],
    });
    const view = vi.fn(async (payload: {arguments: unknown[]}) => {
      const pool = payload.arguments[0] as string;
      if (pool === POOL_B) {
        // 1 APT in OCTAs across two sub-pools.
        return ["60000000", "40000000", "0"];
      }
      throw new Error(`Unexpected view call for pool ${pool}`);
    });
    const client = {view} as unknown as AptosClient;

    const result = await getBatchUserStakes(
      USER,
      [POOL_A, POOL_B, POOL_C],
      client,
      Network.MAINNET,
    );

    expect(result).toEqual([0, 1, 0]);
    expect(view).toHaveBeenCalledTimes(1);
    expect(view.mock.calls[0]?.[0]).toMatchObject({
      function: "0x1::delegation_pool::get_stake",
      arguments: [POOL_B, USER],
    });
  });

  it("returns zeros without view calls if the indexer request fails", async () => {
    queryIndexerMock.mockRejectedValue(new Error("indexer down"));
    const view = vi.fn();
    const client = {view} as unknown as AptosClient;
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await getBatchUserStakes(
      USER,
      [POOL_A, POOL_B],
      client,
      Network.MAINNET,
    );

    expect(result).toEqual([0, 0]);
    expect(view).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("treats individual view-call failures as zero without crashing the batch", async () => {
    queryIndexerMock.mockResolvedValue({
      delegator_distinct_pool: [{pool_address: POOL_A}, {pool_address: POOL_B}],
    });
    const view = vi.fn(async (payload: {arguments: unknown[]}) => {
      const pool = payload.arguments[0] as string;
      if (pool === POOL_A) throw new Error("rate limited");
      if (pool === POOL_B) return ["100000000"];
      return ["0"];
    });
    const client = {view} as unknown as AptosClient;
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await getBatchUserStakes(
      USER,
      [POOL_A, POOL_B, POOL_C],
      client,
      Network.MAINNET,
    );

    expect(result).toEqual([0, 1, 0]);
    expect(view).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });

  it("returns an empty array when there are no validator addresses to look up", async () => {
    const view = vi.fn();
    const client = {view} as unknown as AptosClient;

    const result = await getBatchUserStakes(USER, [], client, Network.MAINNET);

    expect(result).toEqual([]);
    expect(view).not.toHaveBeenCalled();
    expect(queryIndexerMock).not.toHaveBeenCalled();
  });
});
