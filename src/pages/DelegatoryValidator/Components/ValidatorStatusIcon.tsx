import {Chip} from "@mui/material";
import React from "react";
import {useGetDelegationNodeInfo} from "../../../api/hooks/useGetDelegationNodeInfo";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";

export default function ValidatorStatusIcon({
  address,
}: {
  address: string;
}): JSX.Element {
  const {validatorStatus} = useGetDelegationNodeInfo({
    validatorAddress: address,
  });

  const status = validatorStatus
    ? // const VALIDATOR_STATUS_INACTIVE: u64 = 4;
      Number(validatorStatus[0]) === 4
      ? "Inactive "
      : "Active"
    : "N/A";
  const statusIcon =
    status === "Active" ? (
      <Chip
        label={status}
        color={"primary"}
        icon={<CheckCircleIcon />}
        sx={{color: "#14B8A6", backgroundColor: "rgba(20, 184, 166, 0.1)"}}
      />
    ) : (
      <Chip
        label={status}
        color={"warning"}
        icon={<DangerousIcon />}
        sx={{
          color: "rgba(234, 179, 8, 1)",
          backgroundColor: "rgba(234, 179, 8, 0.1)",
        }}
      />
    );

  return validatorStatus ? statusIcon : <></>;
}
