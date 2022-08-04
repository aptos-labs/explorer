import React from "react";
import {Grid, Typography, Stack, Divider} from "@mui/material";

import {renderTimestamp} from "../../../pages/Transactions/helpers";
import {getTimeRemaining} from "../../utils";
import {Proposal, ProposalState} from "../Types";
import {primaryColor, negativeColor, warningColor} from "../constants";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const SECONDARY_TEXT_COLOR = "#A3A3A3";
const HASH_WIDTH = 300;

function TitleComponent({proposal}: {proposal: Proposal}) {
  return <Typography variant="h5">{proposal.metadata.title}</Typography>;
}

// TODO: add status icon
function StatusComponent({proposal}: {proposal: Proposal}) {
  let color;
  switch (proposal.proposal_state) {
    case ProposalState.SUCCEEDED:
      color = primaryColor;
      break;
    case ProposalState.PENDING:
      color = warningColor;
      break;
    case ProposalState.FAILED:
      color = negativeColor;
      break;
  }

  return (
    <Typography variant="subtitle1" color={color}>
      {proposal.proposal_state}
    </Typography>
  );
}

function TimeRemainingComponent({proposal}: {proposal: Proposal}) {
  const remainingTime = getTimeRemaining(proposal.expiration_secs);
  return (
    <Stack direction="column" alignItems="flex-end" marginY={1}>
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
        spacing={2}
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
  const isOnMobile = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Grid container>
      <Grid item md={8} xs={12}>
        <Stack direction="column" spacing={1} marginY={1}>
          <TitleComponent proposal={proposal} />
          <StatusComponent proposal={proposal} />
        </Stack>
      </Grid>
      <Grid item md={4} xs={12}>
        <TimeRemainingComponent proposal={proposal} />
      </Grid>
      <Grid item md={12} xs={12}>
        <ProposerAndTimeComponent
          proposal={proposal}
          isOnMobile={!isOnMobile}
        />
      </Grid>
    </Grid>
  );
};
