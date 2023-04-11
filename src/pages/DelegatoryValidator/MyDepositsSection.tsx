import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {
  Button,
  Skeleton,
  Stack,
  Table,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {AptosClient, Types} from "aptos";
import React, {useContext, useEffect, useState} from "react";
import {getCanWithdrawPendingInactive} from "../../api";
import {useGetAccountAPTBalance} from "../../api/hooks/useGetAccountAPTBalance";
import {useGetDelegatorStakeInfo} from "../../api/hooks/useGetDelegatorStakeInfo";
import {StakeOperation} from "../../api/hooks/useSubmitStakeOperation";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import StyledTooltip, {
  StyledLearnMoreTooltip,
} from "../../components/StyledTooltip";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import {useGlobalState} from "../../GlobalState";
import {assertNever} from "../../utils";
import MyDepositsStatusTooltip from "./Components/MyDepositsStatusTooltip";
import StakingStatusIcon, {
  StakingStatus,
  STAKING_STATUS_STEPS,
} from "./Components/StakingStatusIcon";
import {DelegationStateContext} from "./context/DelegationContext";
import StakeOperationDialog from "./StakeOperationDialog";
import {
  getStakeOperationAPTRequirement,
  getStakeOperationPrincipals,
  StakePrincipals,
} from "./utils";
import WalletConnectionDialog from "./WalletConnectionDialog";

const MyDepositsCells = Object.freeze({
  amount: AmountCell,
  status: StatusCell,
  rewardEarned: RewardEarnedCell,
  actions: ActionsCell,
});

type Column = keyof typeof MyDepositsCells;

function MyDepositsSectionHeaderCell({column}: {column: Column}) {
  switch (column) {
    case "amount":
      return (
        <GeneralTableHeaderCell
          header="AMOUNT"
          tooltip={
            <StyledLearnMoreTooltip text="Estimated current total amount including principals and rewards earned" />
          }
          sx={{paddingLeft: 3}}
        />
      );
    case "status":
      return (
        <GeneralTableHeaderCell
          header="STATUS"
          tooltip={<MyDepositsStatusTooltip steps={STAKING_STATUS_STEPS} />}
          textAlignRight
        />
      );
    case "rewardEarned":
      return (
        <GeneralTableHeaderCell
          header="REWARD EARNED"
          tooltip={
            <StyledLearnMoreTooltip text="Estimated rewards earned in the current staking status" />
          }
          textAlignRight
        />
      );
    case "actions":
      // TODO(jill): add a good tooltip on actions delegators can take
      return (
        <GeneralTableHeaderCell
          textAlignRight={true}
          header="ACTIONS"
          sx={{paddingRight: 3}}
        />
      );
    default:
      return assertNever(column);
  }
}

const DEFAULT_COLUMNS: Column[] = [
  "amount",
  "status",
  "rewardEarned",
  "actions",
];

const DEFAULT_COLUMNS_MOBILE: Column[] = ["amount", "status", "rewardEarned"];

type MyDepositsSectionCellProps = {
  handleClickOpen: () => void;
  stake: Types.MoveValue;
  status: StakingStatus;
  stakePrincipals: StakePrincipals | undefined;
  stakes: Types.MoveValue[];
  canWithdrawPendingInactive: Types.MoveValue;
};

function AmountCell({stake}: MyDepositsSectionCellProps) {
  return (
    <GeneralTableCell sx={{paddingLeft: 3}}>
      <APTCurrencyValue amount={stake.toString()} />
    </GeneralTableCell>
  );
}

function StatusCell({
  status,
  canWithdrawPendingInactive,
}: MyDepositsSectionCellProps) {
  return (
    <StakingStatusIcon
      status={
        canWithdrawPendingInactive && status === StakingStatus.WITHDRAW_PENDING
          ? StakingStatus.WITHDRAW_READY
          : status
      }
    />
  );
}

function RewardEarnedCell({
  stake,
  status,
  stakePrincipals,
  canWithdrawPendingInactive,
}: MyDepositsSectionCellProps) {
  const principalsAmount =
    status === StakingStatus.STAKED
      ? stakePrincipals?.activePrincipals
      : status === StakingStatus.WITHDRAW_PENDING
      ? stakePrincipals?.pendingInactivePrincipals
      : undefined;

  const rewardsEarned =
    principalsAmount && Number(stake) > principalsAmount
      ? Number(stake) - principalsAmount
      : undefined;

  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {status === StakingStatus.WITHDRAW_READY || canWithdrawPendingInactive ? (
        "N/A"
      ) : rewardsEarned === undefined ? (
        "In Progress"
      ) : (
        <APTCurrencyValue amount={rewardsEarned.toString()} />
      )}
    </GeneralTableCell>
  );
}

