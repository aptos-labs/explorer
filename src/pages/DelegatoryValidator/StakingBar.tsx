import {
  Button,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, {useState} from "react";
import {MainnetValidatorData} from "../../api/hooks/useGetMainnetValidators";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import StakeDialog from "./StakeDialog";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import {grey} from "../../themes/colors/aptosColorPalette";
import {Types} from "aptos";
import {useGetStakingInfo} from "../../api/hooks/useGetStakingInfo";

type ValidatorStakingBarProps = {
  validator: MainnetValidatorData;
  accountResource?: Types.MoveResource | undefined;
};

export default function StakingBar({
  validator,
  accountResource,
}: ValidatorStakingBarProps) {
  const theme = useTheme();
  const {delegatedStakeAmount, networkPercentage} = useGetStakingInfo({
    validator,
  });

  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const handleClickOpen = () => {
    setDialogOpen(true);
  };
  const handleClose = () => {
    setDialogOpen(false);
  };

  const stakeAmount = (
    <Stack direction="column" spacing={0.5}>
      <Typography
        sx={{fontWeight: 600}}
      >{`${delegatedStakeAmount} APT`}</Typography>
      <Typography variant="body2" color={grey[450]}>
        Delegated Stake Amount
      </Typography>
    </Stack>
  );

  const delegatedStakePercentage = (
    <Stack direction="column" spacing={0.5}>
      <Typography sx={{fontWeight: 600}}>{networkPercentage}%</Typography>
      <Typography variant="body2" color={grey[450]}>
        Of Network
      </Typography>
    </Stack>
  );

  const rewardsEarned = (
    <Stack direction="column" spacing={0.5}>
      <Typography sx={{fontWeight: 600}}>
        <APTCurrencyValue amount={""} />
      </Typography>
      <Typography variant="body2" color={grey[450]}>
        Rewards Earned So Far
      </Typography>
    </Stack>
  );

  const stakeButton = (
    <Button variant="primary" onClick={handleClickOpen}>
      <ArrowCircleUpIcon sx={{marginRight: 1}} />
      <Typography>Stake</Typography>
    </Button>
  );

  return (
    <ContentBox>
      {isOnMobile ? (
        <Stack direction="column" spacing={4}>
          <Stack direction="row" spacing={4} justifyContent="space-between">
            {stakeAmount}
            {delegatedStakePercentage}
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            {rewardsEarned}
            {stakeButton}
          </Stack>
        </Stack>
      ) : (
        <Stack direction="row" spacing={4} justifyContent="space-between">
          <Stack direction="row" spacing={4}>
            {stakeAmount}
            {delegatedStakePercentage}
            <Divider orientation="vertical" flexItem variant="fullWidth" />
            {rewardsEarned}
          </Stack>
          {stakeButton}
        </Stack>
      )}
      <StakeDialog
        handleDialogClose={handleClose}
        isDialogOpen={dialogOpen}
        accountResource={accountResource}
      />
    </ContentBox>
  );
}
