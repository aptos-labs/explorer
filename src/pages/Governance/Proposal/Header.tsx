import React from "react";
import {Grid, Typography, Stack, Divider, Box} from "@mui/material";
import {renderTimestamp} from "../../../pages/Transactions/helpers";
import {getTimeRemaining} from "../../utils";
import {Proposal, ProposalExecutionState, ProposalVotingState} from "../Types";
import {primaryColor} from "../constants";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  getVotingStatusColor,
  getExecutionStatusColor,
  isVotingClosed,
} from "../utils";
import HashButton from "../../../components/HashButton";
import VotingStatusIcon from "../components/VotingStatusIcon";
import ExecutionStatusIcon from "../components/ExecutionStatusIcon";

const SECONDARY_TEXT_COLOR = "#A3A3A3";

function TitleComponent({proposal}: {proposal: Proposal}): JSX.Element {
  return <Typography variant="h5">{proposal.metadata.title}</Typography>;
}

function StatusComponent({proposal}: {proposal: Proposal}): JSX.Element {
  return (
    <Box sx={{display: "flex", alignItems: "center", gap: 3}}>
      <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
        <VotingStatusIcon proposalState={proposal.proposal_state} />
        <Typography
          variant="subtitle1"
          color={getVotingStatusColor(proposal.proposal_state)}
        >
          {proposal.proposal_state}
        </Typography>
      </Box>
      {proposal.proposal_state === ProposalVotingState.PASSED && (
        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
          <ExecutionStatusComponent proposal={proposal} />
        </Box>
      )}
    </Box>
  );
}

function ExecutionStatusComponent({
  proposal,
}: {
  proposal: Proposal;
}): JSX.Element {
  return (
    <>
      <ExecutionStatusIcon isResolved={proposal.is_resolved} />
      <Typography
        variant="subtitle1"
        color={getExecutionStatusColor(proposal.is_resolved)}
      >
        {proposal.is_resolved
          ? ProposalExecutionState.EXECUTED
          : ProposalExecutionState.WAITING_TO_BE_EXECUTED}
      </Typography>
    </>
  );
}

function TimeRemainingComponent({
  proposal,
  isOnMobile,
  isVotingClosed,
}: {
  proposal: Proposal;
  isOnMobile: boolean;
  isVotingClosed: boolean;
}) {
  // TODO: show close time if it's closed
  if (isVotingClosed) {
    return null;
  }

  const remainingTime = getTimeRemaining(proposal.expiration_secs);
  return (
    <Stack
      direction="column"
      alignItems={isOnMobile ? "flex-start" : "flex-end"}
      marginY={1}
    >
      <Typography variant="subtitle2">TIME REMAINING</Typography>
      <Typography color={primaryColor} variant="h4">
        {`${remainingTime.days}d ${remainingTime.hours}h ${remainingTime.minutes}m`}
      </Typography>
    </Stack>
  );
}

function ProposerAndTimeComponent({
  proposal,
  isOnMobile,
  isVotingClosed,
}: {
  proposal: Proposal;
  isOnMobile: boolean;
  isVotingClosed: boolean;
}) {
  const proposerComponent = (
    <Stack direction="row" spacing={1}>
      <Stack direction="row" spacing={1} alignSelf="center">
        <PersonIcon fontSize="small" sx={{color: SECONDARY_TEXT_COLOR}} />
        <Typography variant="body2" color={SECONDARY_TEXT_COLOR}>
          PROPOSER:
        </Typography>
      </Stack>
      <HashButton hash={proposal.proposer} />
    </Stack>
  );

  const timeComponent = (
    <Stack direction="row" spacing={1} alignItems="center">
      <AccessTimeIcon fontSize="small" sx={{color: SECONDARY_TEXT_COLOR}} />
      <Typography variant="body2" color={SECONDARY_TEXT_COLOR}>
        {isVotingClosed ? "VOTING ENDED:" : "VOTE BEFORE:"}{" "}
      </Typography>
      <Typography variant="body2" color={SECONDARY_TEXT_COLOR}>
        {renderTimestamp(proposal.expiration_secs)}
      </Typography>
    </Stack>
  );

  return (
    <>
      <Divider variant="dotted" orientation="horizontal" sx={{mt: 1, mb: 1}} />
      <Stack
        direction={isOnMobile ? "column" : "row"}
        spacing={isOnMobile ? 0.5 : 2}
        justifyContent={isOnMobile ? "flex-start" : "space-between"}
      >
        {proposerComponent}
        {timeComponent}
      </Stack>
      <Divider variant="dotted" orientation="horizontal" sx={{mt: 1, mb: 1}} />
    </>
  );
}

type ProposalHeaderProps = {
  proposal: Proposal;
};

export const ProposalHeader = ({proposal}: ProposalHeaderProps) => {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const votingClosed = isVotingClosed(proposal);

  return (
    <Grid container>
      <Grid item md={8} xs={12}>
        <Stack direction="column" spacing={1} marginY={1}>
          <TitleComponent proposal={proposal} />
          <StatusComponent proposal={proposal} />
        </Stack>
      </Grid>
      <Grid item md={4} xs={12}>
        <TimeRemainingComponent
          proposal={proposal}
          isOnMobile={isOnMobile}
          isVotingClosed={votingClosed}
        />
      </Grid>
      <Grid item md={12} xs={12}>
        <ProposerAndTimeComponent
          proposal={proposal}
          isOnMobile={isOnMobile}
          isVotingClosed={votingClosed}
        />
      </Grid>
    </Grid>
  );
};