function ActionsCell({
  handleClickOpen,
  status,
  stakes,
  canWithdrawPendingInactive,
}: MyDepositsSectionCellProps) {
  const {account} = useWallet();
  const balance = useGetAccountAPTBalance(account?.address!);
  const requirement = getStakeOperationAPTRequirement(
    stakes,
    getStakeOperationFromStakingStatus(status, canWithdrawPendingInactive),
    Number(balance),
  );

  const buttonDisabled =
    status !== StakingStatus.WITHDRAW_READY && requirement.disabled;

  function getButtonTextFromStatus() {
    switch (status) {
      case StakingStatus.STAKED:
        return "UNSTAKE";
      case StakingStatus.WITHDRAW_PENDING:
        return canWithdrawPendingInactive ? "WITHDRAW" : "RESTAKE";
      case StakingStatus.WITHDRAW_READY:
        return "WITHDRAW";
    }
  }
  return (
    <GeneralTableCell sx={{textAlign: "right", paddingRight: 3}}>
      <StyledTooltip
        title={`You can't ${getButtonTextFromStatus().toLocaleLowerCase()} because minimum APT requirement is not met`}
        disableHoverListener={!buttonDisabled}
      >
        <span>
          <Button
            variant="primary"
            size="small"
            onClick={handleClickOpen}
            sx={{width: "30px", maxHeight: "40px"}}
            disabled={buttonDisabled}
          >
            <Typography>{getButtonTextFromStatus()}</Typography>
          </Button>
        </span>
      </StyledTooltip>
    </GeneralTableCell>
  );
}

type MyDepositsSectionProps = {
  setIsMyDepositsSectionSkeletonLoading: (arg: boolean) => void;
  isSkeletonLoading: boolean;
};

type MyDepositRowProps = {
  stake: Types.MoveValue;
  status: StakingStatus;
};

export default function MyDepositsSection({
  setIsMyDepositsSectionSkeletonLoading,
  isSkeletonLoading,
}: MyDepositsSectionProps) {
  const {accountResource, validator} = useContext(DelegationStateContext);

  if (!validator || !accountResource) {
    return null;
  }

  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const columns = isOnMobile ? DEFAULT_COLUMNS_MOBILE : DEFAULT_COLUMNS;
  const {connected, account} = useWallet();
  const {stakes} = useGetDelegatorStakeInfo(
    account?.address!,
    validator.owner_address,
  );
  const {stakePrincipals, isLoading: isStakeActivityLoading} =
    getStakeOperationPrincipals(account?.address!, validator.owner_address);

  // sc get_stake returns (active, inactive, pending_inactive), which translates to
  // (staked, withdraw_ready, withdraw_pending)
  // we need to switch the position of second and third index so that the order's sorted as steps
  const stakesInfo = [stakes[0], stakes[2], stakes[1]];

  useEffect(() => {
    if (!isStakeActivityLoading) {
      setIsMyDepositsSectionSkeletonLoading(false);
    }
  }, [isStakeActivityLoading]);

  const [state, _] = useGlobalState();
  const client = new AptosClient(state.network_value);
  const [canWithdrawPendingInactive, setCanWithdrawPendingInactive] =
    useState<Types.MoveValue>(false);

  useEffect(() => {
    async function fetchData() {
      const canWithdraw = await getCanWithdrawPendingInactive(
        client,
        validator!.owner_address,
      );
      setCanWithdrawPendingInactive(canWithdraw[0]);
    }
    fetchData();
  }, [validator.owner_address, state.network_value]);

  function MyDepositRow({stake, status}: MyDepositRowProps) {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const handleClose = () => {
      setDialogOpen(false);
    };
    const handleClickOpen = () => {
      setDialogOpen(true);
    };

    return (
      <>
        <GeneralTableRow>
          {columns.map((deposit) => {
            const Cell = MyDepositsCells[deposit];
            return (
              <Cell
                key={deposit}
                handleClickOpen={handleClickOpen}
                stake={stake}
                status={status}
                stakePrincipals={stakePrincipals}
                stakes={stakes}
                canWithdrawPendingInactive={canWithdrawPendingInactive}
              />
            );
          })}
        </GeneralTableRow>
        {connected ? (
          <StakeOperationDialog
            handleDialogClose={handleClose}
            isDialogOpen={dialogOpen}
            stakeOperation={getStakeOperationFromStakingStatus(
              status,
              canWithdrawPendingInactive,
            )}
            canWithdrawPendingInactive={canWithdrawPendingInactive}
          />
        ) : (
          <WalletConnectionDialog
            handleDialogClose={handleClose}
            isDialogOpen={dialogOpen}
          />
        )}
      </>
    );
  }

  const hasStakes = stakesInfo.some(
    (stake: Types.MoveValue) => stake && Number(stake) !== 0,
  );

  return isSkeletonLoading ? (
    <MyDepositSectionSkeleton />
  ) : hasStakes ? (
    <Stack>
      <Typography variant="h5" marginX={1}>
        My Deposits
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((columnName, idx) => (
              <MyDepositsSectionHeaderCell column={columnName} key={idx} />
            ))}
          </TableRow>
        </TableHead>
        <GeneralTableBody>
          {stakesInfo.map(
            (stake, idx) =>
              stake &&
              Number(stake) !== 0 && (
                <MyDepositRow key={idx} stake={Number(stake)} status={idx} />
              ),
          )}
        </GeneralTableBody>
      </Table>
    </Stack>
  ) : null;
}

function MyDepositSectionSkeleton() {
  return (
    <Stack spacing={1}>
      <Skeleton height={50}></Skeleton>
      <Skeleton height={30}></Skeleton>
      <Skeleton height={30}></Skeleton>
    </Stack>
  );
}

function getStakeOperationFromStakingStatus(
  status: StakingStatus,
  canWithdrawPendingInactive: Types.MoveValue,
) {
  switch (status) {
    case StakingStatus.STAKED:
      return StakeOperation.UNLOCK;
    case StakingStatus.WITHDRAW_PENDING:
      if (canWithdrawPendingInactive) {
        return StakeOperation.WITHDRAW;
      }
      return StakeOperation.REACTIVATE;
    case StakingStatus.WITHDRAW_READY:
      return StakeOperation.WITHDRAW;
  }
}
