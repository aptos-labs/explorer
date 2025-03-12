import React, {useMemo, useState} from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  Stack,
  alpha,
  useTheme,
  Chip,
  LinearProgress,
  Tooltip,
  Pagination,
} from "@mui/material";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {Types} from "aptos";
import {
  primary,
  aptosColor,
  grey,
} from "../../../themes/colors/aptosColorPalette";
import {useGetValidatorSet} from "../../../api/hooks/useGetValidatorSet";
import {ValidatorAddrCell, OperatorAddrCell} from "../ValidatorsTable";
import {assertNever} from "../../../utils";
import {
  useValidatorDelegationData,
  ValidatorWithExtendedData,
} from "./hooks/useValidatorDelegationData";
import {StyledLearnMoreTooltip} from "../../../components/StyledTooltip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  calculateNetworkPercentage,
  getValidatorStatus,
} from "../../DelegatoryValidator/utils";
import {useLogEventWithBasic} from "../../Account/hooks/useLogEventWithBasic";
import {APTCurrencyValue} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {ThreeDLoader} from "react-awesome-loaders";

// Define column types
type Column =
  | "addr"
  | "status"
  | "operatorAddr"
  | "commission"
  | "delegator"
  | "rewardsEarned"
  | "delegatedAmount"
  | "myDeposit";

// Define column sets based on wallet connection
const DEFAULT_COLUMNS: Column[] = [
  "addr",
  "status",
  "operatorAddr",
  "delegatedAmount",
  "commission",
  "delegator",
  "rewardsEarned",
  "myDeposit",
];

const COLUMNS_WITHOUT_WALLET_CONNECTION: Column[] = [
  "addr",
  "status",
  "operatorAddr",
  "delegatedAmount",
  "commission",
  "delegator",
  "rewardsEarned",
];

/**
 * Sort validators based on the selected column and direction
 */
function getSortedValidators(
  validators: ValidatorWithExtendedData[],
  column: Column,
  direction: "desc" | "asc",
): ValidatorWithExtendedData[] {
  if (!validators) return [];

  const sortedValidators = [...validators];

  switch (column) {
    case "addr":
      sortedValidators.sort((a, b) => {
        const comparison = a.owner_address.localeCompare(b.owner_address);
        return direction === "asc" ? comparison : -comparison;
      });
      break;
    case "operatorAddr":
      sortedValidators.sort((a, b) => {
        const comparison = a.operator_address.localeCompare(b.operator_address);
        return direction === "asc" ? comparison : -comparison;
      });
      break;
    case "status":
      sortedValidators.sort((a, b) => {
        const comparison = a.status - b.status;
        return direction === "asc" ? comparison : -comparison;
      });
      break;
    case "commission":
      sortedValidators.sort((a, b) => {
        const comparison = a.commission - b.commission;
        return direction === "asc" ? comparison : -comparison;
      });
      break;
    case "delegator":
      sortedValidators.sort((a, b) => {
        const aCount = a.delegatorCount || 0;
        const bCount = b.delegatorCount || 0;
        const comparison = aCount - bCount;
        return direction === "asc" ? comparison : -comparison;
      });
      break;
    case "rewardsEarned":
      sortedValidators.sort((a, b) => {
        const aRewards = Number(a.apt_rewards_distributed) || 0;
        const bRewards = Number(b.apt_rewards_distributed) || 0;
        const comparison = aRewards - bRewards;
        return direction === "asc" ? comparison : -comparison;
      });
      break;
    case "delegatedAmount":
      sortedValidators.sort((a, b) => {
        const aAmount = Number(a.voting_power) || 0;
        const bAmount = Number(b.voting_power) || 0;
        const comparison = aAmount - bAmount;
        return direction === "asc" ? comparison : -comparison;
      });
      break;
    case "myDeposit":
      sortedValidators.sort((a, b) => {
        const aDeposit = a.userStake || 0;
        const bDeposit = b.userStake || 0;
        const comparison = aDeposit - bDeposit;
        return direction === "asc" ? comparison : -comparison;
      });
      break;
    default:
      // Default sort by rewards earned
      sortedValidators.sort((a, b) => {
        const aRewards = Number(a.apt_rewards_distributed) || 0;
        const bRewards = Number(b.apt_rewards_distributed) || 0;
        const comparison = aRewards - bRewards;
        return direction === "desc" ? -comparison : comparison;
      });
  }

  return sortedValidators;
}

