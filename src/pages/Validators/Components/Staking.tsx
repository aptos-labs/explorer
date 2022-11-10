import React from "react";
import MetricSection from "./MetricSection";
import Subtitle from "./Text/Subtitle";
import Body from "./Text/Body";
import {Stack} from "@mui/material";
import {useGetValidatorSet} from "../../../api/hooks/useGetValidatorSet";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {useGetStakingRewardsRate} from "../../../api/hooks/useGetStakingRewardsRate";
import {StyledLearnMoreTooltip} from "../../../components/StyledTooltip";

const REWARDS_TOOLTIP_TEXT =
  "Represents the Annual Percentage Yield (APY) that accrue as compound interest on staked APT. Rewards are paid out by the network after each Epoch.";
const REWARDS_LEARN_MORE_LINK = "https://aptos.dev/concepts/staking#rewards";

export default function Staking() {
  const {totalVotingPower} = useGetValidatorSet();
  const {rewardsRateYearly} = useGetStakingRewardsRate();

  return (
    <MetricSection>
      <Stack direction="row" spacing={0.7} alignItems="center">
        <Subtitle>
          {totalVotingPower
            ? getFormattedBalanceStr(totalVotingPower.toString(), undefined, 0)
            : "-"}
        </Subtitle>
        <Body color="inherit">Staked</Body>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Body>{`${rewardsRateYearly}% APY Reward`}</Body>{" "}
        <StyledLearnMoreTooltip
          text={REWARDS_TOOLTIP_TEXT}
          link={REWARDS_LEARN_MORE_LINK}
        />
      </Stack>
    </MetricSection>
  );
}
