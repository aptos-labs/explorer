import * as React from "react";
import * as RRD from "react-router-dom";
import { useTheme } from "@mui/material";
import Title from "../../../components/Title";
import { Link, Stack, Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import {
    renderTimestamp,
} from "../../../pages/Transactions/helpers";
import { assertNever } from "../../../utils";
import { proposalsData } from "../dummyData";

const TITLE_WIDTH = 400;
const HASH_WIDTH = 300;

type ProposalCellProps = {
    proposal: any;
};

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
                to={`/txn/${proposal.proposal_id}`}
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
                    {proposal.execution_content.title}
                </Box>
            </Link>
        </TableCell >
    );
}

function StatusCell({ proposal }: ProposalCellProps) {
    return (
        <TableCell sx={{ textAlign: "left" }}>
            {proposal.proposal_state}
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
        "creation_time_secs" in proposal ? (
            renderTimestamp(proposal.creation_time_secs)
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
    proposals = proposalsData,
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
                        key={`${i}-${proposal.proposal_id}`}
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
