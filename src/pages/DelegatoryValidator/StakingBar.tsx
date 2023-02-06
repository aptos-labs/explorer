import {
  Button,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, {useState} from "react";
import {ValidatorData} from "../../api/hooks/useGetValidators";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import StakeDialog from "./StakeDialog";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import {grey} from "../../themes/colors/aptosColorPalette";
import {Types} from "aptos";
import {useGetStakingInfo} from "../../api/hooks/useGetStakingInfo";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import WalletConnectionDialog from "./WalletConnectionDialog";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";

type ValidatorStakingBarProps = {
  validator: ValidatorData;
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
  const {connected} = useWallet();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const handleClickOpen = () => {
    setDialogOpen(true);
  };
  const handleClose = () => {
    setDialogOpen(false);
  };

  const stakeAmount = (
    <Stack direction="column" spacing={0.5}>
      <Typography sx={{fontWeight: 600}}>
        <APTCurrencyValue
          amount={delegatedStakeAmount}
          fixedDecimalPlaces={0}
        />
      </Typography>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography variant="body2" color={grey[450]}>
          Delegated Stake Amount
        </Typography>
        <StyledLearnMoreTooltip text="The total amount of delegated stake in this stake pool" />
      </Stack>
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
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography variant="body2" color={grey[450]}>
          Rewards Earned So Far
        </Typography>
        <StyledLearnMoreTooltip text="Amount of rewards earned by this stake pool to date" />
      </Stack>
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
      {connected ? (
        <StakeDialog
          handleDialogClose={handleClose}
          isDialogOpen={dialogOpen}
          accountResource={accountResource}
        />
      ) : (
        <WalletConnectionDialog
          handleDialogClose={handleClose}
          isDialogOpen={dialogOpen}
        />
      )}
    </ContentBox>
  );
}
