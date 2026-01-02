import {createFileRoute} from "@tanstack/react-router";
import Box from "@mui/material/Box";
import NetworkInfo from "../pages/Analytics/NetworkInfo/NetworkInfo";
import HeaderSearch from "../pages/layout/Search/Index";
import UserTransactionsPreview from "../pages/LandingPage/UserTransactionsPreview";
import {PageMetadata} from "../components/hooks/usePageMetadata";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <Box>
      <PageMetadata description="Explore transactions, accounts, events, validators, gas fees and other network activity on the Aptos blockchain. Real-time data and analytics for the Aptos Network." />
      <NetworkInfo isOnHomePage />
      <HeaderSearch />
      <UserTransactionsPreview />
    </Box>
  );
}
