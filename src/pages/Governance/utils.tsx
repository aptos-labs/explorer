import React from "react";
import {ensureMillisecondTimestamp} from "../utils";
import {Proposal, ProposalState} from "./Types";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
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

/* TODO - calculate/fetch proposal status */
// replicate on-chain logic get_proposal_state()
// https://github.com/aptos-labs/aptos-core/blob/main/aptos-move/framework/aptos-framework/sources/voting.move
export function getProposalState(proposal: Proposal): ProposalState {
  if (isVotingClosed(proposal)) {
    let yesVotes = parseInt(proposal.yes_votes);
    let noVotes = parseInt(proposal.no_votes);
    let minVoteThreshold = proposal.min_vote_threshold;

    if (yesVotes > noVotes && yesVotes + noVotes >= minVoteThreshold) {
      return ProposalState.SUCCEEDED;
    } else {
      return ProposalState.FAILED;
    }
  } else {
    return ProposalState.PENDING;
  }
}

export function renderStatusIcon(proposalState: ProposalState) {
  switch (proposalState) {
    case ProposalState.SUCCEEDED:
      return (
        <CheckCircleOutlinedIcon
          fontSize="small"
          // color={primaryColor}
          // titleAccess="Executed successfully"
          sx={{
            color: primaryColor,
          }}
        />
      );
    case ProposalState.FAILED:
      return (
        <ErrorOutlineOutlinedIcon
          fontSize="small"
          // color={negativeColor}
          // titleAccess="Executed successfully"
          sx={{
            color: negativeColor,
          }}
        />
      );
    case ProposalState.PENDING:
      return (
        <PendingOutlinedIcon
          fontSize="small"
          // color={warningColor}
          // titleAccess="Executed successfully"
          sx={{
            color: warningColor,
          }}
        />
      );
  }
}
