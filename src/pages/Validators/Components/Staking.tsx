import React from "react";
import MetricSection from "./MetricSection";
import Subtitle from "./Text/Subtitle";
import Body from "./Text/Body";
import {Skeleton, Stack} from "@mui/material";
import {useGetValidatorSet} from "../../../api/hooks/useGetValidatorSet";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {useGetStakingRewardsRate} from "../../../api/hooks/useGetStakingRewardsRate";
import {StyledLearnMoreTooltip} from "../../../components/StyledTooltip";

export const REWARDS_TOOLTIP_TEXT =
  "Represents the Annual Percentage Yield (APY) that accrue as compound interest on staked APT. Rewards are paid out by the network after each Epoch.APY is subject to change based on validator performance or in accordance with network specifications. There is no guarantee that the current APY will continue to apply in future periods.";
export const REWARDS_LEARN_MORE_LINK =
  "https://aptos.dev/concepts/staking#rewards";

type StakingProps = {
  isSkeletonLoading: boolean;
};

export default function Staking({isSkeletonLoading}: StakingProps) {
  const {totalVotingPower} = useGetValidatorSet();
  const {rewardsRateYearly} = useGetStakingRewardsRate();

  return !isSkeletonLoading ? (
    <MetricSection>
      <Stack direction="row" spacing={1} alignItems="center">
        <Subtitle>
          {totalVotingPower
            ? getFormattedBalanceStr(totalVotingPower, undefined, 0)
            : "-"}
        </Subtitle>
        <Body color="inherit">APT Staked</Body>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Body>{`${rewardsRateYearly}% APY Reward`}</Body>{" "}
        <StyledLearnMoreTooltip
          text={REWARDS_TOOLTIP_TEXT}
          link={REWARDS_LEARN_MORE_LINK}
        />
      </Stack>
    </MetricSection>
  ) : (
    <MetricSection>
      <Stack direction="row" spacing={1} alignItems="center">
        <Skeleton width={190} />
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Skeleton width={150} />
      </Stack>
    </MetricSection>
  );
}
