import {Box, Typography} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {useTranslation} from "../../i18n";
import PageHeader from "../layout/PageHeader";
import ReleasesPageTabs, {
  DEFAULT_RELEASES_TAB,
  isReleasesTab,
  releasesTabHeadTitle,
} from "./Tabs";

export default function ReleasesPage() {
  const {t} = useTranslation();
  const params = useParams({strict: false}) as {tab?: string};
  const tab =
    params.tab && isReleasesTab(params.tab) ? params.tab : DEFAULT_RELEASES_TAB;
  const tabTitle = releasesTabHeadTitle(tab);
  const description =
    tab === "aips"
      ? t("pages.releases.aipsDescription")
      : tab === "sdks"
        ? t("pages.releases.sdksDescription")
        : t("pages.releases.networksDescription");

  return (
    <Box>
      <PageMetadata
        title={t("pages.releases.metaTitle", {tab: tabTitle})}
        description={description}
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
      <Typography
        variant="h3"
        component="h1"
        sx={{
          marginBottom: 2,
        }}
      >
        {t("pages.releases.title")}
      </Typography>
      <ReleasesPageTabs />
    </Box>
  );
}
