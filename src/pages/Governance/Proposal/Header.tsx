import React from "react";
import {Grid, Typography, Stack, Divider, Box} from "@mui/material";
import {renderTimestamp} from "../../../pages/Transactions/helpers";
import {getTimeRemaining} from "../../utils";
import {Proposal, ProposalState} from "../Types";
import {primaryColor, negativeColor, warningColor} from "../constants";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {getStatusColor, renderStatusIcon, isVotingClosed} from "../utils";

const SECONDARY_TEXT_COLOR = "#A3A3A3";
const HASH_WIDTH = 200;

function TitleComponent({proposal}: {proposal: Proposal}) {
  return <Typography variant="h5">{proposal.metadata.title}</Typography>;
}

function StatusComponent({proposal}: {proposal: Proposal}) {
  return (
    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
      {renderStatusIcon(proposal.proposal_state)}
      <Typography
        variant="subtitle1"
        color={getStatusColor(proposal.proposal_state)}
      >
        {proposal.proposal_state}
      </Typography>
    </Box>
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
    <Stack direction="row" spacing={1} alignItems="flex-end">
      <PersonIcon fontSize="small" sx={{color: SECONDARY_TEXT_COLOR}} />
      <Typography variant="body2" color={SECONDARY_TEXT_COLOR}>
        SUBMITTED BY:
      </Typography>
      <Typography
        variant="body2"
        color={SECONDARY_TEXT_COLOR}
        sx={{
          width: HASH_WIDTH,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {proposal.proposer}
      </Typography>
    </Stack>
  );

  const timeComponent = (
    <Stack direction="row" spacing={1} alignItems="flex-end">
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
