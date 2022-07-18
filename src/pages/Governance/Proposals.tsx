import React from "react";
import { useGlobalState } from "../../GlobalState";
import { ProposalsTable } from "./ProposalsTable";
import { Grid } from "@mui/material";

export function GovernancePage() {
    const [state, _] = useGlobalState();

    // TODO - FETCH ALL PROPOSALS

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sx={{ mt: 12 }}>
                <ProposalsTable />
            </Grid>
        </Grid>
    );
}