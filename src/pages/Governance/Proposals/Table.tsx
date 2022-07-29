import * as React from "react";
import * as RRD from "react-router-dom";
import {useTheme} from "@mui/material";
import Title from "../../../components/Title";
import {
  Stack,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {renderTimestamp} from "../../Transactions/helpers";
import {assertNever} from "../../../utils";
import {Proposal} from "../Types";
import useProvideProposalMetadata from "../ProvideProposalMetadata";
import { useGetProposal } from "../hooks/useGetProposal";

const TITLE_WIDTH = 400;
const HASH_WIDTH = 300;

type ProposalCellProps = {
  proposal: Proposal;
};

function TitleCell({proposal}: ProposalCellProps) {
  if(!proposal) return null;
  const metadata = useProvideProposalMetadata(proposal);

  return (
    <TableCell sx={{textAlign: "left"}}>
      <Box
        component="div"
        sx={{
          width: TITLE_WIDTH,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {metadata?.title}
      </Box>
    </TableCell>
  );
}

function StatusCell({proposal}: ProposalCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>{proposal.is_resolved}</TableCell>
  );
}

function ProposerCell({proposal}: ProposalCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
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
function TimestampCell({proposal}: ProposalCellProps) {
  const timestamp =
    "creation_time_secs" in proposal ? (
      renderTimestamp(proposal.creation_time_secs)
    ) : (
      <Typography variant="subtitle2" align="center">
        -
      </Typography>
    );

  return <TableCell sx={{textAlign: "left"}}>{timestamp}</TableCell>;
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
  columns: ProposalColumn[];
  proposal_id: string;
  handle:string
};

function ProposalRow({proposal_id,handle, columns}: ProposalRowProps) {
  const proposalData = useGetProposal(handle,proposal_id)
  const navigate = RRD.useNavigate();

  const onTableRowClick = () => {
      navigate(`${handle}/${proposal_id}`)
  }

  if(!proposalData){
    // returns null as we dont need to generate a TableRow if there is no proposal data
    return null;
  }

  return (
    <TableRow hover onClick={onTableRowClick}>
      {columns.map((column) => {
        const Cell = ProposalCells[column];
        return <Cell key={column} proposal={proposalData} />;
      })}
    </TableRow>
  );
}

type ProposalHeaderCellProps = {
  column: ProposalColumn;
};

function ProposalHeaderCell({column}: ProposalHeaderCellProps) {
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
          sx={{textAlign: "left", background: `${tableCellBackgroundColor}`}}
        >
          <Typography variant="subtitle1">Status</Typography>
        </TableCell>
      );
    case "proposer":
      return (
        <TableCell
          sx={{textAlign: "left", background: `${tableCellBackgroundColor}`}}
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
  proposals?: Proposal[];
  columns?: ProposalColumn[];
  next_proposal_id: string;
  handle:string
};

// TODO: generalize Table component for transactions and proposals
export function ProposalsTable({
  next_proposal_id,
  handle,
  columns = DEFAULT_COLUMNS,
}: Props) {

  const proposalRows = [];

  // we need to iterate from (0...next_proposal_id - 1)
  // to make api call for each proposal
  const counter = parseInt(next_proposal_id);
  for (var proposal_id = 0; proposal_id < counter; proposal_id++) {
    proposalRows.push(<ProposalRow
      key={proposal_id}
      proposal_id={proposal_id+""} // cast into string as future uses expects proposal_id as a string type
      handle={handle}
      columns={columns}
      />);
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
      <TableBody>
        {proposalRows}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Stack spacing={1}>
        <Title>Proposals</Title>
        <Box sx={{width: "auto", overflowX: "auto"}}>{tableComponent}</Box>
      </Stack>
    </>
  );
}
