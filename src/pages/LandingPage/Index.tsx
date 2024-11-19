import Typography from "@mui/material/Typography";
import HeaderSearch from "../layout/Search/Index";
import Box from "@mui/material/Box";
import NetworkInfo from "../Analytics/NetworkInfo/NetworkInfo";
import UserTransactionsPreview from "./UserTransactionsPreview";
import {GithubDiscussionsBanner} from "./GithubDiscussionsBanner";
import {useEffect} from "react";

export default function LandingPage() {
  useEffect(() => {
    document.title = `Aptos Explorer`;
  }, []);
  return (
    <Box>
      <GithubDiscussionsBanner />
      <Typography variant="h3" component="h3" marginBottom={4}>
        Aptos Explorer
      </Typography>
      <NetworkInfo isOnHomePage />
      <HeaderSearch />
      <UserTransactionsPreview />
    </Box>
  );
}
