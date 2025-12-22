import {Grid2, Stack} from "@mui/material";
import {ValidatorGeoMetric} from "../../../api/hooks/useGetValidatorsGeoData";
import EpochSection from "./Epoch";
import StakingSection from "./Staking";
import NodeCountsSection from "./NodeCounts";
import {Card} from "../../../components/Card";

type MapMetricsProps = {
  validatorGeoMetric: ValidatorGeoMetric;
  isOnMobile?: boolean;
  isSkeletonLoading: boolean;
  hasGeoData?: boolean;
};

export default function MapMetrics({
  validatorGeoMetric,
  isOnMobile,
  isSkeletonLoading,
  hasGeoData = false,
}: MapMetricsProps) {
  // When on mobile or no geo data, use horizontal grid layout with cards
  if (isOnMobile || !hasGeoData) {
    return (
      <Grid2
        container
        direction="row"
        spacing={2}
        marginTop={hasGeoData ? 0.5 : 2}
        marginBottom={hasGeoData ? 4 : 4}
      >
        <Grid2 size={{xs: 12, sm: 6, md: 4}}>
          <Card height={120}>
            <NodeCountsSection
              validatorGeoMetric={validatorGeoMetric}
              isSkeletonLoading={isSkeletonLoading}
              hasGeoData={hasGeoData}
            />
          </Card>
        </Grid2>
        <Grid2 size={{xs: 12, sm: 6, md: 4}}>
          <Card height={120}>
            <EpochSection isSkeletonLoading={isSkeletonLoading} />
          </Card>
        </Grid2>
        <Grid2 size={{xs: 12, sm: 6, md: 4}}>
          <Card height={120}>
            <StakingSection isSkeletonLoading={isSkeletonLoading} />
          </Card>
        </Grid2>
      </Grid2>
    );
  }

  // When there's geo data and not on mobile, use vertical stack (next to map)
  return (
    <Stack
      marginY={4}
      marginLeft={4}
      spacing={4}
      justifyContent="center"
      minWidth={232}
    >
      <NodeCountsSection
        validatorGeoMetric={validatorGeoMetric}
        isSkeletonLoading={isSkeletonLoading}
        hasGeoData={hasGeoData}
      />
      <EpochSection isSkeletonLoading={isSkeletonLoading} />
      <StakingSection isSkeletonLoading={isSkeletonLoading} />
    </Stack>
  );
}
