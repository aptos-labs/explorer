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
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";

const APTOS_LEARN_URL = "https://learn.aptoslabs.com";

export function AptosLearnBanner() {
  const [open, setOpen] = useState<boolean>(false);
  const {account, wallet} = useWallet();
  const logEvent = useLogEventWithBasic();
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const handleClick = () => {
    setOpen(!open);
    logEvent("aptos_learn_banner_clicked", null, {
      wallet_address: account?.address ?? "",
      wallet_name: wallet?.name ?? "",
    });
    window.open(APTOS_LEARN_URL, "_blank");
  };

  const learnMoreButton = (
    <Button
      variant="text"
      onClick={handleClick}
      sx={{alignSelf: "flex-start", transform: `translateX(-0.5rem)`}}
    >
      <Typography>GO TO APTOS LEARN</Typography>
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
    "Create your own decentralized app with the recently launched Aptos Learn website!";

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
    </>
  );
}
