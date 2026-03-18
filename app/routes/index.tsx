import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {createFileRoute} from "@tanstack/react-router";
import {useState} from "react";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import TotalTransactions from "../pages/Analytics/NetworkInfo/TotalTransactions";
import SearchWithResults from "../pages/Search/SearchWithResults";
import {Link} from "../routing";

const DESCRIPTION =
  "Explore transactions, accounts, events, validators, gas fees and other network activity on the Aptos blockchain. Real-time data and analytics for the Aptos Network.";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    search: typeof search.search === "string" ? search.search : undefined,
  }),
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
  const {search: initialSearch} = Route.useSearch();
  const [searching, setSearching] = useState(!!initialSearch);

  return (
    <Box>
      <Typography variant="h1" sx={{mb: 2, textAlign: "center"}}>
        Aptos Explorer
      </Typography>
      <Typography
        variant="h5"
        color="text.secondary"
        sx={{mb: 4, textAlign: "center"}}
      >
        Search the chain, then jump straight to transactions, blocks,
        validators, or analytics.
      </Typography>
      <Box sx={{maxWidth: 980, mx: "auto", mb: 3}}>
        <SearchWithResults
          initialQuery={initialSearch}
          updateUrl={false}
          onResultsChange={setSearching}
        />
      </Box>
      {!searching && (
        <>
          <Box sx={{display: "flex", justifyContent: "center", mb: 4}}>
            <TotalTransactions />
          </Box>
          <Stack
            direction={{xs: "column", sm: "row"}}
            spacing={2}
            justifyContent="center"
          >
            <Button component={Link} to="/transactions" variant="primary">
              Browse Transactions
            </Button>
            <Button component={Link} to="/blocks" variant="outlined">
              View Latest Blocks
            </Button>
            <Button component={Link} to="/analytics" variant="outlined">
              Open Analytics
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}
