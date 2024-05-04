import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import {useContext, useEffect, useState} from "react";
import TimestampValue from "../../components/IndividualPageContent/ContentValue/TimestampValue";
import {grey, negativeColor} from "../../themes/colors/aptosColorPalette";
import {getStakeOperationAPTRequirement} from "./utils";
import StyledDialog from "../../components/StyledDialog";
import StyledTooltip, {
  StyledLearnMoreTooltip,
} from "../../components/StyledTooltip";
import {
  REWARDS_LEARN_MORE_LINK,
  REWARDS_TOOLTIP_TEXT,
} from "../Validators/Components/Staking";
import ContentBoxSpaceBetween from "../../components/IndividualPageContent/ContentBoxSpaceBetween";
import ContentRowSpaceBetween from "../../components/IndividualPageContent/ContentRowSpaceBetween";
import useAmountInput from "./hooks/useAmountInput";
import LoadingModal from "../../components/LoadingModal";
import TransactionResponseSnackbar from "../../components/snakebar/TransactionResponseSnackbar";
import TransactionSucceededDialog from "./TransactionSucceededDialog";
import useSubmitStakeOperation, {
  StakeOperation,
} from "../../api/hooks/useSubmitStakeOperation";
import {OCTA} from "../../constants";
import {useGetDelegationState} from "../../api/hooks/useGetDelegationState";
import {DelegationStateContext} from "./context/DelegationContext";
import {AptosClient, Types} from "aptos";
import {getAddStakeFee} from "../../api";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {MINIMUM_APT_IN_POOL} from "./constants";
import {ValidatorData} from "../../api/hooks/useGetValidators";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";
import TooltipTypography from "../../components/TooltipTypography";

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

  const [transactionHash, setTransactionHash] = useState<string>("");
  const [enteredAmount, setEnteredAmount] = useState<string>("");
  const [
    isTransactionSucceededDialogOpen,
    setIsTransactionSucceededDialogOpen,
  ] = useState<boolean>(false);

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

  const [state] = useGlobalState();
  const [addStakeFee, setAddStakeFee] = useState<Types.MoveValue>(0);
  const logEvent = useLogEventWithBasic();

  useEffect(() => {
    const client = new AptosClient(state.network_value);
    async function fetchData() {
      if (stakeOperation === StakeOperation.STAKE) {
        const fee = await getAddStakeFee(
          client,
          validator!.owner_address,
          Number(amount).toFixed(8),
        );
        setAddStakeFee(fee[0]);
      }
    }
    fetchData();
  }, [state.network_value, amount, stakeOperation, validator]);

  const onSubmitClick = async () => {
    logEvent("submit_transaction_button_clicked", stakeOperation, {
      validator_address: validator.owner_address,
      wallet_address: account?.address ?? "",
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

  const onCloseTransactionSucceededDialog = () => {
    setIsTransactionSucceededDialogOpen(false);
    window.location.reload();
  };

  useEffect(() => {
    if (transactionResponse?.transactionSubmitted) {
      setTransactionHash(transactionResponse?.transactionHash);
      setEnteredAmount(amount);
      handleDialogClose();
      setIsTransactionSucceededDialogOpen(true);
    }
  }, [
    transactionResponse,
    amount,
    handleDialogClose,
    setIsTransactionSucceededDialogOpen,
  ]);

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
      <DialogTitle variant="h5" textAlign="center">
        Stake Into The Pool
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2}>
          {renderAmountTextField(stakes, balance)}
          <Stack direction="row" spacing={1}>
            {min ? (
              <Button
                variant="outlined"
                onClick={() => setAmount(min.toString())}
              >
                MIN
              </Button>
            ) : null}
            {max !== null && (
              <Button
                variant="outlined"
                onClick={() => setAmount(max.toString())}
              >
                MAX
              </Button>
            )}
          </Stack>
          <ContentBoxSpaceBetween>
            <ContentRowSpaceBetween
              title={"Staking Fee"}
              value={Number(addStakeFee) / OCTA + " APT"}
              tooltip={
                <StyledLearnMoreTooltip
                  text={
                    "Refundable stake fee, that will be deducted from the current staking amount, to be returned to delegator after the current epoch ends."
                  }
                />
              }
            />
            <ContentRowSpaceBetween
              title={"Operator Commission"}
              value={commission && `${commission}%`}
            />
            <ContentRowSpaceBetween
              title={"Compound Rewards"}
              value={`${rewardsRateYearly}% APR`}
              tooltip={
                <StyledLearnMoreTooltip
                  text={REWARDS_TOOLTIP_TEXT}
                  link={REWARDS_LEARN_MORE_LINK}
                />
              }
            />
            {Number(lockedUntilSecs) > Date.now() / 1000 && (
              <ContentRowSpaceBetween
                title={"Next Unlock In"}
                value={
                  <TimestampValue
                    timestamp={lockedUntilSecs?.toString()!}
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
            textAlign="center"
            variant="body2"
            color={negativeColor}
          >
            The commission rate for this pool is 100%, you will not receive
            rewards.
          </TooltipTypography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <StyledTooltip
          title={`Minimum stake amount is ${min} APT and maximum stake amount is ${
            Number(balance) / OCTA
          } APT`}
          disableHoverListener={isAmountValid}
          placement="top"
        >
          <Box width="100%" marginRight={"2rem"}>
            <Button
              onClick={onSubmitClick}
              variant="primary"
              fullWidth
              disabled={!isAmountValid}
              sx={{marginX: 2}}
            >
              Deposit
            </Button>
          </Box>
        </StyledTooltip>
      </DialogActions>
      <DialogContent sx={{textAlign: "center"}}>
        <Typography variant="caption" color={grey[450]}>
          <div>
            Please do your own research. Aptos Labs is not responsible for the
            performance of the validator nodes displayed here, or the security
            of your funds
          </div>
        </Typography>
      </DialogContent>
    </StyledDialog>
  );

  const UnlockOrReactivateDialog = (
    <StyledDialog handleDialogClose={handleClose} open={isDialogOpen}>
      <DialogTitle variant="h5" textAlign="center">
        {stakeOperation === StakeOperation.UNLOCK
          ? "Unstake Funds"
          : "Restake Funds"}
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2}>
          {renderAmountTextField(stakes)}
          <Stack direction="row" spacing={1}>
            {min ? (
              <Button
                variant="outlined"
                onClick={() => setAmount(min.toString())}
              >
                MIN
              </Button>
            ) : null}
            {suggestedMax !== null && (
              <Button
                variant="outlined"
                onClick={() => setAmount(suggestedMax.toString())}
              >
                SUGGESTED MAX
              </Button>
            )}
            {max !== null && (
              <Button
                variant="outlined"
                onClick={() => setAmount(max.toString())}
              >
                MAX
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
          sx={{marginX: 2}}
        >
          {stakeOperation === StakeOperation.UNLOCK ? "UNSTAKE" : "RESTAKE"}
        </Button>
      </DialogActions>
      <DialogContent sx={{textAlign: "center"}}>
        <Typography variant="caption" color={grey[450]}>
          <div>
            Please do your own research. Aptos Labs is not responsible for the
            security of your funds
          </div>
        </Typography>
      </DialogContent>
    </StyledDialog>
  );

  const withdrawStake = canWithdrawPendingInactive
    ? Math.max(Number(stakes[2]), Number(stakes[1]))
    : stakes[1];
  const WithdrawDialog = (
    <StyledDialog handleDialogClose={handleDialogClose} open={isDialogOpen}>
      <DialogTitle variant="h5" textAlign="center">
        Withdraw Your Funds
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2}>
          {renderAmountTextField(stakes)}
          <Stack direction="row" spacing={1}>
            {percentageSelection.map((percentage, idx) => {
              return (
                <Button
                  key={idx}
                  variant="outlined"
                  onClick={() =>
                    setAmount(
                      ((Number(withdrawStake) * percentage) / OCTA).toString(),
                    )
                  }
                >
                  {percentage === 1 ? "MAX" : `${percentage * 100}%`}
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
          sx={{marginX: 2}}
        >
          WITHDRAW
        </Button>
      </DialogActions>
      <DialogContent sx={{textAlign: "center"}}>
        <Typography variant="caption" color={grey[450]}>
          <div>
            Please do your own research. Aptos Labs is not responsible for the
            security of your funds
          </div>
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
