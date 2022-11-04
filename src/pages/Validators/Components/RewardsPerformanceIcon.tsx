import * as React from "react";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";

type RewardsPerformanceIconProps = {
  rewardsGrowth: number;
};

export default function RewardsPerformanceIcon({
  rewardsGrowth,
}: RewardsPerformanceIconProps) {
  if (rewardsGrowth >= 80) {
    return <CircleRoundedIcon fontSize="small" color="success" />;
  } else if (rewardsGrowth >= 75 && rewardsGrowth < 80) {
    return <CircleRoundedIcon fontSize="small" color="warning" />;
  } else {
    return <CircleRoundedIcon fontSize="small" color="error" />;
  }
}
