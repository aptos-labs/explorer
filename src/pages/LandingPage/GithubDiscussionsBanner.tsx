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

const GITHUB_DISCUSSION_URL =
  "https://github.com/aptos-labs/aptos-developer-discussions/discussions";

export function GithubDiscussionsBanner() {
  const [open, setOpen] = useState<boolean>(false);
  const {account, wallet} = useWallet();
  const logEvent = useLogEventWithBasic();
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const handleClick = () => {
    setOpen(!open);
    logEvent("github_discussions_banner_clicked", null, {
      wallet_address: account?.address?.toStringLong() ?? "",
      wallet_name: wallet?.name ?? "",
    });
    window.open(GITHUB_DISCUSSION_URL, "_blank");
  };

  const learnMoreButton = (
    <Button
      variant="text"
      onClick={handleClick}
      sx={{alignSelf: "flex-start", transform: `translateX(-0.5rem)`}}
    >
      <Typography>GO TO DISCUSSIONS</Typography>
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
    "Ask your tech questions and hang out with the Aptos developer community in the new developer discussions!";

  const children = isOnMobile ? (
    <Stack direction="column">
      {text}
      {learnMoreButton}
    </Stack>
  ) : (
    <>{text}</>
  );

  return (
    <Banner pillText="NEW" sx={{marginBottom: 2}} action={action}>
      {children}
    </Banner>
  );
}
