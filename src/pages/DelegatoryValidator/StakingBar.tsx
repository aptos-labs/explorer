import {
  Button,
  Divider,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import ContentBoxSpaceBetween from "../../components/IndividualPageContent/ContentBoxSpaceBetween";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import {grey} from "../../themes/colors/aptosColorPalette";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import WalletConnectionDialog from "./WalletConnectionDialog";
import {StyledLearnMoreTooltip} from "../../components/StyledTooltip";
import StakeOperationDialog from "./StakeOperationDialog";
import {StakeOperation} from "../../api/hooks/useSubmitStakeOperation";
import {useGetStakingRewardsRate} from "../../api/hooks/useGetStakingRewardsRate";
import {useGetDelegationNodeInfo} from "../../api/hooks/useGetDelegationNodeInfo";
import {DelegationStateContext} from "./context/DelegationContext";

type ValidatorStakingBarProps = {
  setIsStakingBarSkeletonLoading: (arg: boolean) => void;
  isSkeletonLoading: boolean;
};

export default function StakingBar({
  setIsStakingBarSkeletonLoading,
  isSkeletonLoading,
}: ValidatorStakingBarProps) {
  const {accountResource, validator} = useContext(DelegationStateContext);

  if (!validator || !accountResource) {
    return null;
  }

  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const {connected} = useWallet();
  const {delegatedStakeAmount, networkPercentage, commission, isQueryLoading} =
    useGetDelegationNodeInfo({
      validatorAddress: validator.owner_address,
      validator,
    });
  const {rewardsRateYearly} = useGetStakingRewardsRate();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleClickOpen = () => {
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    if (!isQueryLoading) {
      setIsStakingBarSkeletonLoading(false);
    }
  }, [isQueryLoading]);

  const stakeAmount = (
    <Stack direction="column" spacing={0.5}>
      <Typography sx={{fontWeight: 600}}>
        <APTCurrencyValue
          amount={delegatedStakeAmount ?? ""}
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
        <APTCurrencyValue
          amount={Number(validator.apt_rewards_distributed).toFixed(2)}
          decimals={0}
        />
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
    <Button
      variant="primary"
      onClick={handleClickOpen}
      sx={{width: "10px", maxHeight: "40px"}}
    >
      <ArrowCircleUpIcon sx={{marginRight: 1}} />
      <Typography>Stake</Typography>
    </Button>
  );

  const stakingBarOnMobile = (
    <Stack direction="column" spacing={4}>
      <Stack direction="row" spacing={4} justifyContent="space-between">
        {stakeAmount}
        {delegatedStakePercentage}
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        {rewardsEarned}
      </Stack>
    </Stack>
  );

  const stakingBarOnWeb = (
    <Stack direction="row" spacing={4} justifyContent="space-between">
      <Stack direction="row" spacing={4}>
        {stakeAmount}
        {delegatedStakePercentage}
        <Divider orientation="vertical" flexItem variant="fullWidth" />
        {rewardsEarned}
      </Stack>
      {stakeButton}
    </Stack>
  );

  const stakeDialog = (
    <StakeOperationDialog
      handleDialogClose={handleDialogClose}
      isDialogOpen={dialogOpen}
      stakeOperation={StakeOperation.STAKE}
      rewardsRateYearly={rewardsRateYearly}
      commission={commission}
    />
  );

  const walletConnectionDialog = (
    <WalletConnectionDialog
      handleDialogClose={handleDialogClose}
      isDialogOpen={dialogOpen}
    />
  );

  return isSkeletonLoading ? (
    StakingBarSkeleton()
  ) : (
    <ContentBoxSpaceBetween>
      {isOnMobile ? stakingBarOnMobile : stakingBarOnWeb}
      {connected ? stakeDialog : walletConnectionDialog}
    </ContentBoxSpaceBetween>
  );
}

function StakingBarSkeleton() {
  return (
    <ContentBoxSpaceBetween>
      <Skeleton height={70}></Skeleton>
    </ContentBoxSpaceBetween>
  );
}
