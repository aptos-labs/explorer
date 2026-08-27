import type {DelegatedStakingPool} from "../../api/hooks/delegations";
import {
  isOperatorAddressMissing,
  type ValidatorData,
} from "../../api/hooks/useGetValidators";
import {tryStandardizeAddress} from "../../utils";

/** Fields read from `0x1::stake::StakePool` when the validator lists are empty. */
export type StakePoolResourceData = {
  operator_address?: string;
  active?: {value?: string};
};

export function addressesEqual(
  left: string | undefined,
  right: string | undefined,
): boolean {
  const a = tryStandardizeAddress(left);
  const b = tryStandardizeAddress(right);
  return !!a && a === b;
}

function findValidatorByOwner(
  addressHex: string,
  validators: readonly ValidatorData[],
): ValidatorData | undefined {
  return validators.find((validator) =>
    addressesEqual(validator.owner_address, addressHex),
  );
}

function findDelegationPool(
  addressHex: string,
  pools: readonly DelegatedStakingPool[],
): DelegatedStakingPool | undefined {
  return pools.find((pool) =>
    addressesEqual(pool.staking_pool_address, addressHex),
  );
}

function emptyValidatorData(
  addressHex: string,
  operatorAddress: string,
  votingPower: string,
): ValidatorData {
  return {
    owner_address: addressHex,
    operator_address: operatorAddress,
    voting_power: votingPower,
    governance_voting_record: "",
    last_epoch: 0,
    last_epoch_performance: "",
    liveness: 0,
    apt_rewards_distributed: 0,
  };
}

/**
 * Builds the validator row shown on `/validator/$address`.
 *
 * The page must not depend on `useGetValidators()` or the indexer pool list
 * being populated: those sources can be empty while the on-chain StakePool
 * resource is already available (ValidatorSet still loading, stats merge
 * returns [], indexer 429). Prefer list stats when present, then the
 * indexer pool, then the StakePool resource itself.
 *
 * @internal Exported for unit tests (FEAT-VALDEL-001).
 */
export function resolveValidatorData({
  addressHex,
  validators,
  delegatedStakingPools,
  stakePool,
}: {
  addressHex: string;
  validators: readonly ValidatorData[];
  delegatedStakingPools: readonly DelegatedStakingPool[];
  stakePool?: StakePoolResourceData | undefined;
}): ValidatorData | undefined {
  const fromList = findValidatorByOwner(addressHex, validators);
  const pool = findDelegationPool(addressHex, delegatedStakingPools);
  const stakePoolOperator = tryStandardizeAddress(stakePool?.operator_address);
  const poolOperator = tryStandardizeAddress(
    pool?.current_staking_pool.operator_address,
  );
  const listOperator = isOperatorAddressMissing(fromList?.operator_address)
    ? undefined
    : tryStandardizeAddress(fromList?.operator_address);
  const operator =
    listOperator ?? poolOperator ?? stakePoolOperator ?? addressHex;
  const votingPower = fromList?.voting_power ?? stakePool?.active?.value ?? "0";

  if (fromList) {
    return {
      ...fromList,
      owner_address: addressHex,
      operator_address: operator,
      voting_power: votingPower,
    };
  }

  if (pool) {
    return {
      ...emptyValidatorData(addressHex, operator, votingPower),
      operator_address: operator,
    };
  }

  if (stakePool) {
    return emptyValidatorData(addressHex, operator, votingPower);
  }

  return undefined;
}
