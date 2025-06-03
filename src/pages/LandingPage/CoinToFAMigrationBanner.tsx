import {
  Button,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {grey} from "@mui/material/colors";
import {useState} from "react";
import {Banner} from "../../components/Banner";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";
import {addressFromWallet} from "../../utils";

export function CoinToFAMigrationBanner() {
  const [open, setOpen] = useState<boolean>(false);
  const {account, wallet} = useWallet();
  const logEvent = useLogEventWithBasic();
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const handleClick = () => {
    setOpen(!open);
    logEvent("coin_to_fa_migration_banner_clicked", null, {
      wallet_address: addressFromWallet(account?.address),
      wallet_name: wallet?.name ?? "",
    });
    window.open(
      `https://explorer.aptoslabs.com/account/${addressFromWallet(account?.address)}/coins`,
      "_blank",
    );
  };

  const learnMoreButton = (
    <Button
      variant="text"
      onClick={handleClick}
      sx={{alignSelf: "flex-start", transform: `translateX(-0.5rem)`}}
    >
      <Typography>GO TO ACCOUNT</Typography>
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

  // maybe add some link to a blog post
  const text =
    "You have coins that are eligible for migration to fungible assets FA. ";

  const children = isOnMobile ? (
    <Stack direction="column">
      {text}
      {learnMoreButton}
    </Stack>
  ) : (
    <>{text}</>
  );

  return wallet === null ? (
    <></>
  ) : (
    <Banner pillText="NEW" sx={{marginBottom: 2}} action={action}>
      {children}
    </Banner>
  );
}
