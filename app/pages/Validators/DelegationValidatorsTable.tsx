import React, {useMemo, useState} from "react";
import {
  alpha,
  Box,
  Table,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import {addressFromWallet, assertNever} from "../../utils";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import {Types} from "aptos";
import {
  ValidatorData,
  useGetValidators,
} from "../../api/hooks/useGetValidators";
import CurrencyValue, {
  APTCurrencyValue,
} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {
  getSemanticColors,
  brandColors,
} from "../../themes/colors/aptosBrandColors";
import {useAptosClient} from "../../global-config/GlobalConfig";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";
import HashButton, {HashType} from "../../components/HashButton";
import {OperatorAddrCell, ValidatorAddrCell} from "./ValidatorsTable";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {
  useGetNumberOfDelegators,
  useGetDelegatorStakeInfo,
  useGetDelegatedStakingPoolList,
} from "../../api/hooks/delegations";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {Stack} from "@mui/material";
import ValidatorStatusIcon from "../DelegatoryValidator/Components/ValidatorStatusIcon";
import Error from "../Account/Error";
import {
  ValidatorStatus,
  calculateNetworkPercentage,
  getValidatorStatus,
} from "../DelegatoryValidator/utils";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import {useNavigate, useAugmentToWithGlobalSearchParams} from "../../routing";
import {useQuery} from "@tanstack/react-query";
import {getValidatorCommissionAndState} from "../../api";
import {ResponseError} from "../../api/client";

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
    case "rewardsEarned":
      return validatorsCopy.sort((validator1, validator2) => {
        return (
          validator2.apt_rewards_distributed -
          validator1.apt_rewards_distributed
        );
      });
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
  textAlignRight?: boolean;
};

function SortableHeaderCell({
  header,
  column,
  direction,
  setDirection,
  setSortColumn,
  tooltip,
  isTableTooltip,
  textAlignRight,
}: SortableHeaderCellProps) {
  return (
    <GeneralTableHeaderCell
      header={header}
      textAlignRight={textAlignRight}
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
  connected: boolean;
};

function ValidatorHeaderCell({
  column,
  direction,
  setDirection,
  setSortColumn,
  connected,
}: ValidatorHeaderCellProps) {
  switch (column) {
    case "addr":
      return <GeneralTableHeaderCell header="Staking Pool Address" />;
    case "operatorAddr":
      return <GeneralTableHeaderCell header="Operator Address" />;
    case "delegatedAmount":
      return (
        <GeneralTableHeaderCell
          header="Delegated Amount"
          tooltip={
            <StyledLearnMoreTooltip text="The total amount of delegated stake in this stake pool" />
          }
          isTableTooltip={false}
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
        />
      );
    case "rewardsEarned":
      return (
        <SortableHeaderCell
          header="Rewards Earned"
          column={column}
          direction={direction}
          setDirection={setDirection}
          setSortColumn={setSortColumn}
          tooltip={
            <StyledLearnMoreTooltip text="Amount of rewards earned by this stake pool to date" />
          }
          isTableTooltip={false}
          textAlignRight={!connected}
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
    case "view":
      return <GeneralTableHeaderCell header="View" isTableTooltip={false} />;
    case "myDeposit":
      return (
        <GeneralTableHeaderCell header="My Deposit" isTableTooltip={false} />
      );
    case "status":
      return <GeneralTableHeaderCell header="Status" isTableTooltip={false} />;
    default:
      return assertNever(column);
  }
}

const DelegationValidatorCells = Object.freeze({
  addr: ValidatorAddrCell,
  status: StatusCell,
  operatorAddr: OperatorAddrCell,
  commission: CommissionCell,
  delegator: DelegatorCell,
  rewardsEarned: RewardsEarnedCell,
  delegatedAmount: DelegatedAmountCell,
  myDeposit: MyDepositCell,
  view: ViewCell,
});

type Column = keyof typeof DelegationValidatorCells;

const DEFAULT_COLUMNS: Column[] = [
  "view",
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
  "view",
  "addr",
  "status",
  "operatorAddr",
  "delegatedAmount",
  "commission",
  "delegator",
  "rewardsEarned",
];

type ValidatorRowProps = {
  validator: ValidatorData & {
    commission: number;
    status: number;
  };
  columns: Column[];
  connected: boolean;
};

type ValidatorCellProps = {
  validator: ValidatorData;
  delegatedStakeAmount: string | undefined;
  networkPercentage?: string;
  commission: number | undefined;
  connected: boolean;
  validatorStatus: ValidatorStatus | undefined;
};

function StatusCell({validatorStatus}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{paddingRight: 5}}>
      <ValidatorStatusIcon validatorStatus={validatorStatus} />
    </GeneralTableCell>
  );
}
function CommissionCell({commission}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{paddingRight: 10, textAlign: "right"}}>
      {commission && `${commission}%`}
    </GeneralTableCell>
  );
}

