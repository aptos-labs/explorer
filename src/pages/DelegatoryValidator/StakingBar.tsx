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
import StyledTooltip, {
  StyledLearnMoreTooltip,
} from "../../components/StyledTooltip";
import StakeOperationDialog from "./StakeOperationDialog";
import {StakeOperation} from "../../api/hooks/useSubmitStakeOperation";
import {useGetDelegationNodeInfo} from "../../api/hooks/useGetDelegationNodeInfo";
import {DelegationStateContext} from "./context/DelegationContext";
import {useGetAccountAPTBalance} from "../../api/hooks/useGetAccountAPTBalance";
import {MINIMUM_APT_IN_POOL_FOR_EXPLORER} from "./constants";
import {OCTA} from "../../constants";
import {AptosClient, Types} from "aptos";
import {getAddStakeFee} from "../../api";
import {useGetDelegatorStakeInfo} from "../../api/hooks/useGetDelegatorStakeInfo";
import {Statsig} from "statsig-react";
import {useGlobalState} from "../../global-config/GlobalConfig";

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
  const {connected, wallet, account} = useWallet();
  const {delegatedStakeAmount, networkPercentage, commission, isQueryLoading} =
    useGetDelegationNodeInfo({
      validatorAddress: validator.owner_address,
    });

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleClickOpen = () => {
    Statsig.logEvent("stake_button_clicked", validator.owner_address, {
      commission: commission?.toString() ?? "",
      delegated_stake_amount: delegatedStakeAmount ?? "",
      network_percentage: networkPercentage ?? "",
      wallet_address: account?.address ?? "",
      wallet_name: wallet?.name ?? "",
    });
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
          amount={Number(validator.apt_rewards_distributed).toFixed(0)}
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

  const balance = useGetAccountAPTBalance(account?.address!);
  const [state, _] = useGlobalState();
  const client = new AptosClient(state.network_value);
  const {stakes} = useGetDelegatorStakeInfo(
    account?.address!,
    validator.owner_address,
  );
  const [addStakeFee, setAddStakeFee] = useState<Types.MoveValue>(0);
  // disable stake button when balance is less than minimum stake amount and add_stake fee computed from the minimum stake amount
  // or when balance is less than add_stake fee if minimum stake amount is already met
  const buttonDisabled =
    account !== null &&
    Number(balance) <=
      (Number(stakes[0]) === 0
        ? MINIMUM_APT_IN_POOL_FOR_EXPLORER * OCTA + Number(addStakeFee)
        : Number(addStakeFee));

  useEffect(() => {
    async function fetchData() {
      const fee = await getAddStakeFee(
        client,
        validator!.owner_address,
        MINIMUM_APT_IN_POOL_FOR_EXPLORER.toString(),
      );
      setAddStakeFee(fee[0]);
    }
    fetchData();
  }, [state.network_value, balance]);

  const stakeButton = (
    <StyledTooltip
      title={`You can't stake because minimum 11 APT requirement is not met`}
      disableHoverListener={!buttonDisabled}
    >
      <span>
        <Button
          variant="primary"
          onClick={handleClickOpen}
          sx={{width: "10px", maxHeight: "40px"}}
          disabled={buttonDisabled}
        >
          <ArrowCircleUpIcon sx={{marginRight: 1}} />
          <Typography>Stake</Typography>
        </Button>
      </span>
    </StyledTooltip>
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
      commission={commission}
      canWithdrawPendingInactive={false}
      stakes={stakes}
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
