import {Skeleton, Stack, useMediaQuery, useTheme} from "@mui/material";
import * as React from "react";
import HashButton from "../../components/HashButton";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import ContentRowSpaceBetween from "../../components/IndividualPageContent/ContentRowSpaceBetween";
import {HashType} from "../../components/HashButton";
import RewardsPerformanceTooltip from "../Validators/Components/RewardsPerformanceTooltip";
import LastEpochPerformanceTooltip from "../Validators/Components/LastEpochPerformanceTooltip";
import {Types} from "aptos";
import {useEffect, useState} from "react";
import {ValidatorData} from "../../api/hooks/useGetValidators";
import TimeDurationIntervalBar from "./Components/TimeDurationIntervalBar";
import {getLockedUtilSecs} from "./utils";
import {useGetStakingRewardsRate} from "../../api/hooks/useGetStakingRewardsRate";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";
import {
  REWARDS_LEARN_MORE_LINK,
  REWARDS_TOOLTIP_TEXT,
} from "../Validators/Components/Staking";
import {useGetDelegationNodeInfo} from "../../api/hooks/useGetDelegationNodeInfo";

type ValidatorDetailProps = {
  validator: ValidatorData;
  accountResource?: Types.MoveResource | undefined;
};

export default function ValidatorDetailCard({
  validator,
  accountResource,
}: ValidatorDetailProps) {
  const {rewardsRateYearly} = useGetStakingRewardsRate();
  const {commission} = useGetDelegationNodeInfo({
    validatorAddress: validator.owner_address,
    validator,
  });
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const [isSkeletonLoading, setIsSkeletonLoading] = useState<boolean>(true);

  const lockedUntilSecs = getLockedUtilSecs(accountResource);
  const operatorAddr = validator?.operator_address;
  const rewardGrowth = validator?.rewards_growth;
  const stakePoolAddress = validator?.owner_address;

  useEffect(() => {
    if (lockedUntilSecs && operatorAddr && rewardGrowth && stakePoolAddress) {
      setIsSkeletonLoading(false);
    }
  }, [lockedUntilSecs, operatorAddr, rewardGrowth, stakePoolAddress]);

  return isSkeletonLoading ? (
    validatorDetailCardSkeleton({isOnMobile})
  ) : (
    <Stack direction={isOnMobile ? "column" : "row"} spacing={4}>
      <ContentBox width={isOnMobile ? "100%" : "50%"} marginTop={0}>
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
          value={null}
          tooltip={
            <StyledLearnMoreTooltip text="Number of owner accounts who have delegated stake to this stake pool" />
          }
        />
        <ContentRowSpaceBetween
          title="Compound Rewards"
          value={`${rewardsRateYearly}% APY`}
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
      </ContentBox>
      <ContentBox width={isOnMobile ? "100%" : "50%"} marginTop={0}>
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
      </ContentBox>
    </Stack>
  );
}

function validatorDetailCardSkeleton({isOnMobile}: {isOnMobile: boolean}) {
  return (
    <Stack direction={isOnMobile ? "column" : "row"} spacing={4}>
      <ContentBox width={isOnMobile ? "100%" : "50%"} marginTop={0}>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
      </ContentBox>
      <ContentBox width={isOnMobile ? "100%" : "50%"} marginTop={0}>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
      </ContentBox>
    </Stack>
  );
}
