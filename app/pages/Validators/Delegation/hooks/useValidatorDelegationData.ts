import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {Types} from "aptos";
import {
  useAptosClient,
  useNetworkName,
} from "../../../../global-config/GlobalConfig";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {
  ValidatorData,
  useGetValidators,
} from "../../../../api/hooks/useGetValidators";
import {useGetDelegatedStakingPoolList} from "../../../../api/hooks";
import {getValidatorCommissionAndState} from "../../../../api";
import {ResponseError} from "../../../../api/client";
import {
  getBatchDelegatorCounts,
  getBatchUserStakes,
} from "./validatorDataService";
import {addressFromWallet} from "../../../../utils";

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
    // Cache for 30 seconds to reduce API calls
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
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
      return getBatchDelegatorCounts(
        validatorAddresses,
        aptosClient,
        networkName,
      );
    },
    enabled: validatorAddresses.length > 0 && !!aptosClient && !!networkName,
    // Cache for 30 seconds to reduce API calls
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
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
      );
    },
    enabled:
      connected &&
      !!accountAddress &&
      validatorAddresses.length > 0 &&
      !!aptosClient,
    // Cache for 10 seconds (user stakes change more frequently)
    staleTime: 10 * 1000,
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
  });

  // Combine all data
  const combinedValidators: ValidatorWithExtendedData[] =
    validatorsWithCommissionAndState?.map((validator, index) => {
      // Ensure validator is treated as an object before spreading
      const validatorObj = validator as unknown as ValidatorData & {
        commission: number;
        status: number;
      };
      return {
        ...validatorObj,
        delegatorCount: delegatorCounts?.[index] || 0,
        userStake: userStakes?.[index] || 0,
      };
    }) || [];

  // Determine loading state
  const isLoading =
    poolsLoading ||
    commissionLoading ||
    delegatorCountsLoading ||
    (connected && userStakesLoading);

  // Combine errors
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
