import React, {useState} from "react";
import {Box, Stack, Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../utils";
import {
  MainnetValidator,
  useGetMainnetValidators,
} from "../../api/hooks/useGetValidatorSet";
import HashButton, {HashType} from "../../components/HashButton";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import RewardsPerformanceTooltip from "./Components/RewardsPerformanceTooltip";
import RewardsPerformanceIcon from "./Components/RewardsPerformanceIcon";

function getSortedValidators(
  validators: MainnetValidator[],
  column: Column,
  direction: "desc" | "asc",
) {
  const validatorsCopy: MainnetValidator[] = JSON.parse(
    JSON.stringify(validators),
  );
  const orderedValidators = getValidatorsOrderedBy(validatorsCopy, column);

  return direction === "desc" ? orderedValidators : orderedValidators.reverse();
}

function getValidatorsOrderedBy(
  validatorsCopy: MainnetValidator[],
  column: Column,
) {
  switch (column) {
    case "votingPower":
      return validatorsCopy.sort(
        (validator1, validator2) =>
          parseInt(validator2.voting_power) - parseInt(validator1.voting_power),
      );
    case "rewardsPerf":
      return validatorsCopy.sort(
        (validator1, validator2) =>
          (validator2.rewards_growth ?? 0) - (validator1.rewards_growth ?? 0),
      );
    case "lastEpochPerf":
      return validatorsCopy.sort(
        (validator1, validator2) =>
          parseInt(validator2.last_epoch_performance ?? "") -
          parseInt(validator1.last_epoch_performance ?? ""),
      );
    case "governanceVotes":
      return validatorsCopy.sort(
        (validator1, validator2) =>
          parseInt(validator2.governance_voting_record ?? "") -
          parseInt(validator1.governance_voting_record ?? ""),
      );
    default:
      return validatorsCopy;
  }
}

type SortableHeaderCellProps = {
  header: string;
  column: Column;
  direction?: "desc" | "asc";
  setDirection?: (dir: "desc" | "asc") => void;
  setSortColumn: (col: Column) => void;
  tooltip?: React.ReactNode;
};

function SortableHeaderCell({
  header,
  column,
  direction,
  setDirection,
  setSortColumn,
  tooltip,
}: SortableHeaderCellProps) {
  return (
    <GeneralTableHeaderCell
      header={header}
      textAlignRight
      sortable
      direction={direction}
      selectAndSetDirection={(dir) => {
        setSortColumn(column);
        if (setDirection) {
          setDirection(dir);
        }
      }}
      tooltip={tooltip}
    />
  );
}

type ValidatorHeaderCellProps = {
  column: Column;
  direction?: "desc" | "asc";
  setDirection?: (dir: "desc" | "asc") => void;
  setSortColumn: (col: Column) => void;
};

function ValidatorHeaderCell({
  column,
  direction,
  setDirection,
  setSortColumn,
}: ValidatorHeaderCellProps) {
  switch (column) {
    case "addr":
      return <GeneralTableHeaderCell header="Staking Pool Address" />;
    case "votingPower":
      return (
        <SortableHeaderCell
          header="Voting Power"
          column={column}
          direction={direction}
          setDirection={setDirection}
          setSortColumn={setSortColumn}
        />
      );
    case "rewardsPerf":
      return (
        <SortableHeaderCell
          header="Rewards Perf"
          column={column}
          direction={direction}
          setDirection={setDirection}
          setSortColumn={setSortColumn}
          tooltip={<RewardsPerformanceTooltip />}
        />
      );
    case "lastEpochPerf":
      return (
        <SortableHeaderCell
          header="Last Epoch Perf"
          column={column}
          direction={direction}
          setDirection={setDirection}
          setSortColumn={setSortColumn}
        />
      );
    case "governanceVotes":
      return (
        <SortableHeaderCell
          header="Governance Votes"
          column={column}
          direction={direction}
          setDirection={setDirection}
          setSortColumn={setSortColumn}
        />
      );
    default:
      return assertNever(column);
  }
}

type ValidatorCellProps = {
  validator: MainnetValidator;
};

function ValidatorAddrCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <HashButton hash={validator.address} type={HashType.ACCOUNT} />
    </GeneralTableCell>
  );
}

function VotingPowerCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right", paddingRight: 5}}>
      {getFormattedBalanceStr(validator.voting_power.toString(), undefined, 0)}
    </GeneralTableCell>
  );
}

function RewardsPerformanceCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right", paddingRight: 5}}>
      {validator.rewards_growth === undefined ? null : (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          justifyContent="flex-end"
        >
          <RewardsPerformanceIcon rewardsGrowth={validator.rewards_growth} />
          <Box>{`${validator.rewards_growth.toFixed(2)} %`}</Box>
        </Stack>
      )}
    </GeneralTableCell>
  );
}

function LastEpochPerformanceCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right", paddingRight: 5}}>
      {validator.last_epoch_performance}
    </GeneralTableCell>
  );
}

function GovernanceVotesCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right", paddingRight: 5}}>
      {validator.governance_voting_record}
    </GeneralTableCell>
  );
}

const ValidatorCells = Object.freeze({
  addr: ValidatorAddrCell,
  votingPower: VotingPowerCell,
  rewardsPerf: RewardsPerformanceCell,
  lastEpochPerf: LastEpochPerformanceCell,
  governanceVotes: GovernanceVotesCell,
});

type Column = keyof typeof ValidatorCells;

const DEFAULT_COLUMNS: Column[] = [
  "addr",
  "votingPower",
  "rewardsPerf",
  "lastEpochPerf",
  "governanceVotes",
];

type ValidatorRowProps = {
  validator: MainnetValidator;
  columns: Column[];
};

function ValidatorRow({validator, columns}: ValidatorRowProps) {
  return (
    <GeneralTableRow>
      {columns.map((column) => {
        const Cell = ValidatorCells[column];
        return <Cell key={column} validator={validator} />;
      })}
    </GeneralTableRow>
  );
}

type ValidatorsTableProps = {
  columns?: Column[];
};

export function ValidatorsTable({
  columns = DEFAULT_COLUMNS,
}: ValidatorsTableProps) {
  const {validators} = useGetMainnetValidators();
  const [sortColumn, setSortColumn] = useState<Column>("votingPower");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  const sortedValidators = getSortedValidators(
    validators,
    sortColumn,
    sortDirection,
  );

  return (
    <Table>
      <TableHead>
        <TableRow sx={{verticalAlign: "bottom"}}>
          {columns.map((column) => (
            <ValidatorHeaderCell
              key={column}
              column={column}
              direction={sortColumn === column ? sortDirection : undefined}
              setDirection={setSortDirection}
              setSortColumn={setSortColumn}
            />
          ))}
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {sortedValidators.map((validator: any, i: number) => {
          return (
            <ValidatorRow key={i} validator={validator} columns={columns} />
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
