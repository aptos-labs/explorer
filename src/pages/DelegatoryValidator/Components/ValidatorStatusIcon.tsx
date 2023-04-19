import {Chip} from "@mui/material";
import React from "react";
import {useGetDelegationNodeInfo} from "../../../api/hooks/useGetDelegationNodeInfo";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import PendingIcon from "@mui/icons-material/Pending";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

export default function ValidatorStatusIcon({
  address,
}: {
  address: string;
}): JSX.Element {
  const {validatorStatus} = useGetDelegationNodeInfo({
    validatorAddress: address,
  });

  const getStatusIcon = () => {
    switch (Number(validatorStatus![0])) {
      case 1:
        return (
          <Chip
            label={"Pending Active"}
            color={"warning"}
            icon={<PendingIcon />}
            sx={{color: "#14B8A6", backgroundColor: "rgba(20, 184, 166, 0.1)"}}
          />
        );
      case 2:
        return (
          <Chip
            label={"Active"}
            color={"primary"}
            icon={<CheckCircleIcon />}
            sx={{color: "#14B8A6", backgroundColor: "rgba(20, 184, 166, 0.1)"}}
          />
        );
      case 3:
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
      default:
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
    }
  };

  return validatorStatus ? getStatusIcon() : <></>;
}