function DelegatorCell({validator}: ValidatorCellProps) {
  const {numberOfDelegators} = useGetNumberOfDelegators(
    validator.owner_address,
  );
  return (
    <GeneralTableCell sx={{paddingRight: 10, textAlign: "right"}}>
      {numberOfDelegators}
    </GeneralTableCell>
  );
}

function RewardsEarnedCell({validator, connected}: ValidatorCellProps) {
  return (
    <GeneralTableCell
      sx={
        connected
          ? {paddingRight: 10, textAlign: "right"}
          : {paddingRight: 5, textAlign: "right"}
      }
    >
      <APTCurrencyValue
        amount={Number(validator.apt_rewards_distributed).toFixed(2)}
        decimals={0}
      />
    </GeneralTableCell>
  );
}

function DelegatedAmountCell({
  delegatedStakeAmount,
  networkPercentage,
}: ValidatorCellProps) {
  const theme = useTheme();
  return (
    <GeneralTableCell sx={{paddingRight: 10, textAlign: "right"}}>
      <Box>
        <APTCurrencyValue
          amount={delegatedStakeAmount ?? ""}
          fixedDecimalPlaces={0}
        />
      </Box>
      <Box sx={{fontSize: 11, color: theme.palette.text.secondary}}>
        {networkPercentage}%
      </Box>
    </GeneralTableCell>
  );
}

function ViewCell() {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  return (
    <GeneralTableCell>
      <VisibilityOutlinedIcon
        fontSize="small"
        sx={{
          color:
            theme.palette.mode === "dark"
              ? brandColors.black
              : brandColors.white,
          backgroundColor: semanticColors.status.info,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 1),
          },
          borderRadius: 0.75,
          width: "2rem",
          height: "2rem",
          padding: "0.5rem",
        }}
      />
    </GeneralTableCell>
  );
}

function MyDepositCell({validator}: ValidatorCellProps) {
  const theme = useTheme();
  const {account} = useWallet();
  const {stakes, isLoading} = useGetDelegatorStakeInfo(
    addressFromWallet(account?.address),
    validator.owner_address,
  );
  // Calculate totalDeposit during render instead of using useMemo with setState
  const totalDeposit = useMemo(() => {
    if (stakes && stakes.length > 0) {
      return stakes.reduce(
        (acc, stake) => Number(acc) + Number(stake),
        0 as Types.MoveValue,
      );
    }
    return undefined;
  }, [stakes]);

  if (isLoading || !account) {
    return (
      <GeneralTableCell sx={{paddingRight: 5, textAlign: "right"}}>
        <Typography>-</Typography>
      </GeneralTableCell>
    );
  }

  return (
    <GeneralTableCell sx={{paddingRight: 5, textAlign: "right"}}>
      {Number(totalDeposit) !== 0 ? (
        <Stack direction="row" spacing={1.5}>
          <CheckCircleIcon
            sx={{color: theme.palette.primary.main}}
            fontSize="small"
          />
          <CurrencyValue
            amount={Number(totalDeposit).toString()}
            currencyCode="APT"
            fixedDecimalPlaces={0}
          />
        </Stack>
      ) : (
        <Stack textAlign="center">
          <Typography>N/A</Typography>
        </Stack>
      )}
    </GeneralTableCell>
  );
}

