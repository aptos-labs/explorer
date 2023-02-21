import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Types} from "aptos";
import TimestampValue from "../../components/IndividualPageContent/ContentValue/TimestampValue";
import {grey} from "../../themes/colors/aptosColorPalette";
import {getLockedUtilSecs} from "./utils";
import StyledDialog from "../../components/StyledDialog";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";
import {
  REWARDS_LEARN_MORE_LINK,
  REWARDS_TOOLTIP_TEXT,
} from "../Validators/Components/Staking";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import ContentRowSpaceBetween from "../../components/IndividualPageContent/ContentRowSpaceBetween";
import {ValidatorData} from "../../api/hooks/useGetValidators";
import useAmountInput from "./hooks/useAmountInput";
import LoadingModal from "../../components/LoadingModal";
import TransactionResponseSnackbar from "../../components/snakebar/TransactionResponseSnackbar";
import TransactionSucceededDialog from "./TransactionSucceededDialog";
import useSubmitStakeOperation, {
  StakeOperation,
} from "../../api/hooks/useSubmitStakeOperation";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {MIN_ADD_STAKE_AMOUNT, OCTA} from "../../constants";

type StakeOperationDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
  accountResource?: Types.MoveResource | undefined;
  validator: ValidatorData;
  stake?: Types.MoveValue;
  stakeOperation: StakeOperation;
  rewardsRateYearly?: string | undefined;
  commission?: number | undefined;
};

export default function StakeOperationDialog({
  handleDialogClose,
  isDialogOpen,
  accountResource,
  validator,
  stake,
  stakeOperation,
  rewardsRateYearly,
  commission,
}: StakeOperationDialogProps) {
  const lockedUntilSecs = getLockedUtilSecs(accountResource);
  const percentageSelection = [0.1, 0.25, 0.5, 1]; // 0.1 === 10%

  const {
    submitStakeOperation,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitStakeOperation();
  const {
    amount,
    setAmount,
    clearAmount,
    renderAmountTextField,
    validateAmountInput,
  } = useAmountInput(stakeOperation);

  const [transactionHash, setTransactionHash] = useState<string>("");
  const [enteredAmount, setEnteredAmount] = useState<string>("");
  const [
    isTransactionSucceededDialogOpen,
    setIsTransactionSucceededDialogOpen,
  ] = useState<boolean>(false);

  const onSubmitClick = async () => {
    function getMinMax() {
      switch (stakeOperation) {
        case StakeOperation.STAKE:
          return [MIN_ADD_STAKE_AMOUNT];
        case StakeOperation.UNLOCK:
        case StakeOperation.REACTIVATE:
        case StakeOperation.WITHDRAW:
          return [0, Number(stake) / OCTA];
      }
    }

    const isAmountValid = validateAmountInput(...getMinMax());

    if (isAmountValid) {
      await submitStakeOperation(
        validator.owner_address,
        Number(amount),
        stakeOperation,
      );
    }
  };

  const onCloseSnackbar = () => {
    clearTransactionResponse();
  };

  const onCloseTransactionSucceededDialog = () => {
    setIsTransactionSucceededDialogOpen(false);
  };

  useEffect(() => {
    if (transactionResponse?.transactionSubmitted) {
      setTransactionHash(transactionResponse?.transactionHash);
      setEnteredAmount(amount);
      clearAmount();
      handleDialogClose();
      setIsTransactionSucceededDialogOpen(true);
    }
  }, [transactionResponse]);

  const transactionSucceededDialog = (
    <TransactionSucceededDialog
      isDialogOpen={isTransactionSucceededDialogOpen}
      handleDialogClose={onCloseTransactionSucceededDialog}
      amount={enteredAmount}
      transactionHash={transactionHash}
      stakeOperation={stakeOperation}
    />
  );

  const stakeDialog = (
    <StyledDialog handleDialogClose={handleDialogClose} open={isDialogOpen}>
      <DialogTitle variant="h5" textAlign="center">
        Stake Into The Pool
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2}>
          {renderAmountTextField()}
          <ContentBox>
            <ContentRowSpaceBetween
              title={"Operator Commission"}
              value={commission && `${commission}%`}
            />
            <ContentRowSpaceBetween
              title={"Compound Rewards"}
              value={`${rewardsRateYearly}% APY`}
              tooltip={
                <StyledLearnMoreTooltip
                  text={REWARDS_TOOLTIP_TEXT}
                  link={REWARDS_LEARN_MORE_LINK}
                />
              }
            />
            <ContentRowSpaceBetween
              title={"Next Unlock In"}
              value={
                <TimestampValue timestamp={lockedUntilSecs?.toString()!} />
              }
            />
          </ContentBox>
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
          Deposit
        </Button>
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

  const UnlockOrWithdrawOrReactivateDialog = (
    <StyledDialog handleDialogClose={handleDialogClose} open={isDialogOpen}>
      <DialogTitle variant="h5" textAlign="center">
        {stakeOperation === StakeOperation.UNLOCK
          ? "Unstake Funds"
          : stakeOperation === StakeOperation.REACTIVATE
          ? "Restake Funds"
          : "Withdraw Your Funds"}
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2}>
          {renderAmountTextField()}
          <Stack direction="row" spacing={1}>
            {percentageSelection.map((percentage, idx) => {
              return (
                <Button
                  key={idx}
                  variant="outlined"
                  onClick={() =>
                    setAmount(
                      (
                        Number(
                          getFormattedBalanceStr(Number(stake).toString()),
                        ) * percentage
                      ).toString(),
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
          {stakeOperation === StakeOperation.UNLOCK
            ? "UNSTAKE"
            : stakeOperation === StakeOperation.REACTIVATE
            ? "RESTAKE"
            : "WITHDRAW"}
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
      case StakeOperation.WITHDRAW:
        return UnlockOrWithdrawOrReactivateDialog;
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
