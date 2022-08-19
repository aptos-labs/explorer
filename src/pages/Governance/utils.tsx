import {ensureMillisecondTimestamp} from "../utils";
import {Proposal, ProposalStatus, ProposalVotingState} from "./Types";
import {
  primaryColor,
  negativeColor,
  warningColor,
  secondaryColor,
} from "./constants";
import {assertNever} from "../../utils";

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
function getProposalVotingState(proposal: Proposal): ProposalVotingState {
  if (isVotingClosed(proposal)) {
    let yesVotes = parseInt(proposal.yes_votes);
    let noVotes = parseInt(proposal.no_votes);
    let minVoteThreshold = proposal.min_vote_threshold;
    let enoughVotes = votesAboveThreshold(yesVotes, noVotes, minVoteThreshold);

    if (yesVotes <= noVotes && enoughVotes) {
      return ProposalVotingState.REJECTED; // more "no" votes
    } else if (yesVotes > noVotes && enoughVotes) {
      return ProposalVotingState.PASSED; // more "yes" votes
    } else {
      return ProposalVotingState.FAILED; // not enough votes
    }
  } else {
    return ProposalVotingState.PENDING;
  }
}

export function getProposalStatus(proposal: Proposal): ProposalStatus {
  if (!proposal.proposal_state) {
    proposal.proposal_state = getProposalVotingState(proposal);
  }

  switch (proposal.proposal_state) {
    case ProposalVotingState.PENDING:
      return ProposalStatus.VOTING_IN_PROGRESS;
    case ProposalVotingState.FAILED:
      return ProposalStatus.FAILED;
    case ProposalVotingState.REJECTED:
      return ProposalStatus.REJECTED;
    case ProposalVotingState.PASSED:
      if (proposal.is_resolved) {
        return ProposalStatus.EXECUTED;
      } else {
        const executionFailed = false;
        return executionFailed
          ? ProposalStatus.EXECUTION_FAILED
          : ProposalStatus.AWAITING_EXECUTION;
      }
    default:
      return assertNever(proposal.proposal_state);
  }
}

function votesAboveThreshold(
  yesVotes: number,
  noVotes: number,
  minVoteThreshold: number,
) {
  return yesVotes + noVotes >= minVoteThreshold;
}

export function getStatusColor(status: ProposalStatus): string {
  switch (status) {
    case ProposalStatus.VOTING_IN_PROGRESS:
      return secondaryColor;
    case ProposalStatus.FAILED:
      return negativeColor;
    case ProposalStatus.REJECTED:
      return negativeColor;
    case ProposalStatus.AWAITING_EXECUTION:
      return warningColor;
    case ProposalStatus.EXECUTION_FAILED:
      return negativeColor;
    case ProposalStatus.EXECUTED:
      return primaryColor;
    default:
      return assertNever(status);
  }
}
