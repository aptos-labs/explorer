import React from "react";
import {ensureMillisecondTimestamp} from "../utils";
import {Proposal, ProposalVotingState} from "./Types";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {primaryColor, negativeColor, warningColor} from "./constants";

// replicate on-chain logic is_voting_closed()
// https://github.com/aptos-labs/aptos-core/blob/main/aptos-move/framework/aptos-framework/sources/voting.move
export function isVotingClosed(proposal: Proposal): boolean {
  let expirationSecs = ensureMillisecondTimestamp(proposal.expiration_secs);
  return canBeResolvedEarly(proposal) || expirationSecs - Date.now() < 0;
}

function canBeResolvedEarly(proposal: Proposal): boolean {
  if (proposal.early_resolution_vote_threshold) {
    let earlyResolutionThreshold = parseInt(
      proposal.early_resolution_vote_threshold.vec[0],
    );
    let yesVotes = parseInt(proposal.yes_votes);
    let noVotes = parseInt(proposal.no_votes);
    if (
      yesVotes >= earlyResolutionThreshold ||
      noVotes >= earlyResolutionThreshold
    ) {
      return true;
    }
  }
  return false;
}

// replicate on-chain logic get_proposal_state()
// https://github.com/aptos-labs/aptos-core/blob/main/aptos-move/framework/aptos-framework/sources/voting.move
export function getProposalState(proposal: Proposal): ProposalVotingState {
  if (isVotingClosed(proposal)) {
    let yesVotes = parseInt(proposal.yes_votes);
    let noVotes = parseInt(proposal.no_votes);
    let minVoteThreshold = proposal.min_vote_threshold;

    if (yesVotes <= noVotes && yesVotes + noVotes >= minVoteThreshold) {
      return ProposalVotingState.REJECTED; // more "no" votes
    } else if (yesVotes > noVotes && yesVotes + noVotes >= minVoteThreshold) {
      return ProposalVotingState.PASSED; // more "yes" votes
    } else {
      return ProposalVotingState.FAILED; // not enough votes
    }
  } else {
    return ProposalVotingState.PENDING;
  }
}

export function getVotingStatusColor(proposalState: ProposalVotingState) {
  switch (proposalState) {
    case ProposalVotingState.PASSED:
      return primaryColor;
    case ProposalVotingState.PENDING:
      return warningColor;
    case ProposalVotingState.FAILED:
      return negativeColor;
    case ProposalVotingState.REJECTED:
      return negativeColor;
  }
}

export function renderStatusIcon(proposalState: ProposalVotingState) {
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
  }
}
