import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {createFileRoute} from "@tanstack/react-router";
import {useState} from "react";
import {PageMetadata} from "../components/hooks/usePageMetadata";
import {useTranslation} from "../i18n";
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
  const {t} = useTranslation();

  const q = initialSearch?.trim() ?? "";
  const titleQuery =
    q.length > SEARCH_TITLE_MAX ? `${q.slice(0, SEARCH_TITLE_MAX)}…` : q;
  const descriptionQuery = q.length > 200 ? `${q.slice(0, 200)}…` : q;
  const title = q
    ? t("pages.home.searchDocumentTitle", {query: titleQuery})
    : t("pages.home.documentTitle");
  const description = q
    ? t("pages.home.searchMetaDescription", {query: descriptionQuery})
    : t("pages.home.metaDescription");

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
          {t("chrome.appName")}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: "text.secondary",
            mb: 4,
            textAlign: "center",
          }}
        >
          {t("pages.home.subtitle")}
        </Typography>
        <Box sx={{maxWidth: 980, mx: "auto", mb: 3}}>
          <SearchWithResults
            initialQuery={initialSearch}
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
              sx={{
                justifyContent: "center",
              }}
            >
              <Button component={Link} to="/transactions" variant="primary">
                {t("pages.home.browseTransactions")}
              </Button>
              <Button component={Link} to="/blocks" variant="outlined">
                {t("pages.home.viewLatestBlocks")}
              </Button>
              <Button component={Link} to="/analytics" variant="outlined">
                {t("pages.home.openAnalytics")}
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </>
  );
}
