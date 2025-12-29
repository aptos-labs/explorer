import {Chip} from "@mui/material";
import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import PendingIcon from "@mui/icons-material/Pending";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {ValidatorStatus} from "../utils";
import {getValidatorStatusColors} from "../../../themes/colors/aptosBrandColors";

export default function ValidatorStatusIcon({
  validatorStatus,
}: {
  validatorStatus: ValidatorStatus | undefined;
}): React.JSX.Element {
  const statusColors = getValidatorStatusColors();

  const getStatusIcon = () => {
    if (validatorStatus) {
      switch (validatorStatus) {
        case "Pending Active":
          return (
            <Chip
              label={"Pending Active"}
              color={"warning"}
              icon={<PendingIcon />}
              sx={{
                color: statusColors.pendingActive.text,
                backgroundColor: statusColors.pendingActive.background,
              }}
            />
          );
        case "Active":
          return (
            <Chip
              label={"Active"}
              color={"primary"}
              icon={<CheckCircleIcon />}
              sx={{
                color: statusColors.active.text,
                backgroundColor: statusColors.active.background,
              }}
            />
          );
        case "Pending Inactive":
          return (
            <Chip
              label={"Pending Inactive"}
              color={"warning"}
              icon={<MoreHorizIcon />}
              sx={{
                color: statusColors.pendingInactive.text,
                backgroundColor: statusColors.pendingInactive.background,
              }}
            />
          );
        case "Inactive":
          return (
            <Chip
              label={"Inactive"}
              color={"error"}
              icon={<DangerousIcon />}
              sx={{
                color: statusColors.inactive.text,
                backgroundColor: statusColors.inactive.background,
              }}
            />
          );
        default:
          return <></>;
      }
    }
    return <></>;
  };

  return getStatusIcon();
}
