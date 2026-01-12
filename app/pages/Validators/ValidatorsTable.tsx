import React, {useState} from "react";
import {
  Box,
  Stack,
  Table,
  TableHead,
  TableRow,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../utils";
import HashButton, {HashType} from "../../components/HashButton";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import RewardsPerformanceTooltip from "./Components/RewardsPerformanceTooltip";
import LastEpochPerformanceTooltip from "./Components/LastEpochPerformanceTooltip";
import {
  ValidatorData,
  useGetValidators,
} from "../../api/hooks/useGetValidators";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";

function getSortedValidators(
  validators: ValidatorData[],
  column: Column,
  direction: "desc" | "asc",
  filterZeroVotingPower = true,
) {
  const validatorsCopy: ValidatorData[] = JSON.parse(
    JSON.stringify(validators),
  );
  let filteredValidators = validatorsCopy;
  if (filterZeroVotingPower) {
    filteredValidators = validatorsCopy.filter((validator) => {
      return Number(validator.voting_power) !== 0;
    });
  }
  const orderedValidators = getValidatorsOrderedBy(filteredValidators, column);

  return direction === "desc" ? orderedValidators : orderedValidators.reverse();
}

function getValidatorsOrderedBy(
  validatorsCopy: ValidatorData[],
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
  validator: ValidatorData;
};

export function ValidatorAddrCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <HashButton hash={validator.owner_address} type={HashType.ACCOUNT} />
    </GeneralTableCell>
  );
}

export function OperatorAddrCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <HashButton
        hash={validator.operator_address}
        type={HashType.ACCOUNT}
        isValidator
      />
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

export function RewardsPerformanceCell({validator}: ValidatorCellProps) {
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

const ValidatorCells = Object.freeze({
  addr: ValidatorAddrCell,
  operatorAddr: OperatorAddrCell,
  votingPower: VotingPowerCell,
  rewardsPerf: RewardsPerformanceCell,
  lastEpochPerf: LastEpochPerformanceCell,
  location: LocationCell,
});

// Mobile card component for validators
function ValidatorCard({validator}: {validator: ValidatorData}) {
  const theme = useTheme();

  const location =
    validator.location_stats?.city && validator.location_stats?.country
      ? `${validator.location_stats.city}, ${validator.location_stats.country}`
      : null;

  return (
    <Paper
      sx={{
        px: 2,
        py: 1.5,
        mb: 1,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
      }}
    >
      {/* Pool Address */}
      <Box sx={{mb: 1}}>
        <Typography
          variant="caption"
          sx={{color: "text.secondary", fontWeight: 500, display: "block"}}
        >
          Pool Address
        </Typography>
        <HashButton hash={validator.owner_address} type={HashType.ACCOUNT} />
      </Box>

      {/* Operator Address */}
      <Box sx={{mb: 1.5}}>
        <Typography
          variant="caption"
          sx={{color: "text.secondary", fontWeight: 500, display: "block"}}
        >
          Operator
        </Typography>
        <HashButton
          hash={validator.operator_address}
          type={HashType.ACCOUNT}
          isValidator
        />
      </Box>

      {/* Stats */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
      >
        <Box>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            Voting Power
          </Typography>
          <Typography sx={{fontSize: "0.85rem", fontWeight: 600}}>
            {getFormattedBalanceStr(
              validator.voting_power.toString(),
              undefined,
              0,
            )}
          </Typography>
        </Box>
        <Box sx={{textAlign: "center"}}>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            Rewards Perf
          </Typography>
          <Typography sx={{fontSize: "0.85rem", fontWeight: 600}}>
            {validator.rewards_growth !== undefined
              ? `${validator.rewards_growth.toFixed(2)}%`
              : "-"}
          </Typography>
        </Box>
        <Box sx={{textAlign: "center"}}>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            Last Epoch
          </Typography>
          <Typography sx={{fontSize: "0.85rem", fontWeight: 600}}>
            {validator.last_epoch_performance ?? "-"}
          </Typography>
        </Box>
        {location && (
          <Box sx={{textAlign: "right"}}>
            <Typography variant="caption" sx={{color: "text.secondary"}}>
              Location
            </Typography>
            <Typography sx={{fontSize: "0.85rem"}}>{location}</Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

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
  validator: ValidatorData;
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

export function ValidatorsTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const {validators} = useGetValidators();

  const [sortColumn, setSortColumn] = useState<Column>("votingPower");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const sortedValidators = getSortedValidators(
    validators,
    sortColumn,
    sortDirection,
  );

  const columns = DEFAULT_COLUMNS;

  // Mobile card view
  if (isMobile) {
    return (
      <Box>
        {sortedValidators.map((validator: ValidatorData, i: number) => (
          <ValidatorCard key={i} validator={validator} />
        ))}
      </Box>
    );
  }

  // Desktop table view
  return (
    <Box sx={{overflowX: "auto"}}>
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
          {sortedValidators.map((validator: ValidatorData, i: number) => {
            return (
              <ValidatorRow key={i} validator={validator} columns={columns} />
            );
          })}
        </GeneralTableBody>
      </Table>
    </Box>
  );
}
