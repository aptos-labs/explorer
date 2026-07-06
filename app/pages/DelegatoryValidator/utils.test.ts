// Covers FEAT-VALDEL-004 — My Deposits reward estimation
import {describe, expect, it} from "vitest";
import {getStakeOperationPrincipals, getStakeRewardsEarned} from "./utils";

const ANONYMIZED_DELEGATOR_ADDRESS = "0x11111111111111111111111111111111";
const ANONYMIZED_POOL_ADDRESS = "0x22222222222222222222222222222222";

describe("FEAT-VALDEL-004 — getStakeOperationPrincipals", () => {
  it("replays mixed legacy and current delegation event names for an anonymized production history", () => {
    const activities = [
      {
        amount: 6610000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 583272048n,
      },
      {
        amount: 5720000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 976440469n,
      },
      {
        amount: 2300000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 990228871n,
      },
      {
        amount: 710000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 998986629n,
      },
      {
        amount: 2010000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 1023455981n,
      },
      {
        amount: 2000000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 1038774225n,
      },
      {
        amount: 5710002138,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 1084387418n,
      },
      {
        amount: 2010000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 1690779964n,
      },
      {
        amount: 27524270185,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 3,
        event_type: "0x1::delegation_pool::UnlockStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 1724669533n,
      },
      {
        amount: 27590325986,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::WithdrawStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 1776674529n,
      },
      {
        amount: 27600000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 1776681411n,
      },
      {
        amount: 3050000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 2478921511n,
      },
      {
        amount: 4399999999,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 3,
        event_type: "0x1::delegation_pool::UnlockStakeEvent",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 2511047853n,
      },
      {
        amount: 4401720560,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::WithdrawStake",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 2872547737n,
      },
      {
        amount: 5500000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStake",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 2872560809n,
      },
      {
        amount: 1000000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStake",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 2995566545n,
      },
      {
        amount: 1050000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStake",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 3190818804n,
      },
      {
        amount: 2000000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStake",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 3332646614n,
      },
      {
        amount: 1000000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStake",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 3506761305n,
      },
      {
        amount: 4040000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStake",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 3596393442n,
      },
      {
        amount: 4010000000,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 6,
        event_type: "0x1::delegation_pool::AddStake",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 3680425864n,
      },
    ];

    const unlockedActivities = [
      ...activities,
      {
        amount: 48248912591,
        delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
        event_index: 3,
        event_type: "0x1::delegation_pool::UnlockStake",
        pool_address: ANONYMIZED_POOL_ADDRESS,
        transaction_version: 5945952067n,
      },
    ];

    expect(
      getStakeOperationPrincipals({
        activities: unlockedActivities,
        loading: false,
        error: undefined,
      }),
    ).toEqual({
      isLoading: false,
      stakePrincipals: {
        activePrincipals: 0,
        pendingInactivePrincipals: 48248912591,
      },
    });

    expect(
      getStakeOperationPrincipals({
        activities: [
          ...unlockedActivities,
          {
            amount: 48265467949,
            delegator_address: ANONYMIZED_DELEGATOR_ADDRESS,
            event_index: 6,
            event_type: "0x1::delegation_pool::WithdrawStake",
            pool_address: ANONYMIZED_POOL_ADDRESS,
            transaction_version: 6044722355n,
          },
        ],
        loading: false,
        error: undefined,
      }),
    ).toEqual({
      isLoading: false,
      stakePrincipals: {
        activePrincipals: 0,
        pendingInactivePrincipals: 0,
      },
    });
  });

  it("uses event_index to preserve intra-transaction ordering", () => {
    expect(
      getStakeOperationPrincipals({
        activities: [
          {
            amount: 1100000000,
            delegator_address: "0x1",
            event_index: 6,
            event_type: "0x1::delegation_pool::WithdrawStake",
            pool_address: "0x2",
            transaction_version: 10n,
          },
          {
            amount: 1100000000,
            delegator_address: "0x1",
            event_index: 3,
            event_type: "0x1::delegation_pool::UnlockStake",
            pool_address: "0x2",
            transaction_version: 10n,
          },
        ],
        loading: false,
        error: undefined,
      }),
    ).toEqual({
      isLoading: false,
      stakePrincipals: {
        activePrincipals: 0,
        pendingInactivePrincipals: 0,
      },
    });
  });
});

describe("FEAT-VALDEL-004 — getStakeRewardsEarned", () => {
  it("returns a zero reward when the current stake equals principal", () => {
    expect(getStakeRewardsEarned(17000000000, 17000000000)).toBe(0);
  });

  it("returns undefined until principals are available", () => {
    expect(getStakeRewardsEarned(17000000000, undefined)).toBeUndefined();
  });
});
