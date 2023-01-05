import {Stack, Typography, Skeleton} from "@mui/material";
import React from "react";
import MetricSection from "./Components/MetricSection";

export const fontSizeBody = 14;
export const fontSizeBodySmall = 12;
export const fontSizeSubtitle = 17;
export const fontSizeSubtitleSmall = 15;
export const fontSizeTitle = 25;
export const fontSizeTitleSmall = 15;
export const epochSectionSkeleton = (
  <MetricSection>
    <Stack direction="row" spacing={1} alignItems="center">
      <Skeleton width={140} />
    </Stack>
    <Skeleton width={180} />
    <Skeleton width={180} />
  </MetricSection>
);
export const stakingSectionSkeleton = (
  <MetricSection>
    <Stack direction="row" spacing={1} alignItems="center">
      <Skeleton width={190} />
    </Stack>
    <Stack direction="row" spacing={1} alignItems="center">
      <Skeleton width={150} />
    </Stack>
  </MetricSection>
);
export const nodeCountsSectionSkeleton = (
  <MetricSection>
    <Typography sx={{fontSize: {xs: fontSizeTitleSmall, md: fontSizeTitle}}}>
      <Skeleton width={150} />
    </Typography>
    <Typography sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeSubtitle}}}>
      <Skeleton width={140} />
    </Typography>
    <Typography sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeSubtitle}}}>
      <Skeleton width={130} />
    </Typography>
  </MetricSection>
);
