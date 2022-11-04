import * as React from "react";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";

const THRESHOLD_1 = 80;
const THRESHOLD_2 = 75;

type RewardsPerformanceIconProps = {
  rewardsGrowth: number;
};

export default function RewardsPerformanceIcon({
  rewardsGrowth,
}: RewardsPerformanceIconProps) {
  if (rewardsGrowth >= THRESHOLD_1) {
    return <CircleOutlinedIcon fontSize="small" color="success" />;
  } else if (rewardsGrowth >= THRESHOLD_2 && rewardsGrowth < THRESHOLD_1) {
    return <CircleOutlinedIcon fontSize="small" color="warning" />;
  } else {
    return <CircleOutlinedIcon fontSize="small" color="error" />;
  }
}