// Mobile card component for delegation validators
// TODO: Consider lifting data fetching (numberOfDelegators, stakes) to parent
// component to reduce API calls when rendering many cards
function DelegationValidatorCard({
  validator,
  connected,
}: {
  validator: ValidatorData & {commission: number; status: number};
  connected: boolean;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const augmentTo = useAugmentToWithGlobalSearchParams();
  const {account} = useWallet();
  const {totalVotingPower} = useGetValidatorSet();
  const {numberOfDelegators} = useGetNumberOfDelegators(
    validator.owner_address,
  );
  const {stakes} = useGetDelegatorStakeInfo(
    addressFromWallet(account?.address),
    validator.owner_address,
  );

  const validatorVotingPower = validator.voting_power;
  const networkPercentage = calculateNetworkPercentage(
    validatorVotingPower,
    totalVotingPower,
  );
  const {commission, status} = validator;
  const validatorStatus = getValidatorStatus(status);

  // Calculate total deposit
  const totalDeposit = useMemo(() => {
    if (stakes && stakes.length > 0) {
      return stakes.reduce(
        (acc, stake) => Number(acc) + Number(stake),
        0 as Types.MoveValue,
      );
    }
    return undefined;
  }, [stakes]);

  // Hide inactive validators with no delegated stake
  if (validatorStatus === "Inactive" && validatorVotingPower === "0") {
    return null;
  }

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
        sx={{mb: connected && account ? 1 : 0}}
      >
        <Box>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            Delegated
          </Typography>
          <Typography sx={{fontSize: "0.85rem", fontWeight: 600}}>
            <APTCurrencyValue
              amount={validatorVotingPower ?? "0"}
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
            {commission !== undefined ? `${commission}%` : "-"}
          </Typography>
        </Box>
        <Box sx={{textAlign: "center"}}>
          <Typography variant="caption" sx={{color: "text.secondary"}}>
            Delegators
          </Typography>
          <Typography sx={{fontSize: "0.85rem", fontWeight: 600}}>
            {numberOfDelegators ?? "-"}
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
              amount={Number(validator.apt_rewards_distributed).toFixed(2)}
              decimals={0}
            />
          </Typography>
        </Box>
      </Stack>

      {/* Row 3: My Deposit (if connected) */}
      {connected && account && (
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
          {totalDeposit !== undefined && Number(totalDeposit) !== 0 ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleIcon
                sx={{color: theme.palette.primary.main}}
                fontSize="small"
              />
              <Typography sx={{fontSize: "0.85rem", fontWeight: 600}}>
                <CurrencyValue
                  amount={Number(totalDeposit).toString()}
                  currencyCode="APT"
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

function ValidatorRow({validator, columns, connected}: ValidatorRowProps) {
  const {account, wallet} = useWallet();
  const logEvent = useLogEventWithBasic();
  const {totalVotingPower} = useGetValidatorSet();
  const validatorVotingPower = validator.voting_power;
  const networkPercentage = calculateNetworkPercentage(
    validatorVotingPower,
    totalVotingPower,
  );
  const {commission, status} = validator;

  const rowClick = (address: Types.Address) => {
    logEvent("delegation_validators_row_clicked", address, {
      commission: commission?.toString() ?? "",
      delegated_stake_amount: validatorVotingPower ?? "",
      network_percentage: networkPercentage ?? "",
      wallet_address: addressFromWallet(account?.address),
      wallet_name: wallet?.name ?? "",
      validator_status: status.toString(),
    });
  };

  // Hide delegators that are inactive and have no delegated stake
  // TODO: Don't show inactive validators unless the users have a deposit
  // Would require some querying restructing to be efficient.
  if (
    getValidatorStatus(status) === "Inactive" &&
    validatorVotingPower === "0"
  ) {
    return null;
  }

  return (
    <GeneralTableRow
      to={`/validator/${validator.owner_address}`}
      onClick={() => rowClick(validator.owner_address)}
    >
      {columns.map((column) => {
        const Cell = DelegationValidatorCells[column];
        return (
          <Cell
            key={column}
            validator={validator}
            commission={commission}
            delegatedStakeAmount={validatorVotingPower}
            networkPercentage={networkPercentage}
            connected={connected}
            validatorStatus={getValidatorStatus(status)}
          />
        );
      })}
    </GeneralTableRow>
  );
}

export function DelegationValidatorsTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const aptosClient = useAptosClient();
  const {validators} = useGetValidators();
  const {connected} = useWallet();
  const columns = connected
    ? DEFAULT_COLUMNS
    : COLUMNS_WITHOUT_WALLET_CONNECTION;
  const [sortColumn, setSortColumn] = useState<Column>("rewardsEarned");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const {delegatedStakingPools, loading} =
    useGetDelegatedStakingPoolList() ?? [];

  // Calculate delegationValidators during render instead of using useEffect
  const delegationValidators = useMemo(() => {
    if (!loading) {
      // delegated staking pools that are in validators list, meaning that they are either active or once active now inactive
      const validatorsInDelegatedStakingPools: ValidatorData[] =
        validators.filter((validator) => {
          return delegatedStakingPools.some(
            (pool) => pool.staking_pool_address === validator.owner_address,
          );
        });

      // delegated staking pools that are not in validators list, meaning that they were never active
      const delegatedStakingPoolsNotInValidators: ValidatorData[] =
        delegatedStakingPools
          .filter((pool) => {
            return !validators.some(
              (validator) =>
                validator.owner_address === pool.staking_pool_address,
            );
          })
          .map((pool) => ({
            owner_address: pool.staking_pool_address,
            operator_address: pool.current_staking_pool.operator_address,
            voting_power: "0",
            governance_voting_record: "",
            last_epoch: 0,
            last_epoch_performance: "",
            liveness: 0,
            rewards_growth: 0,
            apt_rewards_distributed: 0,
          }));
      return [
        ...validatorsInDelegatedStakingPools,
        ...delegatedStakingPoolsNotInValidators,
      ];
    }
    return [];
  }, [validators, loading, delegatedStakingPools]);
  const sortedValidators = useMemo(
    () => getSortedValidators(delegationValidators, sortColumn, sortDirection),
    [delegationValidators, sortColumn, sortDirection],
  );
  const sortedValidatorAddrs = useMemo(
    () => sortedValidators.map((v) => v.owner_address),
    [sortedValidators],
  );
  const {data: sortedValidatorsWithCommissionAndState, error} = useQuery<
    Types.MoveValue[],
    ResponseError,
    Array<ValidatorData & {commission: number; status: number}>
  >({
    queryKey: [
      "validatorCommisionAndState",
      aptosClient,
      ...sortedValidatorAddrs,
    ],
    queryFn: () =>
      getValidatorCommissionAndState(aptosClient, sortedValidatorAddrs),
    select: (res) => {
      /// First arg is always the return value
      const ret = res[0] as Array<[unknown, unknown]>;
      return sortedValidators.map((v, i) => {
        const commission = ret[i]?.[0];
        const state = ret[i]?.[1];
        return {
          ...v,
          commission: commission ? Number(commission) / 100 : 0,
          status: state ? Number(state) : 0,
        };
      });
    }, // commission rate: 22.85% is represented as 2285
    // Validator commission and state are semi-static - cache for 1 minute
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  if (error) {
    return <Error error={error} />;
  }

  // Mobile card view
  if (isMobile) {
    return (
      <Box>
        {sortedValidatorsWithCommissionAndState?.map((validator) => (
          <DelegationValidatorCard
            key={validator.owner_address}
            validator={validator}
            connected={connected}
          />
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
                connected={connected}
              />
            ))}
          </TableRow>
        </TableHead>
        <GeneralTableBody>
          {sortedValidatorsWithCommissionAndState?.map((validator) => {
            return (
              <ValidatorRow
                key={validator.owner_address}
                validator={validator}
                columns={columns}
                connected={connected}
              />
            );
          })}
        </GeneralTableBody>
      </Table>
    </Box>
  );
}
