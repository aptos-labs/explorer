import * as React from "react";
import * as RRD from "react-router-dom";
import Title from "../../../components/Title";
import {
  Stack,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
} from "@mui/material";
import {renderTimestamp} from "../../Transactions/helpers";
import {assertNever} from "../../../utils";
import {Proposal, ProposalVotingState, ProposalExecutionState} from "../Types";
import {useGetProposal} from "../hooks/useGetProposal";
import GeneralTableRow from "../../../components/GeneralTableRow";
import GeneralTableHeaderCell from "../../../components/GeneralTableHeaderCell";
import HashButton from "../../../components/HashButton";
import {teal} from "../../../themes/colors/aptosColorPalette";
import VotingStatusIcon from "../components/VotingStatusIcon";
import ExecutionStatusIcon from "../components/ExecutionStatusIcon";

const MAX_TITLE_WIDTH = 400;
const CELL_HEIGHT = 72;

type ProposalCellProps = {
  proposal: Proposal;
};

function TitleCell({proposal}: ProposalCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}} height={CELL_HEIGHT}>
      <Box
        component="div"
        sx={{
          maxWidth: MAX_TITLE_WIDTH,
          color: teal[500],
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {proposal.proposal_metadata.title}
      </Box>
    </TableCell>
  );
}

function StatusCell({proposal}: ProposalCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}} height={CELL_HEIGHT}>
      <Box sx={{display: "flex", alignItems: "center", gap: 0.7}}>
        <VotingStatusIcon proposalState={proposal.proposal_state} />
        {proposal.proposal_state}
      </Box>
      {proposal.proposal_state === ProposalVotingState.PASSED && (
        <Box sx={{display: "flex", alignItems: "center", gap: 0.7, mt: 1}}>
          <ExecutionStatusIcon isResolved={proposal.is_resolved} />
          {proposal.is_resolved
            ? ProposalExecutionState.EXECUTED
            : ProposalExecutionState.WAITING_TO_BE_EXECUTED}
        </Box>
      )}
    </TableCell>
  );
}

function ProposerCell({proposal}: ProposalCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}} height={CELL_HEIGHT}>
      <HashButton hash={proposal.proposer} />
    </TableCell>
  );
}

// TODO: make renderTimestamp a general helper and move it out of Transactions folder
function StartDateCell({proposal}: ProposalCellProps) {
  return (
    <TableCell
      sx={{
        textAlign: "right",
      }}
      height={CELL_HEIGHT}
    >
      {renderTimestamp(proposal.creation_time_secs)}
    </TableCell>
  );
}

function EndDateCell({proposal}: ProposalCellProps) {
  return (
    <TableCell
      sx={{
        textAlign: "right",
      }}
      height={CELL_HEIGHT}
    >
      {renderTimestamp(proposal.expiration_secs)}
    </TableCell>
  );
}

const ProposalCells = Object.freeze({
  title: TitleCell,
  status: StatusCell,
  proposer: ProposerCell,
  startDate: StartDateCell,
  endDate: EndDateCell,
});

type ProposalColumn = keyof typeof ProposalCells;

const DEFAULT_COLUMNS: ProposalColumn[] = [
  "title",
  "status",
  "proposer",
  "startDate",
  "endDate",
];

type ProposalRowProps = {
  columns: ProposalColumn[];
  proposal_id: string;
  handle: string;
};

function ProposalRow({proposal_id, handle, columns}: ProposalRowProps) {
  const proposalData = useGetProposal(handle, proposal_id);
  const navigate = RRD.useNavigate();

  const onTableRowClick = () => {
    navigate(`${handle}/${proposal_id}`);
  };

  if (!proposalData) {
    // returns null as we don't need to generate a TableRow if there is no proposal data
    return null;
  }

  return (
    <GeneralTableRow onClick={onTableRowClick}>
      {columns.map((column) => {
        const Cell = ProposalCells[column];
        return <Cell key={column} proposal={proposalData} />;
      })}
    </GeneralTableRow>
  );
}

type ProposalHeaderCellProps = {
  column: ProposalColumn;
};

function ProposalHeaderCell({column}: ProposalHeaderCellProps) {
  switch (column) {
    case "title":
      return <GeneralTableHeaderCell header="Title" />;
    case "status":
      return <GeneralTableHeaderCell header="Status" />;
    case "proposer":
      return <GeneralTableHeaderCell header="Proposer" />;
    case "startDate":
      return (
        <GeneralTableHeaderCell header="Start Date" textAlignRight={true} />
      );
    case "endDate":
      return <GeneralTableHeaderCell header="End Date" textAlignRight={true} />;
    default:
      return assertNever(column);
  }
}

type ProposalsTableProps = {
  proposals?: Proposal[];
  columns?: ProposalColumn[];
  nextProposalId: string;
  handle: string;
  ProposalsTableRef: React.MutableRefObject<HTMLDivElement | null>;
};

// TODO: generalize Table component for transactions and proposals
export function ProposalsTable({
  nextProposalId,
  handle,
  columns = DEFAULT_COLUMNS,
  ProposalsTableRef,
}: ProposalsTableProps) {
  const proposalRows = [];
  // we need to iterate from (0...nextProposalId)
  // to make api call for each proposal
  const counter = parseInt(nextProposalId);
  for (var proposal_id = 0; proposal_id < counter; proposal_id++) {
    proposalRows.push(
      <ProposalRow
        key={proposal_id}
        proposal_id={proposal_id + ""} // cast into a string as future uses expects proposal_id as a string type
        handle={handle}
        columns={columns}
      />,
    );
  }

  const tableComponent = (
    <Table size="small">
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <ProposalHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <TableBody>{proposalRows}</TableBody>
    </Table>
  );

  return (
    <Grid ref={ProposalsTableRef}>
      <Stack spacing={1}>
        <Title>Proposals</Title>
        <Box sx={{width: "auto", overflowX: "auto"}}>{tableComponent}</Box>
      </Stack>
    </Grid>
  );
}
