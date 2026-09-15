import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {useContext, useEffect, useState} from "react";
import type {Types} from "~/types/aptos";
import {getAddStakeFee} from "../../api";
import {
  StakeOperation,
  useGetDelegationState,
  useSubmitStakeOperation,
} from "../../api/hooks/delegations";
import type {ValidatorData} from "../../api/hooks/useGetValidators";
import ContentBoxSpaceBetween from "../../components/IndividualPageContent/ContentBoxSpaceBetween";
import ContentRowSpaceBetween from "../../components/IndividualPageContent/ContentRowSpaceBetween";
import TimestampValue from "../../components/IndividualPageContent/ContentValue/TimestampValue";
import LoadingModal from "../../components/LoadingModal";
import StyledDialog from "../../components/StyledDialog";
import StyledTooltip, {
  StyledLearnMoreTooltip,
} from "../../components/StyledTooltip";
import TransactionResponseSnackbar from "../../components/snakebar/TransactionResponseSnackbar";
import TooltipTypography from "../../components/TooltipTypography";
import {OCTA} from "../../constants";
import {
  useAptosClient,
  useNetworkValue,
} from "../../global-config/GlobalConfig";
import {useTranslation} from "../../i18n";
import {getSemanticColors} from "../../themes/colors/aptosBrandColors";
import {addressFromWallet} from "../../utils";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";
import {REWARDS_LEARN_MORE_LINK} from "../Validators/Components/Staking";
import {MINIMUM_APT_IN_POOL} from "./constants";
import {DelegationStateContext} from "./context/DelegationContext";
import useAmountInput from "./hooks/useAmountInput";
import TransactionSucceededDialog from "./TransactionSucceededDialog";
import {getStakeOperationAPTRequirement} from "./utils";

type StakeOperationDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
  stakeOperation: StakeOperation;
  commission?: number | undefined;
  canWithdrawPendingInactive: Types.MoveValue;
  stakes: Types.MoveValue[];
};

export default function StakeOperationDialog({
  handleDialogClose,
  isDialogOpen,
  stakeOperation,
  commission,
  canWithdrawPendingInactive,
  stakes,
}: StakeOperationDialogProps) {
  const {accountResource, validator} = useContext(DelegationStateContext);

  if (!validator || !accountResource) {
    return null;
  }

  return (
    <StakeOperationDialogContent
      handleDialogClose={handleDialogClose}
      isDialogOpen={isDialogOpen}
      stakeOperation={stakeOperation}
      canWithdrawPendingInactive={canWithdrawPendingInactive}
      stakes={stakes}
      commission={commission}
      accountResource={accountResource}
      validator={validator}
    />
  );
}

