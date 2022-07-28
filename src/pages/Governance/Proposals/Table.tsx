import * as React from "react";
import * as RRD from "react-router-dom";
import {useTheme} from "@mui/material";
import Title from "../../../components/Title";
import {
  Link,
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
import {ProposalsResponseType, ProposalType} from "../Types";
import useProvideProposalMetadata from "../ProvideProposalMetadata";
import { useQuery } from "react-query";
import { Types } from "aptos";
import { ResponseError } from "../../../api/client";
import { getTableItem } from "../../../api";
import { useGlobalState } from "../../../GlobalState";

const TITLE_WIDTH = 400;
const HASH_WIDTH = 300;

type ProposalCellProps = {
  proposal: ProposalType;
};

function TitleCell({proposal}: ProposalCellProps) {
  if(!proposal) return null;
  const metadata = useProvideProposalMetadata(proposal);

  return (
    <TableCell sx={{textAlign: "left"}}>
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
          {metadata?.title}
        </Box>
      </Link>
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
  proposal_id: number;
  handle:string
};

function ProposalRow({proposal_id,handle, columns}: ProposalRowProps) {

  const [state, _setState] = useGlobalState();
  const votingTableItemRequest = {
    key_type: "u64",
    value_type: "0x1::voting::Proposal<0x1::governance_proposal::GovernanceProposal>",
    key: proposal_id + ""
  }
  const tableItem = useQuery<
    Array<any>,
    ResponseError
  >(["tableItem", handle, votingTableItemRequest, state.network_value], () =>
  getTableItem(handle, votingTableItemRequest, state.network_value)
  );

  if(!tableItem.data) return null;

  const tableItemData = tableItem.data as unknown as ProposalsResponseType
  const proposalData = tableItemData.data
  proposalData.proposal_id = proposal_id + "";
  console.log("proposalData",proposalData)

  return (
    <TableRow hover>
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
  proposals?: ProposalType[];
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

  const counter = parseInt(next_proposal_id);
  for (var i = 0; i < counter; i++) {
    proposalRows.push(
    <ProposalRow
      key={i}
      proposal_id={i}
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
