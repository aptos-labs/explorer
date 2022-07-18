import React from "react";
import { useGlobalState } from "../../GlobalState";
import { ProposalsTable } from "./ProposalsTable";
import Title from "../../components/Title";
import { Stack, Box, Grid } from "@mui/material";

const TITLE_PLACEHOLDER_1 = "This Is A Title -- Lorem ipsum dolor sit amet";
const TITLE_PLACEHOLDER_2 = "This Is A Title";
const DESCRIPTION_PLACEHOLDER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const dummyData = [
    {
        "id": "0x8c335ddb559b8197efef37e1ea0435184fe4ee8ab622177a417294768215a383",
        "title": TITLE_PLACEHOLDER_1,
        "description": DESCRIPTION_PLACEHOLDER,
        "proposer": "0x46161f670671f424cdc7e5c395ce29f78ad36c028346cb5f32a26462226b6c45",
        "status": "Voting In Progress",
        "timestamp": "1652425697444570"
    },
    {
        "id": "0x8c335ddb559b8197efef37e1ea0435184fe4ee8ab622177a417294768215a384",
        "title": TITLE_PLACEHOLDER_2,
        "description": DESCRIPTION_PLACEHOLDER,
        "proposer": "0x46161f670671f424cdc7e5c395ce29f78ad36c028346cb5f32a26462226b6c45",
        "status": "Voting In Progress",
        "timestamp": "1657925697446570"
    },
    {
        "id": "0x8c335ddb559b8197efef37e1ea0435184fe4ee8ab622177a417294768215a385",
        "title": TITLE_PLACEHOLDER_1,
        "description": DESCRIPTION_PLACEHOLDER,
        "proposer": "0x46161f670671f424cdc7e5c395ce29f78ad36c028346cb5f32a26462226b6c45",
        "status": "Voting Complete",
        "timestamp": "1652925697244570"
    },
    {
        "id": "0x8c335ddb559b8197efef37e1ea0435184fe4ee8ab622177a417294768215a386",
        "title": TITLE_PLACEHOLDER_2,
        "description": DESCRIPTION_PLACEHOLDER,
        "proposer": "0x46161f670671f424cdc7e5c395ce29f78ad36c028346cb5f32a26462226b6c45",
        "status": "Executed",
        "timestamp": "1657325637444570"
    },
    {
        "id": "0x8c335ddb559b8197efef37e1ea0435184fe4ee8ab622177a417294768215a387",
        "title": TITLE_PLACEHOLDER_1,
        "description": DESCRIPTION_PLACEHOLDER,
        "proposer": "0x46161f670671f424cdc7e5c395ce29f78ad36c028346cb5f32a26462226b6c45",
        "status": "Executed",
        "timestamp": "1652925697244570"
    },
    {
        "id": "0x8c335ddb559b8197efef37e1ea0435184fe4ee8ab622177a417294768215a388",
        "title": TITLE_PLACEHOLDER_1,
        "description": DESCRIPTION_PLACEHOLDER,
        "proposer": "0x46161f670671f424cdc7e5c395ce29f78ad36c028346cb5f32a26462226b6c45",
        "status": "Executed",
        "timestamp": "1657325637444570"
    },
];

// TODO: add type
function RenderProposalsContent({
    data,
}: any) {
    if (!data) {
        // TODO: error handling!
        return null;
    }

    return <ProposalsTable proposals={data} />;
}

// TODO: add type
function ProposalsPageInner({
    data,
}: any) {
    if (!data) {
        // TODO: handle errors
        return <>No proposal info</>;
    }

    return (
        <>
            <Stack spacing={1}>
                <Title>Proposals</Title>
                <Box sx={{ width: "auto", overflowX: "auto" }}>
                    <RenderProposalsContent data={data} />
                </Box>
            </Stack>
        </>
    );
}

export function GovernancePage() {
    const [state, _] = useGlobalState();

    // TODO - FETCH ALL PROPOSALS

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                {/* TODO: config offset better*/}
                <div style={{ margin: "100px 0px 0px 0px" }}>
                    <ProposalsPageInner data={dummyData} />
                </div>
            </Grid>
        </Grid>
    );
}