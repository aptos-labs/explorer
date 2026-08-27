// Covers FEAT-VALDEL-001 — individual validator page data resolution
import {describe, expect, it} from "vitest";
import type {DelegatedStakingPool} from "../../api/hooks/delegations";
import type {ValidatorData} from "../../api/hooks/useGetValidators";
import {tryStandardizeAddress} from "../../utils";
import {addressesEqual, resolveValidatorData} from "./resolveValidatorData";

// Production URL that rendered a blank page:
// https://explorer.aptoslabs.com/validator/0x890c86c19974b98594a4e5cd7b0b3a69af1b30afc78853a0c11e882801497320?network=mainnet
const PRODUCTION_POOL =
  "0x890c86c19974b98594a4e5cd7b0b3a69af1b30afc78853a0c11e882801497320";
const PRODUCTION_OPERATOR_SHORT =
  "0xb9d1a07cb94e46147b50ba9ce9c0f3b6677d7108384d63fda6e63dfca102bba";

const PADDED_ONE =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

function validatorRow(
  overrides: Partial<ValidatorData> & Pick<ValidatorData, "owner_address">,
): ValidatorData {
  return {
    operator_address: overrides.owner_address,
    voting_power: "0",
    governance_voting_record: "",
    last_epoch: 0,
    last_epoch_performance: "",
    liveness: 0,
    apt_rewards_distributed: 0,
    ...overrides,
  };
}

function pool(
  stakingPoolAddress: string,
  operatorAddress: string,
): DelegatedStakingPool {
  return {
    staking_pool_address: stakingPoolAddress,
    current_staking_pool: {operator_address: operatorAddress},
  };
}

describe("FEAT-VALDEL-001 — resolveValidatorData", () => {
  it("still resolves when validator lists are empty but StakePool exists", () => {
    // useGetValidators() returns [] while ValidatorSet is loading/failed
    // (buildValidatorsFromSources early-returns on an empty active set),
    // and the indexer pool list can be empty after a 429. The page used to
    // return null in that case even though the account has a StakePool.
    const resolved = resolveValidatorData({
      addressHex: tryStandardizeAddress(PRODUCTION_POOL) ?? PRODUCTION_POOL,
      validators: [],
      delegatedStakingPools: [],
      stakePool: {
        operator_address: PRODUCTION_OPERATOR_SHORT,
        active: {value: "665339689209144"},
      },
    });

    expect(resolved).toBeDefined();
    expect(resolved?.owner_address).toBe(
      tryStandardizeAddress(PRODUCTION_POOL),
    );
    expect(resolved?.operator_address).toBe(
      tryStandardizeAddress(PRODUCTION_OPERATOR_SHORT),
    );
    expect(resolved?.voting_power).toBe("665339689209144");
  });

  it("prefers stats from the validators list when the pool is in it", () => {
    const addressHex =
      tryStandardizeAddress(PRODUCTION_POOL) ?? PRODUCTION_POOL;
    const fromList = validatorRow({
      owner_address: addressHex,
      operator_address: "0xabc",
      voting_power: "111",
      last_epoch_performance: "10/10",
      rewards_growth: 99.98,
      apt_rewards_distributed: 5,
    });

    const resolved = resolveValidatorData({
      addressHex,
      validators: [fromList],
      delegatedStakingPools: [],
      stakePool: {
        operator_address: PRODUCTION_OPERATOR_SHORT,
        active: {value: "999"},
      },
    });

    expect(resolved?.voting_power).toBe("111");
    expect(resolved?.last_epoch_performance).toBe("10/10");
    expect(resolved?.rewards_growth).toBe(99.98);
    expect(resolved?.apt_rewards_distributed).toBe(5);
  });

  it("constructs a row from the indexer pool when the validator was never active", () => {
    const addressHex = tryStandardizeAddress("0xaaa") ?? "0xaaa";
    const resolved = resolveValidatorData({
      addressHex,
      validators: [],
      delegatedStakingPools: [pool("0xaaa", "0xbbb")],
    });

    expect(resolved?.owner_address).toBe(addressHex);
    expect(resolved?.operator_address).toBe(tryStandardizeAddress("0xbbb"));
    expect(resolved?.voting_power).toBe("0");
  });

  it("matches unpadded indexer pool addresses against a standardized URL address", () => {
    const addressHex = PADDED_ONE;
    const resolved = resolveValidatorData({
      addressHex,
      validators: [],
      delegatedStakingPools: [pool("0x1", "0x2")],
    });

    expect(resolved).toBeDefined();
    expect(resolved?.owner_address).toBe(PADDED_ONE);
    expect(resolved?.operator_address).toBe(tryStandardizeAddress("0x2"));
  });

  it("fills a missing list operator from the StakePool resource", () => {
    const addressHex =
      tryStandardizeAddress(PRODUCTION_POOL) ?? PRODUCTION_POOL;
    const fromList = validatorRow({
      owner_address: addressHex,
      operator_address: "",
      voting_power: "111",
    });

    const resolved = resolveValidatorData({
      addressHex,
      validators: [fromList],
      delegatedStakingPools: [],
      stakePool: {
        operator_address: PRODUCTION_OPERATOR_SHORT,
        active: {value: "999"},
      },
    });

    expect(resolved?.operator_address).toBe(
      tryStandardizeAddress(PRODUCTION_OPERATOR_SHORT),
    );
    expect(resolved?.voting_power).toBe("111");
  });

  it("returns undefined when there is no list row, pool, or StakePool", () => {
    expect(
      resolveValidatorData({
        addressHex: PADDED_ONE,
        validators: [],
        delegatedStakingPools: [],
      }),
    ).toBeUndefined();
  });
});

describe("FEAT-VALDEL-001 — addressesEqual", () => {
  it("treats short and long forms of the same address as equal", () => {
    expect(addressesEqual("0x1", PADDED_ONE)).toBe(true);
    expect(addressesEqual("0x1", "0x2")).toBe(false);
    expect(addressesEqual(undefined, "0x1")).toBe(false);
  });
});
