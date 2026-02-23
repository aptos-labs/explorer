import {createFileRoute} from "@tanstack/react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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
      {property: "og:type", content: "website"},
      {property: "og:site_name", content: "Aptos Explorer"},
      {property: "og:title", content: "Aptos Explorer"},
      {property: "og:description", content: DESCRIPTION},
      {property: "og:url", content: `${BASE_URL}/`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {property: "og:image:alt", content: "Aptos Explorer"},
      {property: "og:image:width", content: "1200"},
      {property: "og:image:height", content: "630"},
      {name: "twitter:card", content: "summary_large_image"},
      {name: "twitter:title", content: "Aptos Explorer"},
      {name: "twitter:description", content: DESCRIPTION},
      {name: "twitter:image", content: DEFAULT_OG_IMAGE},
    ],
    links: [
      {rel: "canonical", href: `${BASE_URL}/`},
      {rel: "alternate", href: `${BASE_URL}/`, hrefLang: "en"},
      {rel: "alternate", href: `${BASE_URL}/`, hrefLang: "x-default"},
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <Box>
      <Typography
        variant="h1"
        sx={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      >
        Aptos Explorer
      </Typography>
      <NetworkInfo isOnHomePage />
      <HeaderSearch />
      <UserTransactionsPreview />
    </Box>
  );
}