function StakeOperationDialogContent({
  handleDialogClose,
  isDialogOpen,
  stakeOperation,
  canWithdrawPendingInactive,
  stakes,
  commission,
  accountResource,
  validator,
}: StakeOperationDialogProps & {
  accountResource: Types.MoveResource;
  validator: ValidatorData;
}) {
  const {t} = useTranslation();
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const {balance, lockedUntilSecs, rewardsRateYearly} = useGetDelegationState(
    accountResource,
    validator,
  );
  const percentageSelection = [0.1, 0.25, 0.5, 1]; // 0.1 === 10%
  const {account, wallet} = useWallet();

  const {
    submitStakeOperation,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitStakeOperation();
  const {amount, setAmount, renderAmountTextField, validateAmountInput} =
    useAmountInput(stakeOperation);

  // Track which transaction hash has been dismissed (instead of a boolean that needs reset)
  const [dismissedTxHash, setDismissedTxHash] = useState<string | null>(null);

  // Calculate values during render instead of using useEffect
  const transactionHash = transactionResponse?.transactionSubmitted
    ? transactionResponse?.transactionHash
    : "";
  const enteredAmount = transactionResponse?.transactionSubmitted ? amount : "";
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  // Update current time every second to avoid calling Date.now() during render
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minMax = getStakeOperationAPTRequirement(
    stakes,
    stakeOperation,
    Number(balance),
  );
  const {suggestedMax, min, max} = minMax;
  const handleClose = () => {
    handleDialogClose();
    setAmount("");
  };

  const _networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const [addStakeFee, setAddStakeFee] = useState<Types.MoveValue>(0);
  const logEvent = useLogEventWithBasic();

  useEffect(() => {
    async function fetchData() {
      if (stakeOperation === StakeOperation.STAKE) {
        const fee = await getAddStakeFee(
          aptosClient,
          validator?.owner_address,
          Number(amount).toFixed(8),
        );
        setAddStakeFee(fee[0]);
      }
    }
    fetchData();
  }, [aptosClient, amount, stakeOperation, validator]);

  const onSubmitClick = async () => {
    logEvent("submit_transaction_button_clicked", stakeOperation, {
      validator_address: validator.owner_address,
      wallet_address: addressFromWallet(account?.address),
      wallet_name: wallet?.name ?? "",
      amount: amount,
    });
    await submitStakeOperation(
      validator.owner_address,
      Number((Number(amount) * OCTA).toFixed(0)),
      stakeOperation,
    );
  };

  const onCloseSnackbar = () => {
    clearTransactionResponse();
  };

  // Get current transaction hash (only if submitted)
  const currentTxHash =
    transactionResponse?.transactionSubmitted === true
      ? transactionResponse.transactionHash
      : null;

  const onCloseTransactionSucceededDialog = () => {
    // Mark this specific transaction as dismissed
    if (currentTxHash) {
      setDismissedTxHash(currentTxHash);
    }
    window.location.reload();
  };

  // Close the main dialog when transaction succeeds
  useEffect(() => {
    if (transactionResponse?.transactionSubmitted === true && isDialogOpen) {
      handleDialogClose();
    }
  }, [
    transactionResponse?.transactionSubmitted,
    isDialogOpen,
    handleDialogClose,
  ]);

  // Derive success dialog visibility: show if transaction submitted AND not dismissed
  // A new transaction (different hash) will show even if previous was dismissed
  const isTransactionSucceededDialogOpen =
    currentTxHash !== null && currentTxHash !== dismissedTxHash;

  const getAmount = () => {
    const stakedAmount = Number(stakes[0]) / OCTA;
    const withdrawAmount = Number(stakes[1]) / OCTA;
    const unlockedAmount = Number(stakes[2]) / OCTA;

    switch (stakeOperation) {
      case StakeOperation.STAKE:
        return Number(enteredAmount);
      case StakeOperation.UNLOCK:
        /**
         * if active pool has less than 10 apt after txn, unlock all
         * if pending_inactive pool has less than 10 apt after txn
         * if active pool has enough stake, unlock 10 apt to meet minimum requirement
         * else unlock all
         */
        if (
          enteredAmount &&
          stakedAmount - Number(enteredAmount) < MINIMUM_APT_IN_POOL &&
          enteredAmount !== stakedAmount.toString()
        ) {
          return stakedAmount;
        } else if (
          enteredAmount &&
          unlockedAmount + Number(enteredAmount) < MINIMUM_APT_IN_POOL &&
          enteredAmount !== stakedAmount.toString()
        ) {
          if (stakedAmount - MINIMUM_APT_IN_POOL > MINIMUM_APT_IN_POOL) {
            return MINIMUM_APT_IN_POOL;
          } else {
            return stakedAmount;
          }
        }
        return Math.min(Number(enteredAmount), stakedAmount);
      case StakeOperation.REACTIVATE:
        /**
         * if pending_inactive pool has less than 10 apt after txn, reactivate all
         * if active pool has less than 10 apt after txn, reactivate 10 apt to meet minimum requirement
         * if pending_inactive pool has enough stake, ractivate 10 apt to meet minimum requirement
         * else reactivate all
         */
        if (
          enteredAmount &&
          unlockedAmount - Number(enteredAmount) < MINIMUM_APT_IN_POOL &&
          enteredAmount !== unlockedAmount.toString()
        ) {
          return unlockedAmount;
        } else if (
          enteredAmount &&
          stakedAmount + Number(enteredAmount) < MINIMUM_APT_IN_POOL &&
          enteredAmount !== unlockedAmount.toString()
        ) {
          if (unlockedAmount - MINIMUM_APT_IN_POOL > MINIMUM_APT_IN_POOL) {
            return MINIMUM_APT_IN_POOL;
          } else {
            return unlockedAmount;
          }
        }
        return Math.min(Number(enteredAmount), unlockedAmount);
      case StakeOperation.WITHDRAW:
        return Math.min(Number(enteredAmount), withdrawAmount);
    }
  };

  const transactionSucceededDialog = (
    <TransactionSucceededDialog
      isDialogOpen={isTransactionSucceededDialogOpen}
      handleDialogClose={onCloseTransactionSucceededDialog}
      amount={getAmount().toString()}
      transactionHash={transactionHash}
      stakeOperation={stakeOperation}
    />
  );

  const isAmountValid = validateAmountInput(min, max);
  const stakeDialog = (
    <StyledDialog handleDialogClose={handleClose} open={isDialogOpen}>
      <DialogTitle variant="h5" sx={{textAlign: "center"}}>
        {t("staking.stakeIntoPool")}
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2}>
          {renderAmountTextField(stakes, balance)}
          <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: "wrap"}}>
            {min ? (
              <Button
                variant="outlined"
                onClick={() => setAmount(min.toString())}
              >
                {t("staking.min")}
              </Button>
            ) : null}
            {max !== null && (
              <Button
                variant="outlined"
                onClick={() => setAmount(max.toString())}
              >
                {t("staking.max")}
              </Button>
            )}
          </Stack>
          <ContentBoxSpaceBetween>
            <ContentRowSpaceBetween
              titleKey="fields.stakingFee"
              value={`${Number(addStakeFee) / OCTA} APT`}
              tooltip={
                <StyledLearnMoreTooltip text={t("staking.stakeFeeTip")} />
              }
            />
            <ContentRowSpaceBetween
              titleKey="fields.operatorCommission"
              value={commission && `${commission}%`}
            />
            <ContentRowSpaceBetween
              titleKey="fields.compoundRewards"
              value={`${rewardsRateYearly}% APR`}
              tooltip={
                <StyledLearnMoreTooltip
                  text={t("staking.rewardsAprTip")}
                  link={REWARDS_LEARN_MORE_LINK}
                />
              }
            />
            {Number(lockedUntilSecs) > currentTime / 1000 && (
              <ContentRowSpaceBetween
                titleKey="fields.nextUnlockIn"
                value={
                  <TimestampValue
                    timestamp={
                      lockedUntilSecs?.toString() ?? t("common.unknown")
                    }
                    ensureMilliSeconds
                  />
                }
              />
            )}
          </ContentBoxSpaceBetween>
        </Stack>
      </DialogContent>
      <DialogContent sx={{textAlign: "center"}}>
        {commission === 100 ? (
          <TooltipTypography
            sx={{textAlign: "center"}}
            variant="body2"
            color={semanticColors.status.error}
          >
            {t("staking.commission100")}
          </TooltipTypography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <StyledTooltip
          title={t("staking.stakeMinMax", {
            min: String(min),
            max: String(Number(balance) / OCTA),
          })}
          disableHoverListener={isAmountValid}
          placement="top"
        >
          <Box
            sx={{
              width: "100%",
            }}
          >
            <Button
              onClick={onSubmitClick}
              variant="primary"
              fullWidth
              disabled={!isAmountValid}
            >
              {t("staking.deposit")}
            </Button>
          </Box>
        </StyledTooltip>
      </DialogActions>
      <DialogContent sx={{textAlign: "center"}}>
        <Typography variant="caption" color={theme.palette.text.secondary}>
          <div>{t("staking.researchFull")}</div>
        </Typography>
      </DialogContent>
    </StyledDialog>
  );

  const UnlockOrReactivateDialog = (
    <StyledDialog handleDialogClose={handleClose} open={isDialogOpen}>
      <DialogTitle variant="h5" sx={{textAlign: "center"}}>
        {stakeOperation === StakeOperation.UNLOCK
          ? t("staking.unstakeFunds")
          : t("staking.restakeFunds")}
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2}>
          {renderAmountTextField(stakes)}
          <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: "wrap"}}>
            {min ? (
              <Button
                variant="outlined"
                onClick={() => setAmount(min.toString())}
              >
                {t("staking.min")}
              </Button>
            ) : null}
            {suggestedMax !== null && (
              <Button
                variant="outlined"
                onClick={() => setAmount(suggestedMax.toString())}
              >
                {t("staking.suggestedMax")}
              </Button>
            )}
            {max !== null && (
              <Button
                variant="outlined"
                onClick={() => setAmount(max.toString())}
              >
                {t("staking.max")}
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onSubmitClick}
          variant="primary"
          fullWidth
          disabled={amount === ""}
        >
          {stakeOperation === StakeOperation.UNLOCK
            ? t("staking.op.unstake")
            : t("staking.op.restake")}
        </Button>
      </DialogActions>
      <DialogContent sx={{textAlign: "center"}}>
        <Typography variant="caption" color={theme.palette.text.secondary}>
          <div>{t("staking.researchShort")}</div>
        </Typography>
      </DialogContent>
    </StyledDialog>
  );

  const withdrawStake = canWithdrawPendingInactive
    ? Math.max(Number(stakes[2]), Number(stakes[1]))
    : stakes[1];
  const WithdrawDialog = (
    <StyledDialog handleDialogClose={handleDialogClose} open={isDialogOpen}>
      <DialogTitle variant="h5" sx={{textAlign: "center"}}>
        {t("staking.withdrawFunds")}
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2}>
          {renderAmountTextField(stakes)}
          <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: "wrap"}}>
            {percentageSelection.map((percentage) => {
              return (
                <Button
                  key={percentage}
                  variant="outlined"
                  onClick={() =>
                    setAmount(
                      ((Number(withdrawStake) * percentage) / OCTA).toString(),
                    )
                  }
                >
                  {percentage === 1 ? t("staking.max") : `${percentage * 100}%`}
                </Button>
              );
            })}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onSubmitClick}
          variant="primary"
          fullWidth
          disabled={amount === ""}
        >
          {t("staking.op.withdraw")}
        </Button>
      </DialogActions>
      <DialogContent sx={{textAlign: "center"}}>
        <Typography variant="caption" color={theme.palette.text.secondary}>
          <div>{t("staking.researchShort")}</div>
        </Typography>
      </DialogContent>
    </StyledDialog>
  );

  function selectDialog() {
    switch (stakeOperation) {
      case StakeOperation.STAKE:
        return stakeDialog;
      case StakeOperation.REACTIVATE:
      case StakeOperation.UNLOCK:
        return UnlockOrReactivateDialog;
      case StakeOperation.WITHDRAW:
        return WithdrawDialog;
    }
  }

  return (
    <>
      <TransactionResponseSnackbar
        transactionResponse={transactionResponse}
        onCloseSnackbar={onCloseSnackbar}
      />
      <LoadingModal open={transactionInProcess} />
      {isTransactionSucceededDialogOpen
        ? transactionSucceededDialog
        : selectDialog()}
    </>
  );
}
