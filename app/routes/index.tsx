import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {createFileRoute} from "@tanstack/react-router";
import {useState} from "react";
import {PageMetadata} from "../components/hooks/usePageMetadata";
import TotalTransactions from "../pages/Analytics/NetworkInfo/TotalTransactions";
import SearchWithResults from "../pages/Search/SearchWithResults";
import {Link} from "../routing";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    search: typeof search.search === "string" ? search.search : undefined,
  }),
  component: LandingPage,
});

const SEARCH_TITLE_MAX = 72;

function LandingPage() {
  const {search: initialSearch} = Route.useSearch();
  const [searching, setSearching] = useState(!!initialSearch);

  const q = initialSearch?.trim() ?? "";
  const title = q
    ? `Search · ${
        q.length > SEARCH_TITLE_MAX ? `${q.slice(0, SEARCH_TITLE_MAX)}…` : q
      }`
    : "Aptos Explorer - Blockchain Explorer";
  const description = q
    ? `Aptos Explorer search for “${q.length > 200 ? `${q.slice(0, 200)}…` : q}”. Results load inline on this page; use the search bar to refine or follow detected links.`
    : "Explore transactions, accounts, blocks, validators, NFTs, and network activity on the Aptos blockchain. Real-time data, analytics, and the official block explorer for the Aptos Network.";

  return (
    <>
      <PageMetadata
        title={title}
        description={description}
        type="website"
        keywords={[
          "Aptos",
          "blockchain explorer",
          "transactions",
          "accounts",
          "blocks",
          "validators",
          "NFTs",
          "web3",
          ...(q ? ["search", "lookup"] : []),
        ]}
        canonicalPath="/"
        searchQuery={q || undefined}
      />
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
    </>
  );
}
