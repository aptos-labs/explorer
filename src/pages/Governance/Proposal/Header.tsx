import React from "react"
import { Grid, Typography } from "@mui/material"

import {proposalsData} from '../dummyData'
import {
    renderTimestamp,
} from "../../../pages/Transactions/helpers";
import { getTimeRemaining } from "../../utils";

export const ProposalHeader = () => {

    const proposal = proposalsData[0]

    const remainingTime = getTimeRemaining(parseInt(proposal.expiration_secs));

    return (
        <Grid container>

            <Grid item xs={12}>
                <Typography variant="h5" sx={{mb:2}}>
                    {proposal.execution_content.title}
                </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Grid item sm={6} mb={2}>
                    <Typography color="primary" component="span">
                        {proposal.proposal_state} {''}
                    </Typography>
                </Grid>
                <Grid item sm={6} mb={2}>
                    <Typography noWrap>
                        <Typography component="span" sx={{color:"gray"}}>
                            by {''}
                        </Typography>
                        {proposal.proposer}
                    </Typography>
                </Grid>
            </Grid>


            <Grid item xs={12} sm={6}>
                <Typography color="primary" textAlign={{xs:"left",sm:"right"}}>
                {`${remainingTime.days}d ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s left`}
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <Typography sx={{mb:2,color:"gray"}}>
                    Created on: {renderTimestamp(proposal.creation_time_secs)}
                </Typography>
            </Grid>
        </Grid >
    )
}
