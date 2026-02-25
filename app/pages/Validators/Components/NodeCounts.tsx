import {Skeleton, Typography, useTheme} from "@mui/material";
import {useGetValidatorSet} from "../../../api/hooks/useGetValidatorSet";
import type {ValidatorGeoMetric} from "../../../api/hooks/useGetValidatorsGeoData";
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
  const theme = useTheme();
  const {numberOfActiveValidators} = useGetValidatorSet();

  return !isSkeletonLoading ? (
    <MetricSection>
      <Typography sx={{fontSize: {xs: fontSizeTitleSmall, md: fontSizeTitle}}}>
        {numberOfActiveValidators} Nodes
      </Typography>
      <Typography
        sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeSubtitle}}}
        color={theme.palette.text.secondary}
      >
        {validatorGeoMetric.countryCount} Countries
      </Typography>
      <Typography
        sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeSubtitle}}}
        color={theme.palette.text.secondary}
      >
        {validatorGeoMetric.cityCount} Cities
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
