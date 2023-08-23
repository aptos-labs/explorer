import React, {useEffect, useMemo, useState} from "react";
import {
  alpha,
  Box,
  Table,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../utils";
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
import {aptosColor, grey, primary} from "../../themes/colors/aptosColorPalette";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";
import {useGetDelegationNodeInfo} from "../../api/hooks/useGetDelegationNodeInfo";
import {OperatorAddrCell, ValidatorAddrCell} from "./ValidatorsTable";
import {useGetNumberOfDelegators} from "../../api/hooks/useGetNumberOfDelegators";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useGetDelegatorStakeInfo} from "../../api/hooks/useGetDelegatorStakeInfo";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {Stack} from "@mui/material";
import {useGetDelegatedStakingPoolList} from "../../api/hooks/useGetDelegatedStakingPoolList";
import {Statsig} from "statsig-react";
import ValidatorStatusIcon from "../DelegatoryValidator/Components/ValidatorStatusIcon";
import {useNavigate} from "../../routing";
import {ResponseError} from "../../api/client";
import Error from "../Account/Error";
import {
  ValidatorStatus,
  getValidatorStatus,
} from "../DelegatoryValidator/utils";

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
            <StyledLearnMoreTooltip text="Number of owner accounts who have delegated stake to this stake pool" />
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
  validator: ValidatorData;
  columns: Column[];
  connected: boolean;
  setError: (error: ResponseError) => void;
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
  const {delegatorBalance} = useGetNumberOfDelegators(validator.owner_address);
  return (
    <GeneralTableCell sx={{paddingRight: 10, textAlign: "right"}}>
      {delegatorBalance}
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
  return (
    <GeneralTableCell sx={{paddingRight: 10, textAlign: "right"}}>
      <Box>
        <APTCurrencyValue
          amount={delegatedStakeAmount ?? ""}
          fixedDecimalPlaces={0}
        />
      </Box>
      <Box sx={{fontSize: 11, color: grey[450]}}>{networkPercentage}%</Box>
    </GeneralTableCell>
  );
}

function ViewCell() {
  return (
    <GeneralTableCell>
      <VisibilityOutlinedIcon
        fontSize="small"
        sx={{
          color: "black",
          backgroundColor: aptosColor,
          "&:hover": {
            backgroundColor: alpha(primary["500"], 1),
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
  const [totalDeposit, setTotalDeposit] = useState<Types.MoveValue>();
  const {account} = useWallet();
  const {stakes} = useGetDelegatorStakeInfo(
    account?.address!,
    validator.owner_address,
  );

  useMemo(() => {
    setTotalDeposit(
      stakes.reduce(
        (prev, current) =>
          (current =
            Number(current) + (prev && Number(prev) !== 0 ? Number(prev) : 0)),
        0,
      ),
    );
  }, [stakes]);

  return (
    <GeneralTableCell sx={{paddingRight: 5, textAlign: "right"}}>
      {Number(totalDeposit) !== 0 ? (
        <Stack direction="row" spacing={1.5}>
          <CheckCircleIcon sx={{color: aptosColor}} fontSize="small" />
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

function ValidatorRow({
  validator,
  columns,
  connected,
  setError,
}: ValidatorRowProps) {
  const navigate = useNavigate();
  const {account, wallet} = useWallet();

  const {
    commission,
    delegatedStakeAmount,
    networkPercentage,
    validatorStatus,
    error,
  } = useGetDelegationNodeInfo({
    validatorAddress: validator.owner_address,
  });
  const rowClick = (address: Types.Address) => {
    Statsig.logEvent("delegation_validators_row_clicked", address, {
      commission: commission?.toString() ?? "",
      delegated_stake_amount: delegatedStakeAmount ?? "",
      network_percentage: networkPercentage ?? "",
      wallet_address: account?.address ?? "",
      wallet_name: wallet?.name ?? "",
      validator_status: validatorStatus ? validatorStatus[0].toString() : "",
    });
    navigate(`/validator/${address}`);
  };

  if (error) {
    setError(error);
  }

  // Hide delegators that are inactive and have no delegated stake
  // TODO: Don't show inactive validators unless the users have a deposit
  // Would require some querying restructing to be efficient.
  if (
    validatorStatus &&
    getValidatorStatus(validatorStatus) === "Inactive" &&
    delegatedStakeAmount === "0"
  ) {
    return null;
  }

  return (
    <GeneralTableRow onClick={() => rowClick(validator.owner_address)}>
      {columns.map((column) => {
        const Cell = DelegationValidatorCells[column];
        return (
          <Cell
            key={column}
            validator={validator}
            commission={commission}
            delegatedStakeAmount={delegatedStakeAmount}
            networkPercentage={networkPercentage}
            connected={connected}
            validatorStatus={
              validatorStatus ? getValidatorStatus(validatorStatus) : undefined
            }
          />
        );
      })}
    </GeneralTableRow>
  );
}

export function DelegationValidatorsTable() {
  const [state, _] = useGlobalState();
  const {validators} = useGetValidators(state.network_name);
  const {connected} = useWallet();
  const columns = connected
    ? DEFAULT_COLUMNS
    : COLUMNS_WITHOUT_WALLET_CONNECTION;
  const [sortColumn, setSortColumn] = useState<Column>("rewardsEarned");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const [delegationValidators, setDelegationValidators] = useState<
    ValidatorData[]
  >([]);
  const {delegatedStakingPools, loading} =
    useGetDelegatedStakingPoolList() ?? [];
  const [error, setError] = useState<ResponseError | null>();
  const sortedValidators = getSortedValidators(
    delegationValidators,
    sortColumn,
    sortDirection,
  );

  useEffect(() => {
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
      setDelegationValidators([
        ...validatorsInDelegatedStakingPools,
        ...delegatedStakingPoolsNotInValidators,
      ]);
    }
  }, [validators, state.network_value, loading, delegatedStakingPools]);

  if (error) {
    return <Error error={error} />;
  }
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
              connected={connected}
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
              columns={columns}
              connected={connected}
              setError={setError}
            />
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
