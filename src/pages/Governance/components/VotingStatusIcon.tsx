import React from "react";
import {ProposalVotingState} from "../Types";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {getVotingStatusColor} from "../utils";
import {assertNever} from "../../../utils";

type VotingStatusIconProps = {
  proposalState: ProposalVotingState;
};

export default function VotingStatusIcon({
  proposalState,
}: VotingStatusIconProps): JSX.Element {
  switch (proposalState) {
    case ProposalVotingState.PASSED:
      return (
        <CheckCircleOutlinedIcon
          fontSize="small"
          sx={{
            color: getVotingStatusColor(ProposalVotingState.PASSED),
          }}
        />
      );
    case ProposalVotingState.FAILED:
      return (
        <ErrorOutlineOutlinedIcon
          fontSize="small"
          sx={{
            color: getVotingStatusColor(ProposalVotingState.FAILED),
          }}
        />
      );
    case ProposalVotingState.REJECTED:
      return (
        <HighlightOffIcon
          fontSize="small"
          sx={{
            color: getVotingStatusColor(ProposalVotingState.REJECTED),
          }}
        />
      );
    case ProposalVotingState.PENDING:
      return (
        <PendingOutlinedIcon
          fontSize="small"
          sx={{
            color: getVotingStatusColor(ProposalVotingState.PENDING),
          }}
        />
      );
    default:
      return assertNever(proposalState);
  }
}
