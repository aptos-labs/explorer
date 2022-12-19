import React, {useState} from "react";
import {Box, Stack, Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../utils";
import {
  MainnetValidator,
  useGetMainnetValidators,
  useGetValidatorToOperator,
} from "../../api/hooks/useGetValidatorSet";
import HashButton, {HashType} from "../../components/HashButton";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import RewardsPerformanceTooltip from "./Components/RewardsPerformanceTooltip";
import LastEpochPerformanceTooltip from "./Components/LastEpochPerformanceTooltip";

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
    case "location":
      return validatorsCopy.sort((validator1, validator2) =>
        (validator1.geo_data?.city ?? "zz").localeCompare(
          validator2.geo_data?.city ?? "zz",
        ),
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
    case "operatorAddr":
      return <GeneralTableHeaderCell header="Operator Address" />;
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
          tooltip={<LastEpochPerformanceTooltip />}
        />
      );
    case "location":
      return (
        <SortableHeaderCell
          header="Location"
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
  validatorToOperator: {[name: string]: string} | null;
};

function ValidatorAddrCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <HashButton hash={validator.address} type={HashType.ACCOUNT} />
    </GeneralTableCell>
  );
}

function OperatorAddrCell({
  validator,
  validatorToOperator,
}: ValidatorCellProps) {
  const operatorAddr = validatorToOperator
    ? validatorToOperator[validator.address]
    : null;

  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      {operatorAddr && (
        <HashButton hash={operatorAddr} type={HashType.ACCOUNT} />
      )}
    </GeneralTableCell>
  );
}

function VotingPowerCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
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

function LocationCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {validator.geo_data?.city && validator.geo_data?.country
        ? `${validator.geo_data?.city}, ${validator.geo_data?.country}`
        : "-"}
    </GeneralTableCell>
  );
}

const ValidatorCells = Object.freeze({
  addr: ValidatorAddrCell,
  operatorAddr: OperatorAddrCell,
  votingPower: VotingPowerCell,
  rewardsPerf: RewardsPerformanceCell,
  lastEpochPerf: LastEpochPerformanceCell,
  location: LocationCell,
});

type Column = keyof typeof ValidatorCells;

const DEFAULT_COLUMNS: Column[] = [
  "addr",
  "operatorAddr",
  "votingPower",
  "rewardsPerf",
  "lastEpochPerf",
  "location",
];

type ValidatorRowProps = {
  validator: MainnetValidator;
  validatorToOperator: {[name: string]: string} | null;
  columns: Column[];
};

function ValidatorRow({
  validator,
  validatorToOperator,
  columns,
}: ValidatorRowProps) {
  return (
    <GeneralTableRow>
      {columns.map((column) => {
        const Cell = ValidatorCells[column];
        return (
          <Cell
            key={column}
            validator={validator}
            validatorToOperator={validatorToOperator}
          />
        );
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
  const validatorToOperator = useGetValidatorToOperator();
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
            <ValidatorRow
              key={i}
              validator={validator}
              validatorToOperator={validatorToOperator}
              columns={columns}
            />
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
