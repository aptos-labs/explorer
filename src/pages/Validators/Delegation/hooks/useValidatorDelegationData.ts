import {useState, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {Types} from "aptos";
import {useGlobalState} from "../../../../global-config/GlobalConfig";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {
  ValidatorData,
  useGetValidators,
} from "../../../../api/hooks/useGetValidators";
import {useGetDelegatedStakingPoolList} from "../../../../api/hooks/delegations";
import {getValidatorCommissionAndState} from "../../../../api";
import {ResponseError} from "../../../../api/client";
import {MoveValue} from "aptos/src/generated";
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
  const [state] = useGlobalState();
  const {validators} = useGetValidators();
  const {connected, account} = useWallet();
  const {delegatedStakingPools, loading: poolsLoading} =
    useGetDelegatedStakingPoolList() ?? [];

  // State for processed validators
  const [processedValidators, setProcessedValidators] = useState<
    ValidatorData[]
  >([]);

  // Process validators and delegation pools
  useEffect(() => {
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

      setProcessedValidators([
        ...validatorsInDelegatedStakingPools,
        ...delegatedStakingPoolsNotInValidators,
      ]);
    }
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
      state.aptos_client,
      ...validatorAddresses,
    ],
    queryFn: () => {
      return getValidatorCommissionAndState(
        state.aptos_client,
        validatorAddresses,
      );
    },
    enabled: validatorAddresses.length > 0 && !!state.aptos_client,
    select: (res: MoveValue[]) => {
      // First arg is always the return value
      const ret = res[0] as [MoveValue, MoveValue][];
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
    queryKey: ["batchDelegatorCounts", validatorAddresses, state.network_name],
    queryFn: () => {
      return getBatchDelegatorCounts(
        validatorAddresses,
        state.aptos_client,
        state.network_name,
      );
    },
    enabled:
      validatorAddresses.length > 0 &&
      !!state.aptos_client &&
      !!state.network_name,
  });

  // Batch fetch user stakes if wallet is connected
  const {
    data: userStakes,
    isLoading: userStakesLoading,
    error: userStakesError,
  } = useQuery({
    queryKey: ["batchUserStakes", account?.address, validatorAddresses],
    queryFn: () => {
      if (!account?.address) {
        return [];
      }
      return getBatchUserStakes(
        account.address,
        validatorAddresses,
        state.aptos_client,
      );
    },
    enabled:
      connected &&
      !!account?.address &&
      validatorAddresses.length > 0 &&
      !!state.aptos_client,
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
