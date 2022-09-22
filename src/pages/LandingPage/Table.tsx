import * as React from "react";
import * as RRD from "react-router-dom";
import Title from "../../components/Title";
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
import {assertNever} from "../../utils";
import {Proposal} from "../Types";
import {useGetProposal} from "../../api/hooks/useGetProposal";
import GeneralTableRow from "../../components/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/GeneralTableHeaderCell";
import HashButton, {HashType} from "../../components/HashButton";
import {teal} from "../../themes/colors/aptosColorPalette";
import StatusIcon from "../../components/StatusIcon";
import ProposalStatusTooltip from "../../components/ProposalStatusTooltip";
import InfoIcon from "@mui/icons-material/Info";
import {renderTimestamp} from "../utils";

const MAX_TITLE_WIDTH = 400;

type ProposalCellProps = {
  proposal: Proposal;
};

function TitleCell({proposal}: ProposalCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
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
    <TableCell sx={{textAlign: "left"}}>
      <Box sx={{display: "flex", alignItems: "center", gap: 0.7}}>
        <StatusIcon status={proposal.status} />
        {proposal.status}
      </Box>
    </TableCell>
  );
}

function ProposerCell({proposal}: ProposalCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      <HashButton hash={proposal.proposer} type={HashType.ACCOUNT} />
    </TableCell>
  );
}

// TODO: make renderTimestamp a general helper and move it out of Transactions folder
function VotingStartDateCell({proposal}: ProposalCellProps) {
  return (
    <TableCell
      sx={{
        textAlign: "left",
      }}
    >
      {renderTimestamp(proposal.creation_time_secs)}
    </TableCell>
  );
}

function VotingEndDateCell({proposal}: ProposalCellProps) {
  return (
    <TableCell
      sx={{
        textAlign: "left",
      }}
    >
      {renderTimestamp(proposal.expiration_secs)}
    </TableCell>
  );
}

function ExecutionDateCell({proposal}: ProposalCellProps) {
  return (
    <TableCell
      sx={{
        textAlign: "right",
      }}
    >
      {renderTimestamp(proposal.resolution_time_secs)}
    </TableCell>
  );
}

const ProposalCells = Object.freeze({
  title: TitleCell,
  status: StatusCell,
  proposer: ProposerCell,
  votingStartDate: VotingStartDateCell,
  votingEndDate: VotingEndDateCell,
  executionDate: ExecutionDateCell,
});

type ProposalColumn = keyof typeof ProposalCells;

const DEFAULT_COLUMNS: ProposalColumn[] = [
  "title",
  "status",
  "proposer",
  "votingStartDate",
  "votingEndDate",
  "executionDate",
];

type ProposalRowProps = {
  columns: ProposalColumn[];
  proposal_id: string;
};

function ProposalRow({proposal_id, columns}: ProposalRowProps) {
  const proposalData = useGetProposal(proposal_id);
  const navigate = RRD.useNavigate();

  const onTableRowClick = () => {
    navigate(`${proposal_id}`);
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
      return (
        <GeneralTableHeaderCell
          header="Status"
          tooltip={
            <ProposalStatusTooltip>
              <InfoIcon fontSize="small" color="disabled" />
            </ProposalStatusTooltip>
          }
        />
      );
    case "proposer":
      return <GeneralTableHeaderCell header="Proposer" />;
    case "votingStartDate":
      return <GeneralTableHeaderCell header="Voting Start Date" />;
    case "votingEndDate":
      return <GeneralTableHeaderCell header="Voting End Date" />;
    case "executionDate":
      return (
        <GeneralTableHeaderCell header="Execution Date" textAlignRight={true} />
      );
    default:
      return assertNever(column);
  }
}

type ProposalsTableProps = {
  proposals?: Proposal[];
  columns?: ProposalColumn[];
  nextProposalId: string;
  ProposalsTableRef: React.MutableRefObject<HTMLDivElement | null>;
};

// TODO: generalize Table component for transactions and proposals
export function ProposalsTable({
  nextProposalId,
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
