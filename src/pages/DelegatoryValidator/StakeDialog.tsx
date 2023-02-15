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
import {useGetStakingRewardsRate} from "../../api/hooks/useGetStakingRewardsRate";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";
import {
  REWARDS_LEARN_MORE_LINK,
  REWARDS_TOOLTIP_TEXT,
} from "../Validators/Components/Staking";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import ContentRowSpaceBetween from "../../components/IndividualPageContent/ContentRowSpaceBetween";
import {ValidatorData} from "../../api/hooks/useGetValidators";
import useSubmitStake from "../../api/hooks/useSubmitStake";
import useAmountInput from "./hooks/useAmountInput";
import LoadingModal from "../../components/LoadingModal";
import TransactionResponseSnackbar from "../../components/snakebar/TransactionResponseSnackbar";
import TransactionSucceededDialog from "./TransactionSucceededDialog";

type StakeDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
  accountResource?: Types.MoveResource | undefined;
  validator: ValidatorData;
};

export default function StakeDialog({
  handleDialogClose,
  isDialogOpen,
  accountResource,
  validator,
}: StakeDialogProps) {
  const {rewardsRateYearly} = useGetStakingRewardsRate();
  const lockedUntilSecs = getLockedUtilSecs(accountResource);
  const {
    submitStake,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitStake();
  const {
    amount: stakeAmount,
    clearAmount: clearStakingAmount,
    renderAmountTextField: renderStakingAmountTextField,
    validateAmountInput: validateStakingAmountInput,
  } = useAmountInput();

  const [transactionHash, setTransactionHash] = useState<string>("");
  const [stakedAmount, setStakedAmount] = useState<string>("");
  const [
    isTransactionSucceededDialogOpen,
    setIsTransactionSucceededDialogOpen,
  ] = useState<boolean>(false);

  const onSubmitClick = async () => {
    const isStakingAmountValid = validateStakingAmountInput();

    if (isStakingAmountValid) {
      await submitStake(validator.owner_address, Number(stakeAmount));
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
      setStakedAmount(stakeAmount);
      clearStakingAmount();
      handleDialogClose();
      setIsTransactionSucceededDialogOpen(true);
    }
  }, [transactionResponse]);

  const transactionSucceededDialog = (
    <TransactionSucceededDialog
      isDialogOpen={isTransactionSucceededDialogOpen}
      handleDialogClose={onCloseTransactionSucceededDialog}
      stakedAmount={stakedAmount}
      transactionHash={transactionHash}
    />
  );

  const stakeDialog = (
    <StyledDialog handleDialogClose={handleDialogClose} open={isDialogOpen}>
      <DialogTitle variant="h5" textAlign="center">
        Stake Into The Pool
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2}>
          {renderStakingAmountTextField()}
          <ContentBox>
            <ContentRowSpaceBetween
              title={"Operator Commission"}
              value={"N/A"}
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
          disabled={stakeAmount === ""}
          sx={{marginX: 2}}
        >
          Deposit
        </Button>
      </DialogActions>
      <DialogContent sx={{textAlign: "center"}}>
        <Typography variant="caption" color={grey[450]}>
          Be aware that you will be able to see your funds in the pool after 1
          epoch (~2 hours) due to the delay time
        </Typography>
      </DialogContent>
    </StyledDialog>
  );

  return (
    <>
      <TransactionResponseSnackbar
        transactionResponse={transactionResponse}
        onCloseSnackbar={onCloseSnackbar}
      />
      <LoadingModal open={transactionInProcess} />
      {isTransactionSucceededDialogOpen
        ? transactionSucceededDialog
        : stakeDialog}
    </>
  );
}
