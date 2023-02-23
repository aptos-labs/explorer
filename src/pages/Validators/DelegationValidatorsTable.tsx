import React, {useState} from "react";
import {Box, Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../utils";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import RewardsPerformanceTooltip from "./Components/RewardsPerformanceTooltip";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import {useNavigate} from "react-router-dom";
import {Types} from "aptos";
import {
  ValidatorData,
  useGetValidators,
} from "../../api/hooks/useGetValidators";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {grey} from "../../themes/colors/aptosColorPalette";
import {useGlobalState} from "../../GlobalState";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";
import {useGetDelegationNodeInfo} from "../../api/hooks/useGetDelegationNodeInfo";
import {Network, WHILTELISTED_TESTNET_DELEGATION_NODES} from "../../constants";
import {
  OperatorAddrCell,
  RewardsPerformanceCell,
  ValidatorAddrCell,
  ValidatorCellProps,
} from "./ValidatorsTable";

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

const DelegationValidatorCells = Object.freeze({
  addr: ValidatorAddrCell,
  operatorAddr: OperatorAddrCell,
  rewardsPerf: RewardsPerformanceCell,
  commission: CommissionCell,
  delegator: DelegatorCell,
  rewardsEarned: RewardsEarnedCell,
  delegatedStakeAmount: DelegatedStakeAmountCell,
});

type Column = keyof typeof DelegationValidatorCells;

const DEFAULT_COLUMNS: Column[] = [
  "addr",
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

function CommissionCell({validator}: ValidatorCellProps) {
  const {commission} = useGetDelegationNodeInfo({
    validatorAddress: validator.owner_address,
    validator,
  });
  return (
    <GeneralTableCell sx={{paddingLeft: 5}}>
      {commission && `${commission}%`}
    </GeneralTableCell>
  );
}

function DelegatorCell({validator}: ValidatorCellProps) {
  const {delegatorBalance} = useGetDelegationNodeInfo({
    validatorAddress: validator.owner_address,
    validator,
  });
  return (
    <GeneralTableCell sx={{paddingRight: 10, textAlign: "right"}}>
      {delegatorBalance}
    </GeneralTableCell>
  );
}

function RewardsEarnedCell() {
  return <GeneralTableCell sx={{paddingLeft: 10}}>N/A</GeneralTableCell>;
}

function DelegatedStakeAmountCell({validator}: ValidatorCellProps) {
  const {delegatedStakeAmount, networkPercentage} = useGetDelegationNodeInfo({
    validatorAddress: validator.owner_address,
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
        const Cell = DelegationValidatorCells[column];
        return <Cell key={column} validator={validator} />;
      })}
    </GeneralTableRow>
  );
}

export function DelegationValidatorsTable() {
  const [state, _] = useGlobalState();
  const {validators} = useGetValidators(state.network_name);

  const [sortColumn, setSortColumn] = useState<Column>("delegatedStakeAmount");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const whitelistedTestnetDelegationValidators: ValidatorData[] =
    validators.filter((validator) =>
      WHILTELISTED_TESTNET_DELEGATION_NODES.includes(validator.owner_address),
    );
  const sortedValidators = getSortedValidators(
    state.network_name === Network.TESTNET
      ? whitelistedTestnetDelegationValidators
      : [],
    sortColumn,
    sortDirection,
  );

  return (
    <Table>
      <TableHead>
        <TableRow sx={{verticalAlign: "bottom"}}>
          {DEFAULT_COLUMNS.map((column) => (
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
              columns={DEFAULT_COLUMNS}
            />
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
