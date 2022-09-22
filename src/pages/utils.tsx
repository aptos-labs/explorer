import React from "react";
import moment from "moment";
import Box from "@mui/material/Box";
import {Typography, useTheme} from "@mui/material";
import {AptosClient, AptosAccount, HexString} from "aptos";
import {Proposal, ProposalStatus, ProposalVotingState} from "./Types";
import {
  primaryColor,
  negativeColor,
  warningColor,
  secondaryColor,
} from "./constants";
import {assertNever} from "../utils";

export function renderDebug(data: any) {
  const theme = useTheme();
  return (
    <Box
      sx={{overflow: "auto", fontWeight: theme.typography.fontWeightRegular}}
    >
      <div>
        <pre
          style={{
            fontFamily: theme.typography.fontFamily,
            fontWeight: theme.typography.fontWeightRegular,
            overflowWrap: "break-word",
          }}
        >
          {JSON.stringify(data || null, null, 2)}
        </pre>
      </div>
    </Box>
  );
}

export function ensureMillisecondTimestamp(timestamp: string): number {
  /*
  Could be: 1646458457
        or: 1646440953658538
   */
  if (timestamp.length > 13) {
    timestamp = timestamp.slice(0, 13);
  }
  if (timestamp.length == 10) {
    timestamp = timestamp + "000";
  }
  return parseInt(timestamp);
}

export function parseTimestamp(timestamp: string): moment.Moment {
  return moment(ensureMillisecondTimestamp(timestamp));
}

export interface TimestampDisplay {
  formatted: string;
  local_formatted: string;
  formatted_time_delta: string;
}

export function timestampDisplay(timestamp: moment.Moment): TimestampDisplay {
  return {
    formatted: timestamp.format("MM/DD/YY HH:mm:ss [UTC]"),
    local_formatted: timestamp.local().format("D MMM YYYY HH:mm:ss"),
    formatted_time_delta: timestamp.fromNow(),
  };
}

export interface ProposalTimeRemaining {
  days: number;
  hours: number;
  minutes: number;
}

export function getProposalTimeRemaining(
  endtime: string,
): ProposalTimeRemaining {
  const total = ensureMillisecondTimestamp(endtime) - Date.now();
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
  };
}

export function getHexString(str: string): string {
  return HexString.fromUint8Array(new TextEncoder().encode(str)).hex();
}

export async function doTransaction(
  account: AptosAccount,
  client: AptosClient,
  payload: any,
) {
  const txnRequest = await client.generateTransaction(
    account.address(),
    payload,
  );
  const signedTxn = await client.signTransaction(account, txnRequest);
  const transactionRes = await client.submitTransaction(signedTxn);
  await client.waitForTransaction(transactionRes.hash);
  return transactionRes;
}

function truncateMiddle(
  str: string,
  frontLen: number,
  backLen: number,
  truncateStr: string,
) {
  if (str === null) {
    return "";
  }

  if (!Number.isInteger(frontLen) || !Number.isInteger(backLen)) {
    throw `${frontLen} and ${backLen} should be an Integer`;
  }

  var strLen = str.length;
  // Setting default values
  frontLen = frontLen;
  backLen = backLen;
  truncateStr = truncateStr || "…";
  if (
    (frontLen === 0 && backLen === 0) ||
    frontLen >= strLen ||
    backLen >= strLen ||
    frontLen + backLen >= strLen
  ) {
    return str;
  } else if (backLen === 0) {
    return str.slice(0, frontLen) + truncateStr;
  } else {
    return str.slice(0, frontLen) + truncateStr + str.slice(strLen - backLen);
  }
}

export function truncateAddress(accountAddress: string) {
  return truncateMiddle(accountAddress, 4, 4, "…");
}

export function isValidAccountAddress(accountAddr: string): boolean {
  // account address is 0x{64 hex characters}
  // with multiple options - 0X, 0x001, 0x1, 0x01
  // can start with that and see if any fails to parsing
  return /^(0[xX])?[a-fA-F0-9]{1,64}$/.test(accountAddr);
}
export function isHex(text: string) {
  // if it's hex, and is <= (64 + 2 for 0x) char long
  return text.startsWith("0x") && text.length <= 66;
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
function getProposalState(proposal: Proposal): ProposalVotingState {
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
    proposal.proposal_state = getProposalState(proposal);
  }

  switch (proposal.proposal_state) {
    case ProposalVotingState.PENDING:
      return ProposalStatus.VOTING_IN_PROGRESS;
    case ProposalVotingState.FAILED:
      return ProposalStatus.FAILED;
    case ProposalVotingState.REJECTED:
      return ProposalStatus.REJECTED;
    case ProposalVotingState.PASSED:
      return proposal.is_resolved
        ? ProposalStatus.EXECUTED
        : ProposalStatus.AWAITING_EXECUTION;
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
    case ProposalStatus.EXECUTED:
      return primaryColor;
    default:
      return assertNever(status);
  }
}

export function renderTimestamp(timestamp?: string) {
  if (!timestamp || timestamp === "0")
    return (
      <Typography variant="subtitle2" align="center">
        -
      </Typography>
    );

  const moment = parseTimestamp(timestamp);
  const timestamp_display = timestampDisplay(moment);

  return <>{timestamp_display.local_formatted}</>;
}