// Header cell component
type ValidatorHeaderCellProps = {
  column: Column;
  direction?: "desc" | "asc";
  setDirection: (dir: "desc" | "asc") => void;
  setSortColumn: (col: Column) => void;
  connected: boolean;
};

function ValidatorHeaderCell({
  column,
  direction,
  setDirection,
  setSortColumn,
  connected,
}: ValidatorHeaderCellProps) {
  // Handle sorting when header is clicked
  const handleSort = (dir: "desc" | "asc") => {
    setSortColumn(column);
    setDirection(dir);
  };

  switch (column) {
    case "addr":
      return (
        <GeneralTableHeaderCell
          header="Staking Pool Address"
          sortable={true}
          direction={direction}
          selectAndSetDirection={handleSort}
        />
      );
    case "operatorAddr":
      return (
        <GeneralTableHeaderCell
          header="Operator Address"
          sortable={true}
          direction={direction}
          selectAndSetDirection={handleSort}
        />
      );
    case "delegatedAmount":
      return (
        <GeneralTableHeaderCell
          header="Delegated Amount"
          tooltip={
            <StyledLearnMoreTooltip text="The total amount of delegated stake in this stake pool" />
          }
          isTableTooltip={false}
          sortable={true}
          direction={direction}
          selectAndSetDirection={handleSort}
        />
      );
    case "delegator":
      return (
        <GeneralTableHeaderCell
          header="Delegators"
          tooltip={
            <StyledLearnMoreTooltip text="Number of owner accounts who have delegated stake to this stake pool + reward account(s)" />
          }
          isTableTooltip={false}
          sortable={true}
          direction={direction}
          selectAndSetDirection={handleSort}
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
          textAlignRight={!connected}
          sortable={true}
          direction={direction}
          selectAndSetDirection={handleSort}
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
          sortable={true}
          direction={direction}
          selectAndSetDirection={handleSort}
        />
      );
    case "myDeposit":
      return (
        <GeneralTableHeaderCell
          header="My Deposit"
          isTableTooltip={false}
          sortable={true}
          direction={direction}
          selectAndSetDirection={handleSort}
        />
      );
    case "status":
      return (
        <GeneralTableHeaderCell
          header="Status"
          isTableTooltip={false}
          sortable={true}
          direction={direction}
          selectAndSetDirection={handleSort}
        />
      );
    default:
      return assertNever(column);
  }
}

// Cell components
function StatusCell({validator}: {validator: ValidatorWithExtendedData}) {
  const theme = useTheme();
  const validatorStatus = getValidatorStatus(validator.status);

  // Define status colors
  const statusColors = {
    Active: theme.palette.success.main,
    Inactive: theme.palette.error.main,
    Pending: theme.palette.warning.main,
  };

  const statusColor =
    statusColors[validatorStatus as keyof typeof statusColors] || grey[500];

  return (
    <GeneralTableCell sx={{paddingRight: 5}}>
      <Chip
        size="small"
        label={validatorStatus}
        sx={{
          backgroundColor: alpha(statusColor, 0.1),
          color: statusColor,
          fontWeight: 500,
          minWidth: "80px",
          justifyContent: "center",
        }}
      />
    </GeneralTableCell>
  );
}

