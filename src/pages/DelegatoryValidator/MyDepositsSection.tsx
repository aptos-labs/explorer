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
import {Types} from "aptos";
import React, {useEffect, useState} from "react";
import {useGetDelegatorStakeInfo} from "../../api/hooks/useGetDelegatorStakeInfo";
import {ValidatorData} from "../../api/hooks/useGetValidators";
import {StakeOperation} from "../../api/hooks/useSubmitStakeOperation";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import TimestampValue from "../../components/IndividualPageContent/ContentValue/TimestampValue";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import {assertNever} from "../../utils";
import MyDepositsStatusTooltip from "./Components/MyDepositsStatusTooltip";
import StakingStatusIcon, {
  StakingStatus,
  STAKING_STATUS_STEPS,
} from "./Components/StakingStatusIcon";
import StakeOperationDialog from "./StakeOperationDialog";
import {getLockedUtilSecs} from "./utils";
import WalletConnectionDialog from "./WalletConnectionDialog";

const MyDepositsCells = Object.freeze({
  amount: AmountCell,
  status: StatusCell,
  unlockDate: UnlockDateCell,
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
        />
      );
    case "status":
      return (
        <GeneralTableHeaderCell
          header="STATUS"
          tooltip={<MyDepositsStatusTooltip steps={STAKING_STATUS_STEPS} />}
        />
      );
    case "unlockDate":
      return (
        <GeneralTableHeaderCell
          header="UNLOCK DATE"
          tooltip={
            <StyledLearnMoreTooltip text="When tokens will be available for removal from the stake pool" />
          }
        />
      );
    case "rewardEarned":
      return (
        <GeneralTableHeaderCell
          header="REWARD EARNED"
          tooltip={
            <StyledLearnMoreTooltip text="Estimated rewards earned in the current staking status" />
          }
        />
      );
    case "actions":
      // TODO(jill): add a good tooltip on actions delegators can take
      return <GeneralTableHeaderCell textAlignRight={true} header="ACTIONS" />;
    default:
      return assertNever(column);
  }
}

const DEFAULT_COLUMNS: Column[] = [
  "amount",
  "status",
  "unlockDate",
  "rewardEarned",
  "actions",
];

const DEFAULT_COLUMNS_MOBILE: Column[] = [
  "amount",
  "status",
  "unlockDate",
  "rewardEarned",
];

type MyDepositsSectionCellProps = {
  handleClickOpen: () => void;
  accountResource?: Types.MoveResource | undefined;
  stake: Types.MoveValue;
  status: StakingStatus;
};

function AmountCell({stake}: MyDepositsSectionCellProps) {
  return (
    <GeneralTableCell>
      <APTCurrencyValue amount={stake.toString()} />
    </GeneralTableCell>
  );
}

function StatusCell({status}: MyDepositsSectionCellProps) {
  return <StakingStatusIcon status={status} />;
}

function UnlockDateCell({accountResource}: MyDepositsSectionCellProps) {
  const lockedUntilSecs = getLockedUtilSecs(accountResource);
  if (!lockedUntilSecs) {
    return null;
  }
  return (
    <GeneralTableCell>
      <TimestampValue timestamp={lockedUntilSecs?.toString()!} />
    </GeneralTableCell>
  );
}

function RewardEarnedCell({}: MyDepositsSectionCellProps) {
  return (
    <GeneralTableCell>
      <APTCurrencyValue amount={""} />
    </GeneralTableCell>
  );
}

function ActionsCell({handleClickOpen, status}: MyDepositsSectionCellProps) {
  function getButtonTextFromStatus() {
    switch (status) {
      case StakingStatus.STAKED:
        return "UNSTAKE";
      case StakingStatus.WITHDRAW_PENDING:
        return "RESTAKE";
      case StakingStatus.WITHDRAW_READY:
        return "WITHDRAW";
    }
  }
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <Button
        variant="primary"
        size="small"
        onClick={handleClickOpen}
        sx={{maxWidth: "10%", paddingY: 1}}
      >
        <Typography>{getButtonTextFromStatus()}</Typography>
      </Button>
    </GeneralTableCell>
  );
}

type MyDepositsSectionProps = {
  accountResource?: Types.MoveResource | undefined;
  validator: ValidatorData;
  setIsMyDepositsSectionSkeletonLoading: (arg: boolean) => void;
  isSkeletonLoading: boolean;
};

type MyDepositRowProps = {
  stake: Types.MoveValue;
  status: StakingStatus;
};

export default function MyDepositsSection({
  accountResource,
  validator,
  setIsMyDepositsSectionSkeletonLoading,
  isSkeletonLoading,
}: MyDepositsSectionProps) {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const columns = isOnMobile ? DEFAULT_COLUMNS_MOBILE : DEFAULT_COLUMNS;
  const {connected, account} = useWallet();
  const {stakes} = useGetDelegatorStakeInfo(
    account?.address!,
    validator.owner_address,
  );

  // sc get_stake returns (active, inactive, pending_inactive), which translates to
  // (staked, withdraw_ready, withdraw_pending)
  // we need to switch the position of second and third index so that the order's sorted as steps
  const stakesInfo = [stakes[0], stakes[2], stakes[1]];

  useEffect(() => {
    if (stakes && account) {
      setIsMyDepositsSectionSkeletonLoading(false);
    }
  }, [stakes, account]);

  function MyDepositRow({stake, status}: MyDepositRowProps) {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const handleClose = () => {
      setDialogOpen(false);
    };
    const handleClickOpen = () => {
      setDialogOpen(true);
    };

    function getStakeOperationFromStakingStatus() {
      switch (status) {
        case StakingStatus.STAKED:
          return StakeOperation.UNLOCK;
        case StakingStatus.WITHDRAW_PENDING:
          return StakeOperation.REACTIVATE;
        case StakingStatus.WITHDRAW_READY:
          return StakeOperation.WITHDRAW;
      }
    }

    return (
      <>
        <GeneralTableRow>
          {columns.map((deposit) => {
            const Cell = MyDepositsCells[deposit];
            return (
              <Cell
                key={deposit}
                accountResource={accountResource}
                handleClickOpen={handleClickOpen}
                stake={stake}
                status={status}
              />
            );
          })}
        </GeneralTableRow>
        {connected ? (
          <StakeOperationDialog
            handleDialogClose={handleClose}
            isDialogOpen={dialogOpen}
            accountResource={accountResource}
            validator={validator}
            stake={stake}
            stakeOperation={getStakeOperationFromStakingStatus()}
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

  return isSkeletonLoading ? (
    <MyDepositSectionSkeleton />
  ) : (
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
              Number(stake) !== 0 && (
                <MyDepositRow key={idx} stake={Number(stake)} status={idx} />
              ),
          )}
        </GeneralTableBody>
      </Table>
    </Stack>
  );
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
