import {Skeleton, Stack} from "@mui/material";
import {useGetStakingRewardsRate} from "../../../api/hooks/useGetStakingRewardsRate";
import {useGetValidatorSet} from "../../../api/hooks/useGetValidatorSet";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {StyledLearnMoreTooltip} from "../../../components/StyledTooltip";
import {englishT, useTranslation} from "../../../i18n";
import MetricSection from "./MetricSection";
import Body from "./Text/Body";
import Subtitle from "./Text/Subtitle";

export const REWARDS_TOOLTIP_TEXT = englishT("staking.rewardsAprTip");
export const REWARDS_LEARN_MORE_LINK =
  "https://aptos.dev/en/network/blockchain/staking#rewards";

type StakingProps = {
  isSkeletonLoading: boolean;
};

export default function Staking({isSkeletonLoading}: StakingProps) {
  const {t} = useTranslation();
  const {totalVotingPower} = useGetValidatorSet();
  const {rewardsRateYearly} = useGetStakingRewardsRate();

  return !isSkeletonLoading ? (
    <MetricSection>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
        }}
      >
        <Subtitle>
          {totalVotingPower
            ? getFormattedBalanceStr(totalVotingPower, undefined, 0)
            : "-"}
        </Subtitle>
        <Body color="inherit">{t("staking.aptStaked")}</Body>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
        }}
      >
        <Body>{t("staking.aprReward", {rate: String(rewardsRateYearly)})}</Body>{" "}
        <StyledLearnMoreTooltip
          text={t("staking.rewardsAprTip")}
          link={REWARDS_LEARN_MORE_LINK}
        />
      </Stack>
    </MetricSection>
  ) : (
    <MetricSection>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
        }}
      >
        <Skeleton width={190} />
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
        }}
      >
        <Skeleton width={150} />
      </Stack>
    </MetricSection>
  );
}
