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

type StakeDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
  accountResource?: Types.MoveResource | undefined;
};

export default function StakeDialog({
  handleDialogClose,
  isDialogOpen,
  accountResource,
}: StakeDialogProps) {
  const {rewardsRateYearly} = useGetStakingRewardsRate();

  const lockedUntilSecs = getLockedUtilSecs(accountResource);
  const [stakedAmount, setStakedAmount] = useState<string>();
  const [stakedAmountError, setStakedAmountError] = useState<boolean>(false);
  const handleStakedAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const amt = event.target.value;
    setStakedAmountError(isNaN(Number(amt)));
    setStakedAmount(amt);
  };

  return (
    <StyledDialog handleDialogClose={handleDialogClose} open={isDialogOpen}>
      <DialogTitle>
        <Typography variant="h5" textAlign="center">
          Stake Into The Pool
        </Typography>
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
          onClick={handleDialogClose}
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
