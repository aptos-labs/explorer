import {Skeleton, Stack, useMediaQuery, useTheme} from "@mui/material";
import * as React from "react";
import HashButton from "../../components/HashButton";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import ContentRowSpaceBetween from "../../components/IndividualPageContent/ContentRowSpaceBetween";
import {HashType} from "../../components/HashButton";
import RewardsPerformanceTooltip from "../Validators/Components/RewardsPerformanceTooltip";
import LastEpochPerformanceTooltip from "../Validators/Components/LastEpochPerformanceTooltip";
import {HexString, Types} from "aptos";
import {useEffect, useState} from "react";
import {useGetMainnetValidators} from "../../api/hooks/useGetMainnetValidators";
import TimeDurationIntervalBar from "./Components/TimeDurationIntervalBar";
import {getLockedUtilSecs} from "./utils";
import {useGetStakingRewardsRate} from "../../api/hooks/useGetStakingRewardsRate";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";
import {
  REWARDS_LEARN_MORE_LINK,
  REWARDS_TOOLTIP_TEXT,
} from "../Validators/Components/Staking";

type ValidatorDetailProps = {
  address: Types.Address;
  accountResource?: Types.MoveResource | undefined;
};

export default function ValidatorDetailCard({
  address,
  accountResource,
}: ValidatorDetailProps) {
  const addressHex = new HexString(address);
  const {validators} = useGetMainnetValidators();
  const {rewardsRateYearly} = useGetStakingRewardsRate();
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const validator = validators.find(
    (validator) => validator.owner_address === addressHex.hex(),
  );
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
        <ContentRowSpaceBetween title="Number of Delegators" value={null} />
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
        <ContentRowSpaceBetween title="Operator Commission" value={null} />
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
