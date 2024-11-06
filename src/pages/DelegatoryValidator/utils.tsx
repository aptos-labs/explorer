import {DelegatedStakingActivity} from "../../api/hooks/useGetDelegatedStakeOperationActivities";
import {StakeOperation} from "../../api/hooks/useSubmitStakeOperation";
import {OCTA} from "../../constants";
import {
  MINIMUM_APT_IN_POOL_FOR_EXPLORER,
  MINIMUM_APT_IN_POOL,
} from "./constants";
import {ApolloError} from "@apollo/client";
import {MoveResource, MoveValue} from "@aptos-labs/ts-sdk";

interface AccountResourceData {
  locked_until_secs: bigint;
}

// returns seconds till locked staking funds getting unlocked
export function getLockedUtilSecs(
  accountResource?: MoveResource | undefined,
): bigint | null {
  return accountResource
    ? BigInt((accountResource.data as AccountResourceData).locked_until_secs)
    : null;
}

export type StakePrincipals = {
  activePrincipals: number;
  pendingInactivePrincipals: number;
};

/**
 *
 * @param delegatorAddress
 * @param poolAddress
 * @returns stakePrincipals: active stake principal, pending_inactive stake principal
 *          isLoading
 *
 * Step 1:
 *    get total amount of (active, inactive, pending_inactive) from `get_stake` SC delegation_pool view function
 *
 * Step 2:
 *    Calculate “principal”
 *
 *    Active_principal
 *    Loop through all events in sequence (transaction_version asc, event_index asc)
 *    Maintain a current active_principal variable, start with 0
 *    Every time you see AddStakeEvent, add to active_principal
 *    Every time you see UnlockStakeEvent, subtract from active_principal
 *    Every time you see ReactivateStakeEvent, add to active_principal
 *    If at any point during the loop active_principal < 0, reset to 0
 *
 *    Pending_inactive_principal
 *    Loop through all events in sequence (transaction_version asc, event_index asc)
 *    Maintain a current pending_inactive_principal variable, start with 0
 *    Every time you see UnlockStakeEvent, add to pending_inactive_principal
 *    Every time you see ReactivateStakeEvent, subtract from pending_inactive_principal
 *    If at any point during the loop pending_inactive_principal < 0, reset to 0
 *
 * Step 3
 *    Active_rewards = active - Active_principal
 *    Pending_inactive_rewards = pending_inactive - Pending_inactive_principal
 */
export function getStakeOperationPrincipals(activities: {
  activities: DelegatedStakingActivity[] | undefined;
  loading: boolean;
  error: ApolloError | undefined;
}) {
  if (activities.error) {
    return {stakePrincipals: undefined, isLoading: false};
  } else if (activities.loading || !activities.activities) {
    return {stakePrincipals: undefined, isLoading: activities.loading};
  }

  let activePrincipals = 0;
  let pendingInactivePrincipals = 0;

  const activitiesCopy: DelegatedStakingActivity[] = JSON.parse(
    JSON.stringify(activities.activities!),
  );

  activitiesCopy
    .sort(
      (a, b) => Number(a.transaction_version) - Number(b.transaction_version),
    )
    .map((activity: DelegatedStakingActivity) => {
      const eventType = activity.event_type.split("::")[2];
      const amount = activity.amount;
      switch (eventType) {
        case "AddStakeEvent":
          activePrincipals += amount;
          break;
        case "UnlockStakeEvent":
          activePrincipals -= amount;
          pendingInactivePrincipals += amount;
          break;
        case "ReactivateStakeEvent":
          activePrincipals += amount;
          pendingInactivePrincipals -= amount;
          break;
      }
      activePrincipals = activePrincipals < 0 ? 0 : activePrincipals;
      pendingInactivePrincipals =
        pendingInactivePrincipals < 0 ? 0 : pendingInactivePrincipals;
    });

  return {
    stakePrincipals: {activePrincipals, pendingInactivePrincipals},
    isLoading: false,
  };
}

