import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {
  Box,
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
import {useContext, useEffect, useState} from "react";
import type {Types} from "~/types/aptos";
import {getCanWithdrawPendingInactive} from "../../api";
import {
  StakeOperation,
  useGetDelegatedStakeOperationActivities,
  useGetDelegatorStakeInfo,
} from "../../api/hooks/delegations";
import {useGetAccountAPTBalance} from "../../api/hooks/useGetAccountAPTBalance";
import type {ValidatorData} from "../../api/hooks/useGetValidators";
import ContentBoxSpaceBetween from "../../components/IndividualPageContent/ContentBoxSpaceBetween";
import ContentRowSpaceBetween from "../../components/IndividualPageContent/ContentRowSpaceBetween";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import StyledTooltip, {
  StyledLearnMoreTooltip,
} from "../../components/StyledTooltip";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import {useAptosClient} from "../../global-config/GlobalConfig";
import {addressFromWallet, assertNever} from "../../utils";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";
import MyDepositsStatusTooltip from "./Components/MyDepositsStatusTooltip";
import StakingStatusIcon, {
  STAKING_STATUS_STEPS,
  StakingStatus,
  StakingStatusChip,
} from "./Components/StakingStatusIcon";
import {DelegationStateContext} from "./context/DelegationContext";
import StakeOperationDialog from "./StakeOperationDialog";
import {
  getStakeOperationAPTRequirement,
  getStakeOperationLabel,
  getStakeOperationPrincipals,
  getStakeRewardsEarned,
  type StakePrincipals,
} from "./utils";
import WalletConnectionDialog from "./WalletConnectionDialog";

const MyDepositsCells = Object.freeze({
  amount: AmountCell,
  status: StatusCell,
  rewardEarned: RewardEarnedCell,
  actions: ActionsCell,
});

type Column = keyof typeof MyDepositsCells;

const REWARD_EARNED_TOOLTIP_TEXT =
  "Estimated rewards earned in the current staking status";

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
          tooltip={<StyledLearnMoreTooltip text={REWARD_EARNED_TOOLTIP_TEXT} />}
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

function getDisplayStatus(
  status: StakingStatus,
  canWithdrawPendingInactive: Types.MoveValue,
) {
  return canWithdrawPendingInactive && status === StakingStatus.WITHDRAW_PENDING
    ? StakingStatus.WITHDRAW_READY
    : status;
}

function StatusCell({
  status,
  canWithdrawPendingInactive,
}: MyDepositsSectionCellProps) {
  return (
    <StakingStatusIcon
      status={getDisplayStatus(status, canWithdrawPendingInactive)}
    />
  );
}

function RewardEarnedValue({
  stake,
  status,
  stakePrincipals,
  canWithdrawPendingInactive,
}: Pick<
  MyDepositsSectionCellProps,
  "stake" | "status" | "stakePrincipals" | "canWithdrawPendingInactive"
>) {
  const principalsAmount =
    status === StakingStatus.STAKED
      ? stakePrincipals?.activePrincipals
      : status === StakingStatus.WITHDRAW_PENDING
        ? stakePrincipals?.pendingInactivePrincipals
        : undefined;

  const rewardsEarned = getStakeRewardsEarned(stake, principalsAmount);

  if (status === StakingStatus.WITHDRAW_READY || canWithdrawPendingInactive) {
    return <>N/A</>;
  }
  if (rewardsEarned === undefined) {
    return <>In Progress</>;
  }
  return <APTCurrencyValue amount={rewardsEarned.toString()} />;
}

function RewardEarnedCell(props: MyDepositsSectionCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <RewardEarnedValue {...props} />
    </GeneralTableCell>
  );
}

function StakeActionButton({
  handleClickOpen,
  status,
  stakes,
  canWithdrawPendingInactive,
  fullWidth = false,
}: Pick<
  MyDepositsSectionCellProps,
  "handleClickOpen" | "status" | "stakes" | "canWithdrawPendingInactive"
> & {fullWidth?: boolean}) {
  const {account} = useWallet();
  // FIXME wallet address not guaranteed to be defined
  const balance = useGetAccountAPTBalance(addressFromWallet(account?.address));
  const stakeOperation = getStakeOperationFromStakingStatus(
    status,
    canWithdrawPendingInactive,
  );
  const requirement = getStakeOperationAPTRequirement(
    stakes,
    stakeOperation,
    Number(balance?.data ?? 0),
  );

  const buttonDisabled =
    status !== StakingStatus.WITHDRAW_READY && requirement.disabled;
  const label = getStakeOperationLabel(stakeOperation);

  return (
    <StyledTooltip
      title={`You can't ${label.toLocaleLowerCase()} because minimum APT requirement is not met`}
      disableHoverListener={!buttonDisabled}
    >
      <Box component="span" sx={{width: fullWidth ? "100%" : "auto"}}>
        <Button
          variant="primary"
          size="small"
          onClick={handleClickOpen}
          fullWidth={fullWidth}
          sx={{
            maxHeight: "40px",
            ...(fullWidth ? {minHeight: "40px"} : {width: "30px"}),
          }}
          disabled={buttonDisabled}
        >
          <Typography>{label}</Typography>
        </Button>
      </Box>
    </StyledTooltip>
  );
}

