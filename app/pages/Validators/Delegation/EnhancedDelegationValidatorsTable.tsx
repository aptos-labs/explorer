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
  useMediaQuery,
  Paper,
  Chip,
  LinearProgress,
  Tooltip,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import VirtualizedTableBody from "../../../components/Table/VirtualizedTableBody";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {Types} from "aptos";
import {useGetValidatorSet} from "../../../api/hooks/useGetValidatorSet";
import {ValidatorAddrCell, OperatorAddrCell} from "../ValidatorsTable";
import {addressFromWallet, assertNever} from "../../../utils";
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
import {
  useNavigate,
  useAugmentToWithGlobalSearchParams,
} from "../../../routing";
import HashButton, {HashType} from "../../../components/HashButton";
import ValidatorStatusIcon from "../../DelegatoryValidator/Components/ValidatorStatusIcon";

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
        return direction === "asc" ? -comparison : comparison;
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
    statusColors[validatorStatus as keyof typeof statusColors] ||
    theme.palette.text.secondary;

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
    if (rate <= 5) return theme.palette.success.main;
    if (rate <= 7) return theme.palette.info.main;
    if (rate <= 15) return theme.palette.warning.main;
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
  const theme = useTheme();
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
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              "& .MuiLinearProgress-bar": {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{ml: 1, color: theme.palette.text.secondary, minWidth: "36px"}}
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
const ValidatorRow = React.memo(function ValidatorRow({
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
      wallet_address: addressFromWallet(account?.address),
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
});

// Mobile card component for enhanced delegation validators
function EnhancedDelegationValidatorCard({
  validator,
  connected,
  totalVotingPower,
}: {
  validator: ValidatorWithExtendedData;
  connected: boolean;
  totalVotingPower: string | null;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const augmentTo = useAugmentToWithGlobalSearchParams();

  const validatorStatus = getValidatorStatus(validator.status);
  const networkPercentage = totalVotingPower
    ? calculateNetworkPercentage(validator.voting_power, totalVotingPower)
    : "0";

  const handleClick = () => {
    navigate({to: augmentTo(`/validator/${validator.owner_address}`)});
  };

  return (
    <Paper
      onClick={handleClick}
      sx={{
        px: 2,
        py: 1.5,
        mb: 1,
        cursor: "pointer",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        "&:hover": {
          filter:
            theme.palette.mode === "dark"
              ? "brightness(0.9)"
              : "brightness(0.99)",
        },
        "&:active": {
          background: theme.palette.neutralShade.main,
          transform: "translate(0,0.1rem)",
        },
      }}
    >
      {/* Status */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1}}>
        <ValidatorStatusIcon validatorStatus={validatorStatus} />
        <Typography variant="body2" sx={{fontWeight: 500}}>
          {validatorStatus}
        </Typography>
      </Stack>

      {/* Pool Address */}
      <Box sx={{mb: 1}}>
        <Typography
          variant="caption"
          sx={{color: "text.secondary", display: "block"}}
        >
          Pool Address
        </Typography>
        <HashButton hash={validator.owner_address} type={HashType.ACCOUNT} />
      </Box>

      {/* Operator Address */}
      <Box sx={{mb: 1.5}}>
        <Typography
          variant="caption"
          sx={{color: "text.secondary", display: "block"}}
        >
          Operator
        </Typography>
        <HashButton
          hash={validator.operator_address}
          type={HashType.ACCOUNT}
          isValidator
        />
      </Box>

      {/* Row 2: Key metrics */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={1.5}
        sx={{mb: connected ? 1 : 0}}
      >
        <Box>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            Delegated
          </Typography>
          <Typography sx={{fontSize: "0.85rem", fontWeight: 600}}>
            <APTCurrencyValue
              amount={validator.voting_power ?? "0"}
              fixedDecimalPlaces={0}
            />
          </Typography>
          <Typography
            variant="caption"
            sx={{color: "text.secondary", fontSize: "0.7rem"}}
          >
            {networkPercentage}% of network
          </Typography>
        </Box>
        <Box sx={{textAlign: "center"}}>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            Commission
          </Typography>
          <Typography sx={{fontSize: "0.85rem", fontWeight: 600}}>
            {validator.commission !== undefined
              ? `${validator.commission}%`
              : "-"}
          </Typography>
        </Box>
        <Box sx={{textAlign: "center"}}>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            Delegators
          </Typography>
          <Typography sx={{fontSize: "0.85rem", fontWeight: 600}}>
            {validator.delegatorCount !== undefined
              ? validator.delegatorCount.toLocaleString()
              : "-"}
          </Typography>
        </Box>
        <Box sx={{textAlign: "right"}}>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            Rewards
          </Typography>
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: theme.palette.success.main,
            }}
          >
            <APTCurrencyValue
              amount={(Number(validator.apt_rewards_distributed) || 0).toFixed(
                2,
              )}
              decimals={0}
            />
          </Typography>
        </Box>
      </Stack>

      {/* Row 3: My Deposit (if connected) */}
      {connected && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            pt: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            My Deposit
          </Typography>
          {validator.userStake !== undefined && validator.userStake > 0 ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleIcon
                sx={{color: theme.palette.success.main}}
                fontSize="small"
              />
              <Typography sx={{fontSize: "0.85rem", fontWeight: 600}}>
                <APTCurrencyValue
                  amount={Math.floor(
                    validator.userStake * 100000000,
                  ).toString()}
                  decimals={8}
                  fixedDecimalPlaces={0}
                />
              </Typography>
            </Stack>
          ) : (
            <Typography sx={{fontSize: "0.85rem", color: "text.secondary"}}>
              N/A
            </Typography>
          )}
        </Stack>
      )}
    </Paper>
  );
}

