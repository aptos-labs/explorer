import React, {useEffect, useState} from "react";
import {Grid, Typography, Stack, Divider, Box} from "@mui/material";
import {
  getProposalTimeRemaining,
  ProposalTimeRemaining,
  renderTimestamp,
} from "../utils";
import {Proposal} from "../Types";
import {primaryColor} from "../constants";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {getStatusColor, isVotingClosed} from "../utils";
import HashButton, {HashType} from "../../components/HashButton";
import StatusIcon from "../../components/StatusIcon";
import ProposalStatusTooltip from "../../components/ProposalStatusTooltip";

const SECONDARY_TEXT_COLOR = "#A3A3A3";

function TitleComponent({proposal}: {proposal: Proposal}): JSX.Element {
  return (
    <Typography variant="h5">{proposal.proposal_metadata.title}</Typography>
  );
}

function StatusComponent({proposal}: {proposal: Proposal}): JSX.Element {
  return (
    <Stack direction="row" spacing={2}>
      <ProposalStatusTooltip>
        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
          <StatusIcon status={proposal.status} />
          <Typography
            variant="subtitle1"
            color={getStatusColor(proposal.status)}
          >
            {proposal.status}
          </Typography>
        </Box>
      </ProposalStatusTooltip>
      {ExecutionTimeComponent(proposal)}
    </Stack>
  );
}

function ExecutionTimeComponent(proposal: Proposal) {
  // TODO: remove proposal.resolution_time_secs null check after AIT3,
  // as we shouldn't have null resolution_time_secs by then
  if (!proposal.is_resolved || !proposal.resolution_time_secs) {
    return null;
  }

  return (
    <Stack direction="row" sx={{color: SECONDARY_TEXT_COLOR}}>
      <AccessTimeIcon fontSize="small" sx={{mr: 1}} />
      <Typography variant="body2">
        {renderTimestamp(proposal.resolution_time_secs)}
      </Typography>
    </Stack>
  );
}

function TimeRemainingComponent({
  proposal,
  isOnMobile,
}: {
  proposal: Proposal;
  isOnMobile: boolean;
}) {
  if (isVotingClosed(proposal)) {
    return null;
  }
  const [remainingTime, setRemainingTime] = useState<ProposalTimeRemaining>(
    getProposalTimeRemaining(proposal.expiration_secs),
  );

  useEffect(() => {
    const intervalID = setInterval(() => {
      setRemainingTime(getProposalTimeRemaining(proposal.expiration_secs));
    }, 60000); // 1 minute interval
    if (remainingTime.minutes === 0) {
      clearInterval(intervalID);
    }
    return () => clearInterval(intervalID);
  }, [remainingTime.minutes]);

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
          PROPOSER:
        </Typography>
      </Stack>
      <HashButton hash={proposal.proposer} type={HashType.ACCOUNT} />
    </Stack>
  );

  const timeComponent = (
    <Stack direction="row" spacing={1} alignItems="center">
      <AccessTimeIcon fontSize="small" sx={{color: SECONDARY_TEXT_COLOR}} />
      <Typography variant="body2" color={SECONDARY_TEXT_COLOR}>
        VOTING PERIOD:
      </Typography>
      <Typography variant="body2" color={SECONDARY_TEXT_COLOR}>
        {renderTimestamp(proposal.creation_time_secs)}
        {" - "}
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
