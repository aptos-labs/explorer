import * as React from "react";
import * as RRD from "react-router-dom";
import { useTheme } from "@mui/material";
import Title from "../../components/Title";
import { Link, Stack, Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import {
    renderTimestamp,
} from "../../pages/Transactions/helpers";
import { assertNever } from "../../utils";

const TITLE_WIDTH = 400;
const HASH_WIDTH = 300;

type ProposalCellProps = {
    proposal: any;
};

const TITLE_PLACEHOLDER_1 = "This Is A Title -- Lorem ipsum dolor sit amet";
const TITLE_PLACEHOLDER_2 = "This Is A Title";
const DESCRIPTION_PLACEHOLDER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

// TODO: create type Proposal
const DUMMY_DATA = [
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
function ProposalsPage({
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
                    <ProposalsTable proposals={data} />
                </Box>
            </Stack>
        </>
    );
}

function TitleCell({ proposal }: ProposalCellProps) {
    return (
        <TableCell sx={{ textAlign: "left" }}>
            <Link
                component={RRD.Link}
                to={`/txn/${proposal.id}`}
                color="primary"
            >
                <Box
                    component="div"
                    sx={{
                        width: TITLE_WIDTH,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {proposal.title}
                </Box>
            </Link>
        </TableCell >
    );
}

function StatusCell({ proposal }: ProposalCellProps) {
    return (
        <TableCell sx={{ textAlign: "left" }}>
            {proposal.status}
        </TableCell>
    );
}

function ProposerCell({ proposal }: ProposalCellProps) {
    return (
        <TableCell sx={{ textAlign: "left" }}>
            <Box
                component="div"
                sx={{
                    width: HASH_WIDTH,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {proposal.proposer}
            </Box>
        </TableCell>
    );
}

// TODO: make renderTimestamp a general helper and move it out of Transactions folder
function TimestampCell({ proposal }: ProposalCellProps) {
    const timestamp =
        "timestamp" in proposal ? (
            renderTimestamp(proposal.timestamp)
        ) : (
            <Typography variant="subtitle2" align="center">
                -
            </Typography>
        );

    return <TableCell sx={{ textAlign: "left" }}>{timestamp}</TableCell>;
}

const ProposalCells = Object.freeze({
    title: TitleCell,
    status: StatusCell,
    proposer: ProposerCell,
    timestamp: TimestampCell,
});

type ProposalColumn = keyof typeof ProposalCells;

const DEFAULT_COLUMNS: ProposalColumn[] = [
    "title",
    "status",
    "proposer",
    "timestamp",
];

type ProposalRowProps = {
    proposal: any,
    columns: ProposalColumn[];
};

function ProposalRow({ proposal, columns }: ProposalRowProps) {
    return (
        <TableRow hover>
            {columns.map((column) => {
                const Cell = ProposalCells[column];
                return <Cell key={column} proposal={proposal} />;
            })}
        </TableRow>
    );
}

type ProposalHeaderCellProps = {
    column: ProposalColumn;
};

function ProposalHeaderCell({ column }: ProposalHeaderCellProps) {
    const theme = useTheme();
    const tableCellBackgroundColor = theme.palette.background.paper;

    switch (column) {
        case "title":
            return (
                <TableCell
                    sx={{
                        textAlign: "left",
                        width: "2%",
                        background: `${tableCellBackgroundColor}`,
                        borderRadius: "8px 0 0 8px",
                    }}
                >
                    <Typography variant="subtitle1">Title</Typography>
                </TableCell>
            );
        case "status":
            return (
                <TableCell
                    sx={{ textAlign: "left", background: `${tableCellBackgroundColor}` }}
                >
                    <Typography variant="subtitle1">Status</Typography>
                </TableCell>
            );
        case "proposer":
            return (
                <TableCell
                    sx={{ textAlign: "left", background: `${tableCellBackgroundColor}` }}
                >
                    <Typography variant="subtitle1">Proposer</Typography>
                </TableCell>
            );
        case "timestamp":
            return (
                <TableCell
                    sx={{
                        textAlign: "left",
                        background: `${tableCellBackgroundColor}`,
                        borderRadius: "0 8px 8px 0",
                    }}
                >
                    <Typography variant="subtitle1">Timestamp</Typography>
                </TableCell>
            );
        default:
            return assertNever(column);
    }
}

type Props = {
    proposals?: any,
    columns?: ProposalColumn[];
};

// TODO: generalize Table component for transactions and proposals
export function ProposalsTable({
    proposals = DUMMY_DATA,
    columns = DEFAULT_COLUMNS,
}: Props) {
    if (!proposals) {
        // TODO: handle errors
        return <>No proposal info</>;
    }

    const tableComponent = <Table size="small">
        <TableHead>
            <TableRow>
                {columns.map((column) => (
                    <ProposalHeaderCell key={column} column={column} />
                ))}
            </TableRow>
        </TableHead>
        <TableBody>
            {proposals.map((proposal: any, i: any) => {
                return (
                    <ProposalRow
                        key={`${i}-${proposal.id}`}
                        proposal={proposal}
                        columns={columns}
                    />
                );
            })}
        </TableBody>
    </Table>;

    return (
        <>
            <Stack spacing={1}>
                <Title>Proposals</Title>
                <Box sx={{ width: "auto", overflowX: "auto" }}>
                    {tableComponent}
                </Box>
            </Stack>
        </>
    );
}
