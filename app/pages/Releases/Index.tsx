import {Box, Typography} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import PageHeader from "../layout/PageHeader";
import ReleasesPageTabs, {
  DEFAULT_RELEASES_TAB,
  isReleasesTab,
  releasesTabHeadTitle,
} from "./Tabs";

const TAB_DESCRIPTIONS: Record<string, string> = {
  networks:
    "Live on-chain status for Aptos mainnet, testnet, and devnet — epoch, block height, framework version, node release, and feature-flag comparison.",
  aips: "Track all Aptos Improvement Proposals (AIPs) — status, authors, and links to source.",
  sdks: "Latest release versions for the Aptos CLI, node software, and all official SDKs — TypeScript, Python, Rust, and Go.",
};

export default function ReleasesPage() {
  const params = useParams({strict: false}) as {tab?: string};
  const tab =
    params.tab && isReleasesTab(params.tab) ? params.tab : DEFAULT_RELEASES_TAB;
  const tabTitle = releasesTabHeadTitle(tab);

  return (
    <Box>
      <PageMetadata
        title={`${tabTitle} | Releases`}
        description={TAB_DESCRIPTIONS[tab] ?? TAB_DESCRIPTIONS.networks}
        type="website"
        keywords={[
          "releases",
          "deployments",
          "AIPs",
          "SDK",
          "CLI",
          "mainnet",
          "testnet",
          "devnet",
          "Aptos",
        ]}
        canonicalPath={`/releases/${tab}`}
      />
      <PageHeader />
      <Typography variant="h3" component="h1" marginBottom={2}>
        Releases
      </Typography>
      <ReleasesPageTabs />
    </Box>
  );
}
