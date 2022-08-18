import React from "react";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {getExecutionStatusColor} from "../utils";

type ExecutionStatusIconProps = {
  isResolved: boolean;
};

export default function ExecutionStatusIcon({
  isResolved,
}: ExecutionStatusIconProps): JSX.Element {
  return isResolved ? (
    <CheckCircleOutlinedIcon
      fontSize="small"
      sx={{
        color: getExecutionStatusColor(isResolved),
      }}
    />
  ) : (
    <RadioButtonUncheckedIcon
      fontSize="small"
      sx={{
        color: getExecutionStatusColor(isResolved),
      }}
    />
  );
}