function ActionsCell(props: MyDepositsSectionCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right", paddingRight: 3}}>
      <StakeActionButton {...props} />
    </GeneralTableCell>
  );
}

type MyDepositsSectionProps = {
  setIsMyDepositsSectionSkeletonLoading: (arg: boolean) => void;
  isSkeletonLoading: boolean;
};

type MyDepositProps = {
  stake: Types.MoveValue;
  status: StakingStatus;
  stakes: Types.MoveValue[];
  stakePrincipals: StakePrincipals | undefined;
  canWithdrawPendingInactive: Types.MoveValue;
  validatorAddress: string;
};

/**
 * Owns the dialog state for a single deposit so both the desktop table row and
 * the mobile card can trigger the same stake operation flow.
 */
function useStakeOperationDialog({
  stake,
  status,
  stakes,
  canWithdrawPendingInactive,
  validatorAddress,
}: Omit<MyDepositProps, "stakePrincipals">) {
  const {connected, account, wallet} = useWallet();
  const logEvent = useLogEventWithBasic();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const stakeOperation = getStakeOperationFromStakingStatus(
    status,
    canWithdrawPendingInactive,
  );

  const handleClose = () => {
    setDialogOpen(false);
  };
  const handleClickOpen = () => {
    logEvent(`${stakeOperation}_button_clicked`, validatorAddress, {
      wallet_address: addressFromWallet(account?.address),
      wallet_name: wallet?.name ?? "",
      amount: Number(stake).toString(),
    });
    setDialogOpen(true);
  };

  const dialog = connected ? (
    <StakeOperationDialog
      handleDialogClose={handleClose}
      isDialogOpen={dialogOpen}
      stakeOperation={stakeOperation}
      canWithdrawPendingInactive={canWithdrawPendingInactive}
      stakes={stakes}
    />
  ) : (
    <WalletConnectionDialog
      handleDialogClose={handleClose}
      isDialogOpen={dialogOpen}
    />
  );

  return {handleClickOpen, dialog};
}

function MyDepositRow({
  columns,
  ...deposit
}: MyDepositProps & {
  columns: Column[];
}) {
  const {handleClickOpen, dialog} = useStakeOperationDialog(deposit);

  return (
    <>
      <GeneralTableRow>
        {columns.map((column) => {
          const Cell = MyDepositsCells[column];
          return (
            <Cell
              key={column}
              handleClickOpen={handleClickOpen}
              stake={deposit.stake}
              status={deposit.status}
              stakePrincipals={deposit.stakePrincipals}
              stakes={deposit.stakes}
              canWithdrawPendingInactive={deposit.canWithdrawPendingInactive}
            />
          );
        })}
      </GeneralTableRow>
      {dialog}
    </>
  );
}

function MyDepositCard(deposit: MyDepositProps) {
  const theme = useTheme();
  const {handleClickOpen, dialog} = useStakeOperationDialog(deposit);
  const {stake, status, stakes, stakePrincipals, canWithdrawPendingInactive} =
    deposit;

  return (
    <ContentBoxSpaceBetween sx={{marginTop: 0}}>
      <Stack
        direction="row"
        spacing={1}
        sx={{justifyContent: "space-between", alignItems: "flex-start"}}
      >
        <Stack direction="column" spacing={0.5}>
          <Typography
            variant="caption"
            sx={{color: theme.palette.text.secondary}}
          >
            AMOUNT
          </Typography>
          <Typography sx={{fontWeight: 600}}>
            <APTCurrencyValue amount={stake.toString()} />
          </Typography>
        </Stack>
        <StakingStatusChip
          status={getDisplayStatus(status, canWithdrawPendingInactive)}
        />
      </Stack>
      <ContentRowSpaceBetween
        title="Reward Earned"
        value={
          <RewardEarnedValue
            stake={stake}
            status={status}
            stakePrincipals={stakePrincipals}
            canWithdrawPendingInactive={canWithdrawPendingInactive}
          />
        }
        tooltip={<StyledLearnMoreTooltip text={REWARD_EARNED_TOOLTIP_TEXT} />}
      />
      <StakeActionButton
        handleClickOpen={handleClickOpen}
        status={status}
        stakes={stakes}
        canWithdrawPendingInactive={canWithdrawPendingInactive}
        fullWidth
      />
      {dialog}
    </ContentBoxSpaceBetween>
  );
}

