import {
  Button,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {grey} from "@mui/material/colors";
import React, {useState} from "react";
import {Banner} from "../../components/Banner";
import {StakingDrawer} from "./StakingDrawer";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";

export function StakingBanner() {
  const [open, setOpen] = useState<boolean>(false);
  const {account, wallet} = useWallet();
  const logEvent = useLogEventWithBasic();
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const handleClick = () => {
    setOpen(!open);
    logEvent("staking_banner_learn_more_clicked", null, {
      wallet_address: account?.address ?? "",
      wallet_name: wallet?.name ?? "",
    });
  };

  const learnMoreButton = (
    <Button
      variant="text"
      onClick={handleClick}
      sx={{alignSelf: "flex-start", transform: `translateX(-0.5rem)`}}
    >
      <Typography>LEARN MORE</Typography>
      <ArrowForwardIosIcon sx={{marginLeft: 2}} fontSize="small" />
    </Button>
  );

  const divider = (
    <Divider
      orientation="vertical"
      variant="middle"
      flexItem
      sx={{color: grey[200]}}
    />
  );

  const action = isOnMobile ? null : (
    <>
      {learnMoreButton}
      {divider}
    </>
  );

  const text =
    "Movement M1 enables delegations and staking services. See Staking for more details.";

  const children = isOnMobile ? (
    <Stack direction="column">
      {text}
      {learnMoreButton}
    </Stack>
  ) : (
    <>{text}</>
  );

  return (
    <>
      <Banner sx={{marginBottom: 2}} action={action}>
        {children}
      </Banner>
      <StakingDrawer open={open} handleClick={handleClick} />
    </>
  );
}
