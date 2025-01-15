import {Chip} from "@mui/material";
import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import PendingIcon from "@mui/icons-material/Pending";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {ValidatorStatus} from "../utils";

export default function ValidatorStatusIcon({
  validatorStatus,
}: {
  validatorStatus: ValidatorStatus | undefined;
}): React.JSX.Element {
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
                color: "#44c6ee",
                backgroundColor: "rgba(68, 198, 238, 0.1)",
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
                color: "#14B8A6",
                backgroundColor: "rgba(20, 184, 166, 0.1)",
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
                color: "rgba(252, 211, 77, 1)",
                backgroundColor: "rgba(252, 211, 77, 0.1)",
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
                color: "rgb(249, 115, 115, 1)",
                backgroundColor: "rgb(249, 115, 115, 0.1)",
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
