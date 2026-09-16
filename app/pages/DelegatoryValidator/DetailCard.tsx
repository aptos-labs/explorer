import {Skeleton, Stack, useMediaQuery, useTheme} from "@mui/material";
import {useContext} from "react";
import type {Types} from "~/types/aptos";
import {
  useGetDelegationNodeInfo,
  useGetDelegationState,
} from "../../api/hooks/delegations";
import type {ValidatorData} from "../../api/hooks/useGetValidators";
import HashButton, {HashType} from "../../components/HashButton";
import ContentBoxSpaceBetween from "../../components/IndividualPageContent/ContentBoxSpaceBetween";
import ContentRowSpaceBetween from "../../components/IndividualPageContent/ContentRowSpaceBetween";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";
import LastEpochPerformanceTooltip from "../Validators/Components/LastEpochPerformanceTooltip";
import RewardsPerformanceTooltip from "../Validators/Components/RewardsPerformanceTooltip";
import {REWARDS_LEARN_MORE_LINK} from "../Validators/Components/Staking";
import TimeDurationIntervalBar from "./Components/TimeDurationIntervalBar";
import {DelegationStateContext} from "./context/DelegationContext";
import {useTranslation} from "../../i18n";

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

  return (
    <ValidatorDetailCardContent
      isSkeletonLoading={isSkeletonLoading}
      accountResource={accountResource}
      validator={validator}
    />
  );
}

function ValidatorDetailCardContent({
  isSkeletonLoading,
  accountResource,
  validator,
}: ValidatorDetailProps & {
  accountResource: Types.MoveResource;
  validator: ValidatorData;
}) {
  const {t, formatNumber} = useTranslation();
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const {commission} = useGetDelegationNodeInfo({
    validatorAddress: validator?.owner_address,
  });
  const {delegatorBalance, lockedUntilSecs, rewardsRateYearly} =
    useGetDelegationState(accountResource, validator);
  const operatorAddr = validator?.operator_address;
  const rewardGrowth = validator?.rewards_growth;
  const stakePoolAddress = validator?.owner_address;

  return isSkeletonLoading ? (
    validatorDetailCardSkeleton({isOnMobile})
  ) : (
    <Stack direction={isOnMobile ? "column" : "row"} spacing={4}>
      <ContentBoxSpaceBetween
        sx={{width: isOnMobile ? "100%" : "50%", marginTop: 0}}
      >
        <ContentRowSpaceBetween
          titleKey="fields.operator"
          value={
            operatorAddr && (
              <HashButton
                hash={operatorAddr}
                type={HashType.ACCOUNT}
                isValidator
              />
            )
          }
        />
        <ContentRowSpaceBetween
          titleKey="fields.numberOfDelegators"
          value={delegatorBalance}
          tooltip={
            <StyledLearnMoreTooltip text={t("staking.operatorCountTip")} />
          }
        />
        <ContentRowSpaceBetween
          titleKey="fields.compoundRewards"
          value={`${rewardsRateYearly}% APR`}
          tooltip={
            <StyledLearnMoreTooltip
              text={t("staking.rewardsAprTip")}
              link={REWARDS_LEARN_MORE_LINK}
            />
          }
        />
        <ContentRowSpaceBetween
          titleKey="fields.operatorCommission"
          value={commission && `${commission}%`}
          tooltip={<StyledLearnMoreTooltip text={t("staking.commissionTip")} />}
        />
      </ContentBoxSpaceBetween>
      <ContentBoxSpaceBetween
        sx={{width: isOnMobile ? "100%" : "50%", marginTop: 0}}
      >
        <ContentRowSpaceBetween
          titleKey="fields.stakePoolAddress"
          value={
            stakePoolAddress && (
              <HashButton hash={stakePoolAddress} type={HashType.ACCOUNT} />
            )
          }
        />
        <ContentRowSpaceBetween
          titleKey="fields.rewardsPerformance"
          value={
            rewardGrowth
              ? `${formatNumber(rewardGrowth, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} %`
              : null
          }
          tooltip={<RewardsPerformanceTooltip />}
        />
        <ContentRowSpaceBetween
          titleKey="fields.lastEpochPerformance"
          value={validator ? validator.last_epoch_performance : null}
          tooltip={<LastEpochPerformanceTooltip />}
        />
        <ContentRowSpaceBetween
          titleKey="fields.nextUnlock"
          value={
            <TimeDurationIntervalBar timestamp={Number(lockedUntilSecs)} />
          }
          tooltip={<StyledLearnMoreTooltip text={t("staking.nextUnlockTip")} />}
        />
      </ContentBoxSpaceBetween>
    </Stack>
  );
}

function validatorDetailCardSkeleton({isOnMobile}: {isOnMobile: boolean}) {
  return (
    <Stack direction={isOnMobile ? "column" : "row"} spacing={4}>
      <ContentBoxSpaceBetween
        sx={{width: isOnMobile ? "100%" : "50%", marginTop: 0}}
      >
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
      </ContentBoxSpaceBetween>
      <ContentBoxSpaceBetween
        sx={{width: isOnMobile ? "100%" : "50%", marginTop: 0}}
      >
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
      </ContentBoxSpaceBetween>
    </Stack>
  );
}
