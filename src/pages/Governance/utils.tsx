import React from "react";
import {ensureMillisecondTimestamp} from "../utils";
import {Proposal} from "./Types";

enum PROPOSAL_STATE {
  PROPOSAL_STATE_SUCCEEDED = "SUCCEEDED",
  PROPOSAL_STATE_PENDING = "PENDING",
  PROPOSAL_STATE_FAILED = "FAILED",
}

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
export function getProposalState(proposal: Proposal): PROPOSAL_STATE {
  if (isVotingClosed(proposal)) {
    let yesVotes = parseInt(proposal.yes_votes);
    let noVotes = parseInt(proposal.no_votes);
    let minVoteThreshold = proposal.min_vote_threshold;

    if (yesVotes > noVotes && yesVotes + noVotes >= minVoteThreshold) {
      return PROPOSAL_STATE.PROPOSAL_STATE_SUCCEEDED;
    } else {
      return PROPOSAL_STATE.PROPOSAL_STATE_FAILED;
    }
  } else {
    return PROPOSAL_STATE.PROPOSAL_STATE_PENDING;
  }
}
