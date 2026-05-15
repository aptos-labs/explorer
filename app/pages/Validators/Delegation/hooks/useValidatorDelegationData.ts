import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useQuery} from "@tanstack/react-query";
import {useMemo} from "react";
import type {Types} from "~/types/aptos";
import {getValidatorCommissionAndState} from "../../../../api";
import type {ResponseError} from "../../../../api/client";
import {useGetDelegatedStakingPoolList} from "../../../../api/hooks";
import {
  useGetValidators,
  type ValidatorData,
} from "../../../../api/hooks/useGetValidators";
import {
  useAptosClient,
  useNetworkName,
} from "../../../../global-config/GlobalConfig";
import {addressFromWallet} from "../../../../utils";
import {
  getBatchDelegatorCounts,
  getBatchUserStakes,
} from "./validatorDataService";

// Extended validator data with additional fields
export interface ValidatorWithExtendedData extends ValidatorData {
  commission: number;
  status: number;
  delegatorCount?: number;
  userStake?: number;
}

/**
 * Custom hook that centralizes all data fetching for the validators delegation table
 * Solves the N+1 query problem by batching requests
 */
export function useValidatorDelegationData() {
  const aptosClient = useAptosClient();
  const networkName = useNetworkName();
  const {validators} = useGetValidators();
  const {connected, account} = useWallet();
  const {delegatedStakingPools, loading: poolsLoading} =
    useGetDelegatedStakingPoolList() ?? [];

  // Calculate processed validators during render instead of using useEffect
  const processedValidators = useMemo(() => {
    if (!poolsLoading) {
      const validatorsInDelegatedStakingPools: ValidatorData[] =
        validators.filter((validator) => {
          return delegatedStakingPools.some(
            (pool) => pool.staking_pool_address === validator.owner_address,
          );
        });

      const delegatedStakingPoolsNotInValidators: ValidatorData[] =
        delegatedStakingPools
          .filter((pool) => {
            return !validators.some(
              (validator) =>
                validator.owner_address === pool.staking_pool_address,
            );
          })
          .map((pool) => ({
            owner_address: pool.staking_pool_address,
            operator_address: pool.current_staking_pool.operator_address,
            voting_power: "0",
            governance_voting_record: "",
            last_epoch: 0,
            last_epoch_performance: "",
            liveness: 0,
            rewards_growth: 0,
            apt_rewards_distributed: 0,
          }));

      return [
        ...validatorsInDelegatedStakingPools,
        ...delegatedStakingPoolsNotInValidators,
      ];
    }
    return [];
  }, [validators, poolsLoading, delegatedStakingPools]);

  // Get validator addresses for batch queries
  const validatorAddresses = processedValidators.map((v) => v.owner_address);

  // Batch fetch validator commission and state
  const {
    data: validatorsWithCommissionAndState,
    isLoading: commissionLoading,
    error: commissionError,
  } = useQuery<Types.MoveValue[], ResponseError>({
    queryKey: [
      "validatorCommisionAndState",
      aptosClient,
      ...validatorAddresses,
    ],
    queryFn: () => {
      return getValidatorCommissionAndState(aptosClient, validatorAddresses);
    },
    enabled: validatorAddresses.length > 0 && !!aptosClient,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    select: (res) => {
      // First arg is always the return value
      const ret = res[0] as Array<[unknown, unknown]>;
      return processedValidators.map((v, i) => {
        const commission = ret[i]?.[0];
        const status = ret[i]?.[1];
        return {
          ...v,
          commission: commission ? Number(commission) / 100 : 0, // commission rate: 22.85% is represented as 2285
          status: status ? Number(status) : 0,
        };
      });
    },
  });

  // Batch fetch delegator counts
  const {
    data: delegatorCounts,
    isLoading: delegatorCountsLoading,
    error: delegatorCountsError,
  } = useQuery({
    queryKey: ["batchDelegatorCounts", validatorAddresses, networkName],
    queryFn: () => {
      return getBatchDelegatorCounts(validatorAddresses, networkName);
    },
    enabled: validatorAddresses.length > 0 && !!aptosClient && !!networkName,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Batch fetch user stakes if wallet is connected
  const accountAddress = addressFromWallet(account?.address);
  const {
    data: userStakes,
    isLoading: userStakesLoading,
    error: userStakesError,
  } = useQuery({
    queryKey: ["batchUserStakes", accountAddress, validatorAddresses],
    queryFn: () => {
      if (!accountAddress) {
        return [];
      }
      return getBatchUserStakes(
        accountAddress,
        validatorAddresses,
        aptosClient,
        networkName,
      );
    },
    enabled:
      connected &&
      !!accountAddress &&
      validatorAddresses.length > 0 &&
      !!aptosClient &&
      !!networkName,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Combine all data. While user stakes are still loading we leave
  // `userStake` undefined so `MyDepositCell` shows its neutral placeholder
  // ("-") instead of briefly flashing "N/A" before the real number arrives.
  const userStakesPending = connected && !!accountAddress && userStakesLoading;
  const combinedValidators: ValidatorWithExtendedData[] =
    validatorsWithCommissionAndState?.map((validator, index) => {
      const validatorObj = validator as unknown as ValidatorData & {
        commission: number;
        status: number;
      };
      const userStake = userStakesPending
        ? undefined
        : (userStakes?.[index] ?? 0);
      return {
        ...validatorObj,
        delegatorCount: delegatorCounts?.[index] || 0,
        userStake,
      };
    }) || [];

  // Determine loading state.
  //
  // Note: user stakes are intentionally NOT part of the gating loading state.
  // Previously, blocking on `userStakesLoading` while it issued ~150 sequential
  // `get_stake` view calls caused the validator list to take up to a minute
  // to appear whenever a wallet was connected. The "My Deposit" column will
  // simply show its default placeholder until the per-user data arrives.
  const isLoading = poolsLoading || commissionLoading || delegatorCountsLoading;

  // Combine errors. We still surface user-stake errors when connected, but
  // they do not block initial render of the validator list.
  const error =
    commissionError ||
    delegatorCountsError ||
    (connected ? userStakesError : undefined);

  return {
    validators: combinedValidators,
    isLoading,
    error,
  };
}