// Main component
export function EnhancedDelegationValidatorsTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const {connected} = useWallet();
  const columns = connected
    ? DEFAULT_COLUMNS
    : COLUMNS_WITHOUT_WALLET_CONNECTION;
  const [sortColumn, setSortColumn] = useState<Column>("rewardsEarned");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const {totalVotingPower} = useGetValidatorSet();

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

  // Memoize validator rows for virtualization
  const validatorRows = useMemo(() => {
    return sortedValidators.map((validator, i) => (
      <ValidatorRow
        key={`${validator.owner_address}-${i}`}
        validator={validator}
        columns={columns}
        connected={connected}
        totalVotingPower={totalVotingPower}
      />
    ));
  }, [sortedValidators, columns, connected, totalVotingPower]);

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

  // Loading skeleton component
  const LoadingSkeletonRow = React.memo(() => (
    <GeneralTableRow>
      {columns.map((column) => (
        <GeneralTableCell key={column} sx={{paddingRight: 5}}>
          <Skeleton
            variant="text"
            width={column === "addr" ? 200 : column === "status" ? 80 : 100}
            height={24}
          />
        </GeneralTableCell>
      ))}
    </GeneralTableRow>
  ));

  if (isLoading) {
    // Mobile loading state
    if (isMobile) {
      return (
        <Box>
          {Array.from({length: 5}).map((_, index) => (
            <Paper
              key={`skeleton-${index}`}
              sx={{
                px: 2,
                py: 1.5,
                mb: 1,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
              }}
            >
              <Skeleton variant="text" width={100} height={24} sx={{mb: 1}} />
              <Skeleton variant="text" width="60%" height={20} sx={{mb: 0.5}} />
              <Skeleton variant="text" width="50%" height={20} sx={{mb: 1.5}} />
              <Stack direction="row" justifyContent="space-between" gap={1}>
                <Skeleton variant="text" width={70} height={40} />
                <Skeleton variant="text" width={60} height={40} />
                <Skeleton variant="text" width={50} height={40} />
                <Skeleton variant="text" width={70} height={40} />
              </Stack>
            </Paper>
          ))}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mt: 2,
              py: 2,
            }}
          >
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Loading validators...
            </Typography>
          </Box>
        </Box>
      );
    }

    // Desktop loading state
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
                    direction={
                      sortColumn === column ? sortDirection : undefined
                    }
                    setDirection={setSortDirection}
                    setSortColumn={setSortColumn}
                    connected={connected}
                  />
                ))}
              </TableRow>
            </TableHead>
            <GeneralTableBody>
              {/* Show skeleton rows while loading */}
              {Array.from({length: 10}).map((_, index) => (
                <LoadingSkeletonRow key={`skeleton-${index}`} />
              ))}
            </GeneralTableBody>
          </Table>
        </Box>
        {/* Loading indicator overlay */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            mt: 2,
            py: 2,
          }}
        >
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Loading validators...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Mobile card view
  if (isMobile) {
    if (sortedValidators.length === 0) {
      return (
        <Box sx={{textAlign: "center", py: 3}}>
          <Typography variant="body1" color="text.secondary">
            No validators found
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        {sortedValidators.map((validator) => (
          <EnhancedDelegationValidatorCard
            key={validator.owner_address}
            validator={validator}
            connected={connected}
            totalVotingPower={totalVotingPower}
          />
        ))}
      </Box>
    );
  }

  // Desktop table view
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
          {sortedValidators.length > 0 ? (
            <VirtualizedTableBody
              estimatedRowHeight={70}
              virtualizationThreshold={15}
            >
              {validatorRows}
            </VirtualizedTableBody>
          ) : (
            <GeneralTableBody>
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
            </GeneralTableBody>
          )}
        </Table>
      </Box>
    </Box>
  );
}
