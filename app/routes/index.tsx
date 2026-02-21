import {createFileRoute} from "@tanstack/react-router";
import Box from "@mui/material/Box";
import NetworkInfo from "../pages/Analytics/NetworkInfo/NetworkInfo";
import HeaderSearch from "../pages/layout/Search/Index";
import UserTransactionsPreview from "../pages/LandingPage/UserTransactionsPreview";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";

const DESCRIPTION =
  "Explore transactions, accounts, events, validators, gas fees and other network activity on the Aptos blockchain. Real-time data and analytics for the Aptos Network.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {title: "Aptos Explorer"},
      {name: "description", content: DESCRIPTION},
      {property: "og:title", content: "Aptos Explorer"},
      {property: "og:description", content: DESCRIPTION},
      {property: "og:url", content: BASE_URL},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {name: "twitter:title", content: "Aptos Explorer"},
      {name: "twitter:description", content: DESCRIPTION},
    ],
    links: [{rel: "canonical", href: BASE_URL}],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <Box>
      <NetworkInfo isOnHomePage />
      <HeaderSearch />
      <UserTransactionsPreview />
    </Box>
  );
}
