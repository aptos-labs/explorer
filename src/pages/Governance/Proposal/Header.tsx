import React from "react";
import {Grid, Typography, Stack, Divider, Box} from "@mui/material";
import {renderTimestamp} from "../../../pages/Transactions/helpers";
import {getTimeRemaining} from "../../utils";
import {Proposal, ProposalExecutionState, ProposalVotingState} from "../Types";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {primaryColor, warningColor} from "../constants";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {getVotingStatusColor, renderStatusIcon, isVotingClosed} from "../utils";
import HashButton from "../../../components/HashButton";

const SECONDARY_TEXT_COLOR = "#A3A3A3";

function TitleComponent({proposal}: {proposal: Proposal}): JSX.Element {
  return <Typography variant="h5">{proposal.metadata.title}</Typography>;
}

function StatusComponent({proposal}: {proposal: Proposal}): JSX.Element {
  return (
    <Box sx={{display: "flex", alignItems: "center", gap: 3}}>
      <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
        {renderStatusIcon(proposal.proposal_state)}
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
  if (proposal.is_resolved) {
    return (
      <>
        <CheckCircleOutlinedIcon
          fontSize="small"
          sx={{
            color: primaryColor,
          }}
        />
        <Typography variant="subtitle1" color={primaryColor}>
          {ProposalExecutionState.EXECUTED}
        </Typography>
      </>
    );
  }
  return (
    <>
      <RadioButtonUncheckedIcon
        fontSize="small"
        sx={{
          color: warningColor,
        }}
      />
      <Typography variant="subtitle1" color={warningColor}>
        {ProposalExecutionState.WAITING_TO_BE_EXECUTED}
      </Typography>
    </>
  );
}

function TimeRemainingComponent({
  proposal,
  isOnMobile,
}: {
  proposal: Proposal;
  isOnMobile: boolean;
}) {
  // TODO: show close time if it's closed
  if (isVotingClosed(proposal)) {
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
}: {
  proposal: Proposal;
  isOnMobile: boolean;
}) {
  const proposerComponent = (
    <Stack direction="row" spacing={1}>
      <Stack direction="row" spacing={1} alignSelf="center">
        <PersonIcon fontSize="small" sx={{color: SECONDARY_TEXT_COLOR}} />
        <Typography variant="body2" color={SECONDARY_TEXT_COLOR}>
          SUBMITTED BY:
        </Typography>
      </Stack>
      <HashButton hash={proposal.proposer} />
    </Stack>
  );

  const timeComponent = (
    <Stack direction="row" spacing={1} alignItems="center">
      <AccessTimeIcon fontSize="small" sx={{color: SECONDARY_TEXT_COLOR}} />
      <Typography variant="body2" color={SECONDARY_TEXT_COLOR}>
        SUBMITTED ON:
      </Typography>
      <Typography variant="body2" color={SECONDARY_TEXT_COLOR}>
        {renderTimestamp(proposal.creation_time_secs)}
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

  return (
    <Grid container>
      <Grid item md={8} xs={12}>
        <Stack direction="column" spacing={1} marginY={1}>
          <TitleComponent proposal={proposal} />
          <StatusComponent proposal={proposal} />
        </Stack>
      </Grid>
      <Grid item md={4} xs={12}>
        <TimeRemainingComponent proposal={proposal} isOnMobile={isOnMobile} />
      </Grid>
      <Grid item md={12} xs={12}>
        <ProposerAndTimeComponent proposal={proposal} isOnMobile={isOnMobile} />
      </Grid>
    </Grid>
  );
};
