import {Grid, Stack} from "@mui/material";
import {useParams} from "react-router-dom";
import PageHeader from "../layout/PageHeader";
import ValidatorTitle from "./Title";
import ValidatorDetailCard from "./DetailCard";
import ValidatorStakingBar from "./StakingBar";
import {HexString} from "aptos";
import {
  useGetValidators,
  ValidatorData,
} from "../../api/hooks/useGetValidators";
import MyDepositsSection from "./MyDepositsSection";
import {useGetAccountResource} from "../../api/hooks/useGetAccountResource";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {SkeletonTheme} from "react-loading-skeleton";
import {useGetValidatorPageSkeletonLoading} from "../../api/hooks/useGetValidatorPageSkeletonLoading";
import {DelegationStateContext} from "./context/DelegationContext";
import {useGetDelegatedStakingPoolList} from "../../api/hooks/useGetDelegatedStakingPoolList";
import {useEffect, useMemo, useState} from "react";
import Error from "../Account/Error";

export default function ValidatorPage() {
  const address = useParams().address ?? "";
  const addressHex = useMemo(() => new HexString(address), [address]);
  const {validators} = useGetValidators();
  const {connected} = useWallet();
  const {data: accountResource, error} = useGetAccountResource(
    addressHex.hex(),
    "0x1::stake::StakePool",
  );
  const {
    setIsMyDepositsSectionSkeletonLoading,
    setIsStakingBarSkeletonLoading,
    isSkeletonLoading,
  } = useGetValidatorPageSkeletonLoading();

  const {delegatedStakingPools, loading} =
    useGetDelegatedStakingPoolList() ?? [];

  const [delegationValidator, setDelegationValidator] =
    useState<ValidatorData>();
  const validator = validators.find(
    (validator) => validator.owner_address === addressHex.hex(),
  );

  useEffect(() => {
    if (!loading) {
      // If the validator is not in the list of validators, it means that the validator was never active.
      // In this case, we need to get the validator data from the delegated staking pools list and manually
      // populate required fields.
      const delegatedStakingPoolsNotInValidators: ValidatorData[] =
        delegatedStakingPools
          .filter((pool) => {
            return addressHex.hex() === pool.staking_pool_address;
          })
          .map((pool) => ({
            owner_address: pool.staking_pool_address,
            operator_address: pool.current_staking_pool.operator_address,
            voting_power: validator?.voting_power ?? "0",
            governance_voting_record: validator?.governance_voting_record ?? "",
            last_epoch: validator?.last_epoch ?? 0,
            last_epoch_performance: validator?.last_epoch_performance ?? "",
            liveness: validator?.liveness ?? 0,
            rewards_growth: validator?.rewards_growth ?? 0,
            apt_rewards_distributed: validator?.apt_rewards_distributed ?? 0,
          }));

      setDelegationValidator(
        delegatedStakingPoolsNotInValidators.length > 0
          ? delegatedStakingPoolsNotInValidators[0]
          : undefined,
      );
    }
  }, [delegatedStakingPools, loading, validators, validator, addressHex]);

  if (error) {
    return <Error error={error} />;
  }

  if ((!validator && !delegationValidator) || !accountResource) {
    return null;
  }

  return (
    <DelegationStateContext.Provider
      value={{
        accountResource,
        validator: validator ? validator : delegationValidator,
      }}
    >
      <SkeletonTheme>
        <Grid container>
          <PageHeader />
          <Grid item xs={12}>
            <Stack direction="column" spacing={4}>
              <ValidatorTitle
                address={address}
                isSkeletonLoading={isSkeletonLoading}
              />
              <ValidatorStakingBar
                setIsStakingBarSkeletonLoading={setIsStakingBarSkeletonLoading}
                isSkeletonLoading={isSkeletonLoading}
              />
              <ValidatorDetailCard isSkeletonLoading={isSkeletonLoading} />
              {connected && (
                <MyDepositsSection
                  setIsMyDepositsSectionSkeletonLoading={
                    setIsMyDepositsSectionSkeletonLoading
                  }
                  isSkeletonLoading={isSkeletonLoading}
                />
              )}
            </Stack>
          </Grid>
        </Grid>
      </SkeletonTheme>
    </DelegationStateContext.Provider>
  );
}