function CommissionCell({validator}: {validator: ValidatorWithExtendedData}) {
  const theme = useTheme();
  const commission =
    validator.commission !== undefined ? validator.commission : 0;

  // Color based on commission rate - higher is better
  const getCommissionColor = (rate: number) => {
    if (rate >= 25) return theme.palette.success.main;
    if (rate >= 15) return theme.palette.info.main;
    if (rate >= 5) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const commissionColor = getCommissionColor(commission);

  return (
    <GeneralTableCell sx={{paddingRight: 10, textAlign: "right"}}>
      <Tooltip title={`${commission}% commission rate`} arrow placement="top">
        <Box>
          <Typography
            variant="body2"
            sx={{fontWeight: 600, color: commissionColor}}
          >
            {validator.commission !== undefined
              ? `${validator.commission}%`
              : "-"}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={commission}
            sx={{
              height: 4,
              borderRadius: 2,
              mt: 0.5,
              backgroundColor: alpha(commissionColor, 0.1),
              "& .MuiLinearProgress-bar": {
                backgroundColor: commissionColor,
              },
            }}
          />
        </Box>
      </Tooltip>
    </GeneralTableCell>
  );
}

function DelegatorCell({validator}: {validator: ValidatorWithExtendedData}) {
  const delegatorCount =
    validator.delegatorCount !== undefined ? validator.delegatorCount : 0;

  return (
    <GeneralTableCell sx={{paddingRight: 10, textAlign: "right"}}>
      <Typography variant="body2" sx={{fontWeight: 500}}>
        {delegatorCount.toLocaleString()}
      </Typography>
    </GeneralTableCell>
  );
}

function RewardsEarnedCell({
  validator,
  connected,
}: {
  validator: ValidatorWithExtendedData;
  connected: boolean;
}) {
  const theme = useTheme();
  const rewardsAmount = Number(validator.apt_rewards_distributed) || 0;

  return (
    <GeneralTableCell
      sx={
        connected
          ? {paddingRight: 10, textAlign: "right"}
          : {paddingRight: 5, textAlign: "right"}
      }
    >
      <Typography
        variant="body2"
        sx={{fontWeight: 600, color: theme.palette.success.main}}
      >
        <APTCurrencyValue amount={rewardsAmount.toFixed(2)} decimals={0} />
      </Typography>
    </GeneralTableCell>
  );
}

function DelegatedAmountCell({
  validator,
  totalVotingPower,
}: {
  validator: ValidatorWithExtendedData;
  totalVotingPower: string | null;
}) {
  const networkPercentage = totalVotingPower
    ? calculateNetworkPercentage(validator.voting_power, totalVotingPower)
    : "0";

  const percentageValue = parseFloat(networkPercentage);

  return (
    <GeneralTableCell sx={{paddingRight: 10, textAlign: "right"}}>
      <Box>
        <Typography variant="body2" sx={{fontWeight: 600}}>
          <APTCurrencyValue
            amount={validator.voting_power ?? "0"}
            fixedDecimalPlaces={0}
          />
        </Typography>
        <Box sx={{display: "flex", alignItems: "center", mt: 0.5}}>
          <LinearProgress
            variant="determinate"
            value={Math.min(percentageValue * 5, 100)} // Scale for better visibility
            sx={{
              height: 4,
              borderRadius: 2,
              flexGrow: 1,
              backgroundColor: alpha(aptosColor, 0.1),
              "& .MuiLinearProgress-bar": {
                backgroundColor: aptosColor,
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{ml: 1, color: grey[450], minWidth: "36px"}}
          >
            {networkPercentage}%
          </Typography>
        </Box>
      </Box>
    </GeneralTableCell>
  );
}

function MyDepositCell({validator}: {validator: ValidatorWithExtendedData}) {
  const {account} = useWallet();
  const theme = useTheme();

  if (!account || validator.userStake === undefined) {
    return (
      <GeneralTableCell sx={{paddingRight: 5, textAlign: "right"}}>
        <Typography variant="body2" color="text.secondary">
          -
        </Typography>
      </GeneralTableCell>
    );
  }

  return (
    <GeneralTableCell sx={{paddingRight: 5, textAlign: "right"}}>
      {validator.userStake > 0 ? (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="flex-end"
        >
          <CheckCircleIcon
            sx={{color: theme.palette.success.main}}
            fontSize="small"
          />
          <Typography variant="body2" sx={{fontWeight: 600}}>
            <APTCurrencyValue
              amount={Math.floor(validator.userStake * 100000000).toString()}
              decimals={8}
              fixedDecimalPlaces={0}
            />
          </Typography>
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          N/A
        </Typography>
      )}
    </GeneralTableCell>
  );
}

// Row component
function ValidatorRow({
  validator,
  columns,
  connected,
  totalVotingPower,
}: {
  validator: ValidatorWithExtendedData;
  columns: Column[];
  connected: boolean;
  totalVotingPower: string | null;
}) {
  const {account, wallet} = useWallet();
  const logEvent = useLogEventWithBasic();

  const validatorVotingPower = validator.voting_power;

  const rowClick = (address: Types.Address) => {
    logEvent("delegation_validators_row_clicked", address, {
      commission: validator.commission?.toString() ?? "",
      delegated_stake_amount: validatorVotingPower ?? "",
      network_percentage: totalVotingPower
        ? calculateNetworkPercentage(validatorVotingPower, totalVotingPower)
        : "0",
      wallet_address: account?.address ?? "",
      wallet_name: wallet?.name ?? "",
      validator_status: validator.status.toString(),
    });
  };

  return (
    <GeneralTableRow
      to={`/validator/${validator.owner_address}`}
      onClick={() => rowClick(validator.owner_address)}
    >
      {columns.map((column) => {
        switch (column) {
          case "addr":
            return <ValidatorAddrCell key={column} validator={validator} />;
          case "status":
            return <StatusCell key={column} validator={validator} />;
          case "operatorAddr":
            return <OperatorAddrCell key={column} validator={validator} />;
          case "delegatedAmount":
            return (
              <DelegatedAmountCell
                key={column}
                validator={validator}
                totalVotingPower={totalVotingPower}
              />
            );
          case "commission":
            return <CommissionCell key={column} validator={validator} />;
          case "delegator":
            return <DelegatorCell key={column} validator={validator} />;
          case "rewardsEarned":
            return (
              <RewardsEarnedCell
                key={column}
                validator={validator}
                connected={connected}
              />
            );
          case "myDeposit":
            return <MyDepositCell key={column} validator={validator} />;
          default:
            return <GeneralTableCell key={column}>-</GeneralTableCell>;
        }
      })}
    </GeneralTableRow>
  );
}

// Main component
export function EnhancedDelegationValidatorsTable() {
  const {connected} = useWallet();
  const columns = connected
    ? DEFAULT_COLUMNS
    : COLUMNS_WITHOUT_WALLET_CONNECTION;
  const [sortColumn, setSortColumn] = useState<Column>("rewardsEarned");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const {totalVotingPower} = useGetValidatorSet();

  // Pagination state - use a larger number to show more validators per page
  const [page, setPage] = useState(1);
  const rowsPerPage = 20; // Increased from 10 to 20

  // Use our optimized data fetching hook
  const {validators, isLoading, error} = useValidatorDelegationData();

  // Sort validators and filter out inactive validators with no voting power
  const sortedValidators = useMemo(() => {
    if (!validators) return [];

    // Filter out inactive validators with no voting power
    const filteredValidators = validators.filter((validator) => {
      const status = getValidatorStatus(validator.status);
      const votingPower = validator.voting_power;
      return !(status === "Inactive" && votingPower === "0");
    });

    return getSortedValidators(filteredValidators, sortColumn, sortDirection);
  }, [validators, sortColumn, sortDirection]);

  // Calculate pagination
  const paginatedValidators = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return sortedValidators.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedValidators, page, rowsPerPage]);

  // Handle pagination change
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };

  if (error) {
    // Handle both ResponseError and Error types
    return (
      <Box sx={{padding: 3}}>
        <Typography variant="h6" color="error" sx={{marginBottom: 2}}>
          Error loading validators
        </Typography>
        <Typography variant="body2">
          {error instanceof Error ? error.message : JSON.stringify(error)}
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          minHeight: "300px",
        }}
      >
        <ThreeDLoader
          colorRing1={primary[500]}
          colorRing2={primary[700]}
          desktopSize={"128px"}
          mobileSize={"100px"}
        />
      </Box>
    );
  }

  return (
    <Box>
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
                  connected={connected}
                />
              ))}
            </TableRow>
          </TableHead>
          <GeneralTableBody>
            {paginatedValidators.length > 0 ? (
              paginatedValidators.map((validator, i) => (
                <ValidatorRow
                  key={`${validator.owner_address}-${i}`}
                  validator={validator}
                  columns={columns}
                  connected={connected}
                  totalVotingPower={totalVotingPower}
                />
              ))
            ) : (
              <TableRow>
                <GeneralTableCell
                  colSpan={columns.length}
                  sx={{textAlign: "center", py: 3}}
                >
                  <Typography variant="body1" color="text.secondary">
                    No validators found
                  </Typography>
                </GeneralTableCell>
              </TableRow>
            )}
          </GeneralTableBody>
        </Table>
      </Box>

      {sortedValidators.length > rowsPerPage && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Pagination
            count={Math.ceil(sortedValidators.length / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