/**
 * There are two pools we’re enforcing this restriction, active pool and pending_inactive pool. When we stake, our fund will eventually move to active pool, when we unlock, our fund will move to pending_inactive pool.
 * The general theme is that if it’s adding APT to the pool, 10 min APT is hard enforced; if it’s taking APT out of the pool, 10 min APT is soft enforced, meaning that if 10min APT’s not met, we will forcefully take every APT out and pool balance is 0.
 *
 * STAKE (fund moves to active pool):
 * We need to hard enforce 10 min APT in active pool. On UX, the enforced APT amount will certainly change every time, since we are enforcing the 10 APT at the active pool level. i.e. when there’s 0 in active pool, user has to stake at least 10 APT after add_stake fee, meaning that the limit we wanna display on UX could be 11 APT. Then next time user decides to stake again, there’s no limit at all because active pool already has 10 APTs in it.
 *
 * UNLOCK (fund moves from active to pending_inactive pool):
 * We need to hard enforce the 10 minimum APT in the pending_inactive pool. The min APT users can unlock will need to meet the following condition:
 * condition 1: current APT in active pool - unlock amount “should” be greater than 10. I use “should” here because if condition 1’s not met, all funds in the active pool will be unlocked.
 * condition 2: current APT in pending_inactive pool + unlock amount has to be greater than 10 APT
 * One example here to make it clear: Bob has 26 APT in active and has not unlocked anything. If Bob wants to unlock, they have to unlock at least 10 APT and at most 16 APT. If they unlock > 16 APT, all 26 APT will become unlocked (because there'd be < 10 APT remaining in active balances)
 *
 * REACTIVATE (fund moves from pending_inactive to active pool):
 * We need to hard enforce the 10 minimum APT in the pending_inactive as well as active pool. Similar to unlock, the min APT users can reactivate will need to meet the following condition
 * condition 1: current APT in pending_inactive pool - reactivate amount “should” be greater than 10 APT. If condition 1’s not met, all funds in pending_inactive pool will be reactivated.
 * condition 2: current APT in active pool + reactivate amount has to be greater than 10 APT.
 */

export type APTRequirement = {
  min: number | null;
  suggestedMax: number | null;
  max: number | null;
  disabled: boolean;
};

export function getStakeOperationAPTRequirement(
  stakes: MoveValue[],
  stakeOperation: StakeOperation,
  balance: number,
): APTRequirement {
  const active = Number(stakes[0]) / OCTA;
  const pending_inactive = Number(stakes[2]) / OCTA;

  switch (stakeOperation) {
    case StakeOperation.STAKE: {
      const min =
        MINIMUM_APT_IN_POOL_FOR_EXPLORER - active <= 0
          ? 0
          : MINIMUM_APT_IN_POOL_FOR_EXPLORER - active;
      const suggestedMax = null;
      const max = balance / OCTA;
      return {
        min,
        suggestedMax,
        max,
        disabled: min > max && max < MINIMUM_APT_IN_POOL,
      };
    }
    case StakeOperation.UNLOCK: {
      const min =
        pending_inactive < MINIMUM_APT_IN_POOL
          ? MINIMUM_APT_IN_POOL - pending_inactive
          : 0;
      const suggestedMax =
        active > MINIMUM_APT_IN_POOL && active - MINIMUM_APT_IN_POOL > min
          ? active - MINIMUM_APT_IN_POOL
          : null;
      const max = active;
      return {
        min,
        suggestedMax,
        max,
        disabled: min > max || max < MINIMUM_APT_IN_POOL,
      };
    }
    case StakeOperation.REACTIVATE: {
      const min =
        MINIMUM_APT_IN_POOL > active ? MINIMUM_APT_IN_POOL - active : 0;
      const suggestedMax =
        MINIMUM_APT_IN_POOL < pending_inactive &&
        pending_inactive - MINIMUM_APT_IN_POOL > min
          ? pending_inactive - MINIMUM_APT_IN_POOL
          : null;
      const max = pending_inactive;
      return {
        min,
        suggestedMax,
        max,
        disabled: min > max || max < MINIMUM_APT_IN_POOL,
      };
    }
    default:
      return {
        min: null,
        suggestedMax: null,
        max: null,
        disabled: false,
      };
  }
}

export type ValidatorStatus =
  | "Pending Active"
  | "Active"
  | "Pending Inactive"
  | "Inactive";

export function getValidatorStatus(
  validatorStatus: number,
): ValidatorStatus | undefined {
  switch (validatorStatus) {
    case 1:
      return "Pending Active";
    case 2:
      return "Active";
    case 3:
      return "Pending Inactive";
    case 4:
      return "Inactive";
    default:
      return undefined;
  }
}

export function calculateNetworkPercentage(
  validatorVotingPower: string,
  totalVotingPower: string | null,
): string {
  return (
    (parseInt(validatorVotingPower!, 10) / parseInt(totalVotingPower!, 10)) *
    100
  ).toFixed(2);
}
