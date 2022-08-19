import {Tooltip, Typography, Stack} from "@mui/material";
import React from "react";
import {ProposalStatus} from "../Types";
import StatusIcon from "../components/StatusIcon";
import {getStatusColor} from "../utils";

function StatusBox(status: ProposalStatus, text: string): JSX.Element {
  return (
    <Stack direction="row" spacing={1}>
      <StatusIcon status={status} />
      <Stack spacing={0.2}>
        <Typography variant="body2" color={getStatusColor(status)} pt={0.1}>
          {status}
        </Typography>
        <Typography variant="inherit">{text}</Typography>
      </Stack>
    </Stack>
  );
}

type ProposalStatusTooltipProps = {
  children: React.ReactElement;
};

export default function ProposalStatusTooltip({
  children,
}: ProposalStatusTooltipProps): JSX.Element {
  const content = (
    <Stack spacing={1} margin={1}>
      {StatusBox(ProposalStatus.VOTING_IN_PROGRESS, "- Voting is in progress.")}
      {StatusBox(
        ProposalStatus.FAILED,
        "- Proposal failed because there were not enough votes.",
      )}
      {StatusBox(
        ProposalStatus.REJECTED,
        "- Proposal is rejected by the majority of voters.",
      )}
      {StatusBox(
        ProposalStatus.AWAITING_EXECUTION,
        "- Proposal is passed by the majority of voters and waiting for execution.",
      )}
      {StatusBox(
        ProposalStatus.EXECUTED,
        "- Proposal is passed and executed on chain.",
      )}
    </Stack>
  );

  return (
    <Tooltip placement="bottom-start" title={content}>
      {children}
    </Tooltip>
  );
}
