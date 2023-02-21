import {Types} from "aptos";
import {
  DelegatedStakingActivity,
  useGetDelegatedStakeOperationActivities,
} from "../../api/hooks/useGetDelegatedStakeOperationActivities";

interface AccountResourceData {
  locked_until_secs: bigint;
}

// returns seconds till locked staking funds getting unlocked
export function getLockedUtilSecs(
  accountResource?: Types.MoveResource | undefined,
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
 *    Every time you see WithdrawStakeEvent, subtract from pending_inactive_principal
 *    If at any point during the loop pending_inactive_principal < 0, reset to 0
 *
 * Step 3
 *    Active_rewards = active - Active_principal
 *    Pending_inactive_rewards = pending_inactive - Pending_inactive_principal
 */
export function getStakeOperationPrincipals(
  delegatorAddress: Types.Address,
  poolAddress: Types.Address,
): {stakePrincipals: StakePrincipals | undefined; isLoading: boolean} {
  const result = useGetDelegatedStakeOperationActivities(
    delegatorAddress,
    poolAddress,
  );

  if (result.error) {
    return {stakePrincipals: undefined, isLoading: false};
  } else if (result.loading || !result.activities) {
    return {stakePrincipals: undefined, isLoading: result.loading};
  }

  let activePrincipals = 0;
  let pendingInactivePrincipals = 0;

  const activitiesCopy: DelegatedStakingActivity[] = JSON.parse(
    JSON.stringify(result.activities!),
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
        case "WithdrawStakeEvent":
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