export default function MyDepositsSection({
  setIsMyDepositsSectionSkeletonLoading,
  isSkeletonLoading,
}: MyDepositsSectionProps) {
  const {accountResource, validator} = useContext(DelegationStateContext);

  if (!validator || !accountResource) {
    return null;
  }

  return (
    <MyDepositSectionContent
      setIsMyDepositsSectionSkeletonLoading={
        setIsMyDepositsSectionSkeletonLoading
      }
      isSkeletonLoading={isSkeletonLoading}
      validator={validator}
    />
  );
}

function MyDepositSectionContent({
  setIsMyDepositsSectionSkeletonLoading,
  isSkeletonLoading,
  validator,
}: MyDepositsSectionProps & {
  validator: ValidatorData;
}) {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const {account} = useWallet();
  // FIXME: account is not guaranteed to be defined
  const walletAddress = addressFromWallet(account?.address);
  const {stakes} = useGetDelegatorStakeInfo(
    walletAddress,
    validator.owner_address,
  );
  const activities = useGetDelegatedStakeOperationActivities(
    walletAddress,
    validator.owner_address,
  );
  const {stakePrincipals, isLoading: isStakeActivityLoading} =
    getStakeOperationPrincipals(activities);

  // sc get_stake returns (active, inactive, pending_inactive), which translates to
  // (staked, withdraw_ready, withdraw_pending)
  // we need to switch the position of second and third index so that the order's sorted as steps
  const stakesInfo = [stakes[0], stakes[2], stakes[1]];

  useEffect(() => {
    if (!isStakeActivityLoading) {
      setIsMyDepositsSectionSkeletonLoading(false);
    }
  }, [isStakeActivityLoading, setIsMyDepositsSectionSkeletonLoading]);

  const aptosClient = useAptosClient();
  const [canWithdrawPendingInactive, setCanWithdrawPendingInactive] =
    useState<Types.MoveValue>(false);

  useEffect(() => {
    if (!validator?.owner_address) return;
    async function fetchData() {
      const canWithdraw = await getCanWithdrawPendingInactive(
        aptosClient,
        validator.owner_address,
      );
      setCanWithdrawPendingInactive(canWithdraw[0]);
    }
    fetchData();
  }, [validator?.owner_address, aptosClient]);

  const deposits = stakesInfo
    .map((stake, idx) => ({stake: Number(stake), status: idx as StakingStatus}))
    .filter(({stake}) => stake !== 0 && !Number.isNaN(stake));

  if (isSkeletonLoading) {
    return <MyDepositSectionSkeleton />;
  }

  if (deposits.length === 0) {
    return null;
  }

  return (
    <Stack>
      <Typography
        variant="h5"
        sx={{
          marginX: 1,
        }}
      >
        My Deposits
      </Typography>
      {isOnMobile ? (
        <Stack direction="column" spacing={2} sx={{marginTop: 2}}>
          {deposits.map(({stake, status}) => (
            <MyDepositCard
              key={status}
              stake={stake}
              status={status}
              stakes={stakes}
              stakePrincipals={stakePrincipals}
              canWithdrawPendingInactive={canWithdrawPendingInactive}
              validatorAddress={validator.owner_address}
            />
          ))}
        </Stack>
      ) : (
        <Table aria-label="My deposits" data-entity-type="deposit">
          <TableHead>
            <TableRow>
              {DEFAULT_COLUMNS.map((columnName) => (
                <MyDepositsSectionHeaderCell
                  column={columnName}
                  key={columnName}
                />
              ))}
            </TableRow>
          </TableHead>
          <GeneralTableBody>
            {deposits.map(({stake, status}) => (
              <MyDepositRow
                key={status}
                columns={DEFAULT_COLUMNS}
                stake={stake}
                status={status}
                stakes={stakes}
                stakePrincipals={stakePrincipals}
                canWithdrawPendingInactive={canWithdrawPendingInactive}
                validatorAddress={validator.owner_address}
              />
            ))}
          </GeneralTableBody>
        </Table>
      )}
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
