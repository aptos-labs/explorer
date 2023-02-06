import React, {useState} from "react";
import {Box, Stack, Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../utils";
import HashButton, {HashType} from "../../components/HashButton";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import RewardsPerformanceTooltip from "./Components/RewardsPerformanceTooltip";
import LastEpochPerformanceTooltip from "./Components/LastEpochPerformanceTooltip";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import {useNavigate} from "react-router-dom";
import {Types} from "aptos";
import {
  ValidatorData,
  useGetValidators,
} from "../../api/hooks/useGetValidators";
import {
  APTCurrencyValue,
  getFormattedBalanceStr,
} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {grey} from "../../themes/colors/aptosColorPalette";
import {useGetStakingInfo} from "../../api/hooks/useGetStakingInfo";
import {useGlobalState} from "../../GlobalState";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";

function getSortedValidators(
  validators: ValidatorData[],
  column: Column,
  direction: "desc" | "asc",
) {
  const validatorsCopy: ValidatorData[] = JSON.parse(
    JSON.stringify(validators),
  );
  const orderedValidators = getValidatorsOrderedBy(validatorsCopy, column);

  return direction === "desc" ? orderedValidators : orderedValidators.reverse();
}

function getValidatorsOrderedBy(
  validatorsCopy: ValidatorData[],
  column: Column,
) {
  switch (column) {
    case "votingPower":
    case "delegatedStakeAmount":
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
        (validator1.location_stats?.city ?? "zz").localeCompare(
          validator2.location_stats?.city ?? "zz",
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
  isTableTooltip?: boolean;
};

function SortableHeaderCell({
  header,
  column,
  direction,
  setDirection,
  setSortColumn,
  tooltip,
  isTableTooltip,
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
      isTableTooltip={isTableTooltip}
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
    case "delegatedStakeAmount":
      return (
        <SortableHeaderCell
          header="Delegated Stake Amount"
          column={column}
          direction={direction}
          setDirection={setDirection}
          setSortColumn={setSortColumn}
          tooltip={
            <StyledLearnMoreTooltip text="The total amount of delegated stake in this stake pool" />
          }
          isTableTooltip={false}
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
    case "delegator":
      return (
        <GeneralTableHeaderCell
          header="Delegators"
          tooltip={
            <StyledLearnMoreTooltip
              text="Number of owner accounts who have delegated stake to this stake pool
        Compound rewards"
            />
          }
          isTableTooltip={false}
        />
      );
    case "rewardsEarned":
      return (
        <GeneralTableHeaderCell
          header="Rewards Earned"
          tooltip={
            <StyledLearnMoreTooltip text="Amount of rewards earned by this stake pool to date" />
          }
          isTableTooltip={false}
        />
      );
    case "commission":
      return (
        <GeneralTableHeaderCell
          header="Commission"
          tooltip={
            <StyledLearnMoreTooltip text="% of staking reward paid out to operator as commission" />
          }
          isTableTooltip={false}
        />
      );
    default:
      return assertNever(column);
  }
}

type ValidatorCellProps = {
  validator: ValidatorData;
};

function ValidatorAddrCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <HashButton hash={validator.owner_address} type={HashType.ACCOUNT} />
    </GeneralTableCell>
  );
}

function OperatorAddrCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <HashButton hash={validator.operator_address} type={HashType.ACCOUNT} />
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
    <GeneralTableCell sx={{textAlign: "left", paddingRight: 5}}>
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
      {validator.location_stats?.city && validator.location_stats?.country
        ? `${validator.location_stats?.city}, ${validator.location_stats?.country}`
        : "-"}
    </GeneralTableCell>
  );
}

export function CommissionCell() {
  return <GeneralTableCell sx={{paddingLeft: 5}}>N/A</GeneralTableCell>;
}

function DelegatorCell() {
  return (
    <GeneralTableCell sx={{paddingRight: 10, textAlign: "right"}}>
      N/A
    </GeneralTableCell>
  );
}

export function RewardsEarnedCell() {
  return <GeneralTableCell sx={{paddingLeft: 10}}>N/A</GeneralTableCell>;
}

export function DelegatedStakeAmountCell({validator}: ValidatorCellProps) {
  const {delegatedStakeAmount, networkPercentage} = useGetStakingInfo({
    validator,
  });

  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <Box>
        <APTCurrencyValue
          amount={delegatedStakeAmount}
          fixedDecimalPlaces={0}
        />
      </Box>
      <Box sx={{fontSize: 11, color: grey[450]}}>{networkPercentage}%</Box>
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
  commission: CommissionCell,
  delegator: DelegatorCell,
  rewardsEarned: RewardsEarnedCell,
  delegatedStakeAmount: DelegatedStakeAmountCell,
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

const DELEGATORY_VALIDATOR_COLUMNS: Column[] = [
  "operatorAddr",
  "commission",
  "delegator",
  "rewardsEarned",
  "rewardsPerf",
  "delegatedStakeAmount",
];

type ValidatorRowProps = {
  validator: ValidatorData;
  columns: Column[];
};

function ValidatorRow({validator, columns}: ValidatorRowProps) {
  const inDev = useGetInDevMode();
  const navigate = useNavigate();

  const rowClick = (address: Types.Address) => {
    // TODO(jill) find long term to persist the url params
    navigate(
      inDev ? `/validator/${address}?feature=dev` : `/validator/${address}`,
    );
  };

  return (
    <GeneralTableRow
      onClick={inDev ? () => rowClick(validator.owner_address) : undefined}
    >
      {columns.map((column) => {
        const Cell = ValidatorCells[column];
        return <Cell key={column} validator={validator} />;
      })}
    </GeneralTableRow>
  );
}

type ValidatorsTableProps = {
  onDelegatory: boolean;
};

export function ValidatorsTable({onDelegatory}: ValidatorsTableProps) {
  const [state, _] = useGlobalState();
  const {validators} = useGetValidators(state.network_name);

  const [sortColumn, setSortColumn] = useState<Column>(
    onDelegatory ? "delegatedStakeAmount" : "votingPower",
  );
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const columns = onDelegatory ? DELEGATORY_VALIDATOR_COLUMNS : DEFAULT_COLUMNS;
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
