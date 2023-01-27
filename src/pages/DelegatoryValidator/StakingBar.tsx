import {
  Button,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, {useMemo, useState} from "react";
import {MainnetValidatorData} from "../../api/hooks/useGetMainnetValidators";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import StakeDialog from "./StakeDialog";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import {grey} from "../../themes/colors/aptosColorPalette";
import {Types} from "aptos";

type ValidatorStakingBarProps = {
  validator: MainnetValidatorData;
  accountResource?: Types.MoveResource | undefined;
};

export default function StakingBar({
  validator,
  accountResource,
}: ValidatorStakingBarProps) {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const {totalVotingPower} = useGetValidatorSet();
  const votingPower = getFormattedBalanceStr(
    validator.voting_power.toString(),
    undefined,
    0,
  );

  const [networkPercentage, setNetworkPercentage] = useState<string>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const handleClickOpen = () => {
    setDialogOpen(true);
  };
  const handleClose = () => {
    setDialogOpen(false);
  };

  useMemo(() => {
    setNetworkPercentage(
      (
        (parseInt(validator.voting_power) / parseInt(totalVotingPower!)) *
        100
      ).toFixed(2),
    );
  }, [totalVotingPower]);

  const delegatedStakeAmount = (
    <Stack direction="column" spacing={0.5}>
      <Typography sx={{fontWeight: 600}}>{`${votingPower} APT`}</Typography>
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
      <Typography sx={{fontWeight: 600}}>? APT</Typography>
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

  // TODO: revisit mobile layout
  return (
    <ContentBox>
      {isOnMobile ? (
        <Stack direction="column" spacing={4}>
          <Stack direction="row" spacing={4} justifyContent="space-between">
            {delegatedStakeAmount}
            {delegatedStakePercentage}
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            {rewardsEarned}
          </Stack>
        </Stack>
      ) : (
        <Stack direction="row" spacing={4} justifyContent="space-between">
          <Stack direction="row" spacing={4}>
            {delegatedStakeAmount}
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
