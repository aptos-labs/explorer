import React from "react";
import {ProposalStatus} from "../Types";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import DataUsageOutlinedIcon from "@mui/icons-material/DataUsageOutlined";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import {getStatusColor} from "../utils";
import {assertNever} from "../../../utils";

type StatusIconProps = {
  status: ProposalStatus;
};

export default function StatusIcon({status}: StatusIconProps): JSX.Element {
  switch (status) {
    case ProposalStatus.VOTING_IN_PROGRESS:
      return (
        <PendingOutlinedIcon
          fontSize="small"
          sx={{
            color: getStatusColor(status),
          }}
        />
      );
    case ProposalStatus.FAILED:
      return (
        <ErrorOutlineOutlinedIcon
          fontSize="small"
          sx={{
            color: getStatusColor(status),
          }}
        />
      );
    case ProposalStatus.REJECTED:
      return (
        <NotInterestedOutlinedIcon
          fontSize="small"
          sx={{
            color: getStatusColor(status),
          }}
        />
      );
    case ProposalStatus.AWAITING_EXECUTION:
      return (
        <DataUsageOutlinedIcon
          fontSize="small"
          sx={{
            color: getStatusColor(status),
          }}
        />
      );
    case ProposalStatus.EXECUTED:
      return (
        <CheckCircleOutlinedIcon
          fontSize="small"
          sx={{
            color: getStatusColor(status),
          }}
        />
      );
    default:
      return assertNever(status);
  }
}
