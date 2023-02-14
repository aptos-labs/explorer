import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import React, {useState} from "react";
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
import {DELEGATION_POOL_ADDRESS, OCTA} from "../../constants";
import {useGlobalState} from "../../GlobalState";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {ValidatorData} from "../../api/hooks/useGetValidators";
import {useGetDelegationNodeInfo} from "../../api/hooks/useGetDelegationNodeInfo";

type StakeDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
  accountResource?: Types.MoveResource | undefined;
  validator: ValidatorData;
  stakedAmount: string;
  setStakedAmount: (arg: string) => void;
  setTransactionHash: (arg: string) => void;
  setTransactionSucceeded: (arg: boolean) => void;
  setTransactionInProcess: (arg: boolean) => void;
};

export default function StakeDialog({
  handleDialogClose,
  isDialogOpen,
  accountResource,
  validator,
  stakedAmount,
  setStakedAmount,
  setTransactionHash,
  setTransactionSucceeded,
  setTransactionInProcess,
}: StakeDialogProps) {
  const {rewardsRateYearly} = useGetStakingRewardsRate();
  const {signAndSubmitTransaction} = useWallet();
  const [state] = useGlobalState();
  const {commission} = useGetDelegationNodeInfo();

  const lockedUntilSecs = getLockedUtilSecs(accountResource);
  const [stakedAmountError, setStakedAmountError] = useState<boolean>(false);

  const handleStakedAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const amt = event.target.value;
    setStakedAmountError(isNaN(Number(amt)));
    setStakedAmount(amt);
  };

  const handleSignAndSubmitTransaction = async () => {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${DELEGATION_POOL_ADDRESS}::delegation_pool::add_stake`,
      type_arguments: [],
      arguments: [validator.owner_address, Number(stakedAmount) * OCTA], // staked amount arg is in octa
    };

    try {
      const response = await signAndSubmitTransaction(payload);
      setTransactionInProcess(true);
      await state.aptos_client.waitForTransaction(response?.hash!);
      setTransactionHash(response?.hash!);
      setTransactionSucceeded(true);
      handleDialogClose();
    } catch (error: any) {
      // TODO(jill): figure out how to gracefully handle txn errors
    } finally {
      setTransactionInProcess(false);
    }
  };

  return (
    <StyledDialog handleDialogClose={handleDialogClose} open={isDialogOpen}>
      <DialogTitle variant="h5" textAlign="center">
        Stake Into The Pool
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2}>
          <FormHelperText sx={{fontSize: "1rem"}}>Enter amount</FormHelperText>
          <OutlinedInput
            onChange={handleStakedAmountChange}
            value={stakedAmount}
            fullWidth
            placeholder="0"
            endAdornment={<InputAdornment position="end">APT</InputAdornment>}
          />
          {stakedAmountError && <FormHelperText error>Error</FormHelperText>}
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
          onClick={handleSignAndSubmitTransaction}
          variant="primary"
          fullWidth
          disabled={stakedAmountError || !stakedAmount}
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
}
