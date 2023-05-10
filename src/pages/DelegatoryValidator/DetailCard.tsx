import {Skeleton, Stack, useMediaQuery, useTheme} from "@mui/material";
import * as React from "react";
import HashButton from "../../components/HashButton";
import ContentBoxSpaceBetween from "../../components/IndividualPageContent/ContentBoxSpaceBetween";
import ContentRowSpaceBetween from "../../components/IndividualPageContent/ContentRowSpaceBetween";
import {HashType} from "../../components/HashButton";
import RewardsPerformanceTooltip from "../Validators/Components/RewardsPerformanceTooltip";
import LastEpochPerformanceTooltip from "../Validators/Components/LastEpochPerformanceTooltip";
import TimeDurationIntervalBar from "./Components/TimeDurationIntervalBar";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";
import {
  REWARDS_LEARN_MORE_LINK,
  REWARDS_TOOLTIP_TEXT,
} from "../Validators/Components/Staking";
import {useGetDelegationState} from "../../api/hooks/useGetDelegationState";
import {useGetDelegationNodeInfo} from "../../api/hooks/useGetDelegationNodeInfo";
import {DelegationStateContext} from "./context/DelegationContext";
import {useContext} from "react";

type ValidatorDetailProps = {
  isSkeletonLoading: boolean;
};

export default function ValidatorDetailCard({
  isSkeletonLoading,
}: ValidatorDetailProps) {
  const {accountResource, validator} = useContext(DelegationStateContext);

  if (!validator || !accountResource) {
    return null;
  }

  const {delegatorBalance, lockedUntilSecs, rewardsRateYearly} =
    useGetDelegationState(accountResource, validator);
  const {commission} = useGetDelegationNodeInfo({
    validatorAddress: validator.owner_address,
  });
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const operatorAddr = validator?.operator_address;
  const rewardGrowth = validator?.rewards_growth;
  const stakePoolAddress = validator?.owner_address;

  return isSkeletonLoading ? (
    validatorDetailCardSkeleton({isOnMobile})
  ) : (
    <Stack direction={isOnMobile ? "column" : "row"} spacing={4}>
      <ContentBoxSpaceBetween width={isOnMobile ? "100%" : "50%"} marginTop={0}>
        <ContentRowSpaceBetween
          title={"Operator"}
          value={
            operatorAddr && (
              <HashButton hash={operatorAddr} type={HashType.ACCOUNT} />
            )
          }
        />
        <ContentRowSpaceBetween
          title="Number of Delegators"
          value={delegatorBalance}
          tooltip={
            <StyledLearnMoreTooltip text="Number of owner accounts who have delegated stake to this stake pool" />
          }
        />
        <ContentRowSpaceBetween
          title="Compound Rewards"
          value={`${rewardsRateYearly}% APR`}
          tooltip={
            <StyledLearnMoreTooltip
              text={REWARDS_TOOLTIP_TEXT}
              link={REWARDS_LEARN_MORE_LINK}
            />
          }
        />
        <ContentRowSpaceBetween
          title="Operator Commission"
          value={commission && `${commission}%`}
          tooltip={
            <StyledLearnMoreTooltip text="% of staking reward paid out to operator as commission" />
          }
        />
      </ContentBoxSpaceBetween>
      <ContentBoxSpaceBetween width={isOnMobile ? "100%" : "50%"} marginTop={0}>
        <ContentRowSpaceBetween
          title={"Stake Pool Address"}
          value={
            stakePoolAddress && (
              <HashButton hash={stakePoolAddress} type={HashType.ACCOUNT} />
            )
          }
        />
        <ContentRowSpaceBetween
          title="Rewards Performance"
          value={rewardGrowth ? `${rewardGrowth.toFixed(2)} %` : null}
          tooltip={<RewardsPerformanceTooltip />}
        />
        <ContentRowSpaceBetween
          title="Last Epoch Performance"
          value={validator ? validator.last_epoch_performance : null}
          tooltip={<LastEpochPerformanceTooltip />}
        />
        <ContentRowSpaceBetween
          title="Next Unlock"
          value={
            <TimeDurationIntervalBar timestamp={Number(lockedUntilSecs)} />
          }
          tooltip={
            <StyledLearnMoreTooltip text="When tokens will be available for removal from the stake pool" />
          }
        />
      </ContentBoxSpaceBetween>
    </Stack>
  );
}

function validatorDetailCardSkeleton({isOnMobile}: {isOnMobile: boolean}) {
  return (
    <Stack direction={isOnMobile ? "column" : "row"} spacing={4}>
      <ContentBoxSpaceBetween width={isOnMobile ? "100%" : "50%"} marginTop={0}>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
      </ContentBoxSpaceBetween>
      <ContentBoxSpaceBetween width={isOnMobile ? "100%" : "50%"} marginTop={0}>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
      </ContentBoxSpaceBetween>
    </Stack>
  );
}
