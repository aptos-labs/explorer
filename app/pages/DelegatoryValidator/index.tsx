import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {Grid, Skeleton, Stack} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import {useMemo} from "react";
import {ResponseErrorType} from "../../api/client";
import {
  useGetDelegatedStakingPoolList,
  useGetDelegationNodeCommissionChange,
  useGetDelegationNodeInfo,
} from "../../api/hooks/delegations";
import {useGetAccountResource} from "../../api/hooks/useGetAccountResource";
import {useGetValidatorPageSkeletonLoading} from "../../api/hooks/useGetValidatorPageSkeletonLoading";
import {useGetValidators} from "../../api/hooks/useGetValidators";
import {moveResourceData, toMoveResource} from "../../api/moveResource";
import {Banner} from "../../components/Banner";
import {tryStandardizeAddress} from "../../utils";
import AccountError from "../Account/Error";
import PageHeader from "../layout/PageHeader";
import {DelegationStateContext} from "./context/DelegationContext";
import ValidatorDetailCard from "./DetailCard";
import MyDepositsSection from "./MyDepositsSection";
import {
  type StakePoolResourceData,
  resolveValidatorData,
} from "./resolveValidatorData";
import ValidatorStakingBar from "./StakingBar";
import ValidatorTitle from "./Title";

export default function ValidatorPage() {
  const params = useParams({strict: false}) as {address?: string};
  const address = params?.address ?? "";
  const addressHex = useMemo(() => tryStandardizeAddress(address), [address]);
  const {validators} = useGetValidators();
  const {connected} = useWallet();
  const {
    data: accountResource,
    error,
    isLoading,
  } = useGetAccountResource(addressHex, "0x1::stake::StakePool");
  const {
    setIsMyDepositsSectionSkeletonLoading,
    setIsStakingBarSkeletonLoading,
    isSkeletonLoading,
  } = useGetValidatorPageSkeletonLoading();

  const {delegatedStakingPools = []} = useGetDelegatedStakingPoolList();

  const validator = useMemo(
    () =>
      addressHex
        ? resolveValidatorData({
            addressHex,
            validators,
            delegatedStakingPools,
            stakePool: moveResourceData<StakePoolResourceData>(accountResource),
          })
        : undefined,
    [addressHex, validators, delegatedStakingPools, accountResource],
  );

  const validatorAddress = validator?.owner_address ?? addressHex ?? "";
  const {commission} = useGetDelegationNodeInfo({
    validatorAddress,
  });
  const {nextCommission} = useGetDelegationNodeCommissionChange({
    validatorAddress,
  });

  if (!addressHex) {
    return (
      <AccountError
        error={{
          type: ResponseErrorType.INVALID_INPUT,
          message: "Invalid validator address.",
        }}
      />
    );
  }

  if (error) {
    return <AccountError error={error} />;
  }

  if (isLoading) {
    return (
      <Grid container>
        <PageHeader />
        <Grid size={{xs: 12}}>
          <Stack direction="column" spacing={4}>
            <ValidatorTitle address={addressHex} isSkeletonLoading />
            <Skeleton variant="rounded" height={88} />
            <Skeleton variant="rounded" height={200} />
          </Stack>
        </Grid>
      </Grid>
    );
  }

  if (!validator || !accountResource) {
    return (
      <AccountError
        error={{
          type: ResponseErrorType.NOT_FOUND,
          message:
            "This address does not have a 0x1::stake::StakePool resource.",
        }}
        notFoundTitle="Validator Not Found"
        notFoundMessage="This address does not have a 0x1::stake::StakePool resource."
      />
    );
  }

  return (
    <DelegationStateContext.Provider
      value={{
        accountResource: toMoveResource(
          "0x1::stake::StakePool",
          accountResource,
        ),
        validator,
      }}
    >
      <Grid container>
        <PageHeader />
        <Grid size={{xs: 12}}>
          <Stack direction="column" spacing={4}>
            <ValidatorTitle
              address={addressHex}
              isSkeletonLoading={isSkeletonLoading}
            />
            {nextCommission && commission !== nextCommission && (
              <Banner
                pillText="INFO"
                pillColor="warning"
                sx={{marginBottom: 2}}
              >
                The current commission rate is {commission}%. The commission
                rate will be updated to {nextCommission}% at the current lockup
                period.
              </Banner>
            )}

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
    </DelegationStateContext.Provider>
  );
}
