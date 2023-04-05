import {Grid, Stack} from "@mui/material";
import * as React from "react";
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
import {useEffect, useState} from "react";

export default function ValidatorPage() {
  const address = useParams().address ?? "";
  const addressHex = new HexString(address);
  const {validators} = useGetValidators();
  const {connected} = useWallet();
  const {data: accountResource} = useGetAccountResource(
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

  const [validator, setValidator] = useState<ValidatorData>();

  useEffect(() => {
    let validator = validators.find(
      (validator) => validator.owner_address === addressHex.hex(),
    );
    if (!loading && !validator) {
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
            voting_power: "0",
            governance_voting_record: "",
            last_epoch: 0,
            last_epoch_performance: "",
            liveness: 0,
            rewards_growth: 0,
            apt_rewards_distributed: 0,
          }));

      setValidator(
        delegatedStakingPoolsNotInValidators.length > 0
          ? delegatedStakingPoolsNotInValidators[0]
          : undefined,
      );
    }
  }, [delegatedStakingPools, loading, validators]);

  if (!validator || !accountResource) {
    return null;
  }

  return (
    <DelegationStateContext.Provider value={{accountResource, validator}}>
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
