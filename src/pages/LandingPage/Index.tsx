import Typography from "@mui/material/Typography";
import HeaderSearch from "../layout/Search/Index";
import Box from "@mui/material/Box";
import NetworkInfo from "../Analytics/NetworkInfo/NetworkInfo";
import UserTransactionsPreview from "./UserTransactionsPreview";
import {AptosLearnBanner} from "./AptosLearnBanner";

export default function LandingPage() {
  return (
    <Box>
      <AptosLearnBanner />
      <Typography variant="h3" component="h3" marginBottom={4}>
        Aptos Explorer
      </Typography>
      <NetworkInfo isOnHomePage />
      <HeaderSearch />
      <UserTransactionsPreview />
    </Box>
  );
}
