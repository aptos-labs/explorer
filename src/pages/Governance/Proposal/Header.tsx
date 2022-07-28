import React from "react";
import {Grid, Typography} from "@mui/material";

import {renderTimestamp} from "../../../pages/Transactions/helpers";
import {getTimeRemaining} from "../../utils";
import {Proposal, ProposalMetadata} from "../Types";

const TITLE_UNAVAILABLE = "Title Unavailable";
const STATUS_PLACEHOLDER = "Status To Be Implemented";

type Props = {
  proposal: Proposal;
  metadata: ProposalMetadata;
};

export const ProposalHeader = ({proposal, metadata}: Props) => {
  const remainingTime = getTimeRemaining(parseInt(proposal.expiration_secs));

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h5" sx={{mb: 2}}>
          {metadata !== undefined ? metadata?.title : TITLE_UNAVAILABLE}
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Grid item sm={6} mb={2}>
          <Typography color="primary" component="span">
            {/* TODO: query with move func get_proposal_state */}
            {STATUS_PLACEHOLDER} {""}
          </Typography>
        </Grid>
        <Grid item sm={6} mb={2}>
          <Typography noWrap>
            <Typography component="span" sx={{color: "gray"}}>
              by {""}
            </Typography>
            {proposal.proposer}
          </Typography>
        </Grid>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography color="primary" textAlign={{xs: "left", sm: "right"}}>
          {`${remainingTime.days}d ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s left`}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography sx={{mb: 2, color: "gray"}}>
          Created on: {renderTimestamp(proposal.creation_time_secs)}
        </Typography>
      </Grid>
    </Grid>
  );
};
