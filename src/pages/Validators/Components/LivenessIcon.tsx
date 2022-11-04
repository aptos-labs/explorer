import * as React from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

type LivenessIconProps = {
  isLive: boolean;
};

export default function LivenessIcon({isLive}: LivenessIconProps) {
  return isLive ? (
    <CheckCircleOutlineIcon fontSize="small" color="success" />
  ) : (
    <CancelOutlinedIcon fontSize="small" color="error" />
  );
}
