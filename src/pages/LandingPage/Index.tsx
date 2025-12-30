import HeaderSearch from "../layout/Search/Index";
import Box from "@mui/material/Box";
import NetworkInfo from "../Analytics/NetworkInfo/NetworkInfo";
import UserTransactionsPreview from "./UserTransactionsPreview";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {WalletDeprecationBanner} from "../../components/WalletDeprecationBanner";

export default function LandingPage() {
  return (
    <Box>
      <PageMetadata description="Explore transactions, accounts, events, validators, gas fees and other network activity on the Aptos blockchain. Real-time data and analytics for the Aptos Network." />
      <WalletDeprecationBanner />
      <NetworkInfo isOnHomePage />
      <HeaderSearch />
      <UserTransactionsPreview />
    </Box>
  );
}
