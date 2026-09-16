import {Skeleton, Typography, useTheme} from "@mui/material";
import {useGetValidatorSet} from "../../../api/hooks/useGetValidatorSet";
import type {ValidatorGeoMetric} from "../../../api/hooks/useGetValidatorsGeoData";
import {useTranslation} from "../../../i18n";
import {
  fontSizeBodySmall,
  fontSizeSubtitle,
  fontSizeTitle,
  fontSizeTitleSmall,
} from "../constants";
import MetricSection from "./MetricSection";

type NodeCountsProps = {
  validatorGeoMetric: ValidatorGeoMetric;
  isSkeletonLoading: boolean;
};

export default function NodeCounts({
  validatorGeoMetric,
  isSkeletonLoading,
}: NodeCountsProps) {
  const {t, formatInteger} = useTranslation();
  const theme = useTheme();
  const {numberOfActiveValidators} = useGetValidatorSet();

  return !isSkeletonLoading ? (
    <MetricSection>
      <Typography sx={{fontSize: {xs: fontSizeTitleSmall, md: fontSizeTitle}}}>
        {t("staking.nodeCount", {
          count: formatInteger(numberOfActiveValidators ?? 0),
        })}
      </Typography>
      <Typography
        sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeSubtitle}}}
        color={theme.palette.text.secondary}
      >
        {t("staking.countryCount", {
          count: formatInteger(validatorGeoMetric.countryCount),
        })}
      </Typography>
      <Typography
        sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeSubtitle}}}
        color={theme.palette.text.secondary}
      >
        {t("staking.cityCount", {
          count: formatInteger(validatorGeoMetric.cityCount),
        })}
      </Typography>
    </MetricSection>
  ) : (
    <MetricSection>
      <Typography sx={{fontSize: {xs: fontSizeTitleSmall, md: fontSizeTitle}}}>
        <Skeleton width={150} />
      </Typography>
      <Typography
        sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeSubtitle}}}
      >
        <Skeleton width={140} />
      </Typography>
      <Typography
        sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeSubtitle}}}
      >
        <Skeleton width={130} />
      </Typography>
    </MetricSection>
  );
}
