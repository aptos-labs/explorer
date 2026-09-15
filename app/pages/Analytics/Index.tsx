import {Box, Typography} from "@mui/material";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {defaultNetworkName} from "../../constants";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {useTranslation} from "../../i18n";
import PageHeader from "../layout/PageHeader";
import MainnetAnalytics from "./MainnetAnalytics";

export default function AnalyticsPage() {
  const {t} = useTranslation();
  const networkName = useNetworkName();

  const titleComponent = (
    <Typography
      variant="h3"
      component="h1"
      sx={{
        marginBottom: 2,
      }}
    >
      {t("pages.analytics.title")}
    </Typography>
  );

  return (
    <Box>
      <PageMetadata
        title={t("pages.analytics.title")}
        description={t("pages.analytics.metaDescription")}
        type="website"
        keywords={[
          "analytics",
          "metrics",
          "TPS",
          "daily active users",
          "transaction volume",
          "gas fees",
          "blockchain statistics",
        ]}
        canonicalPath="/analytics"
      />
      <PageHeader />
      {networkName === defaultNetworkName ? (
        <>
          {titleComponent}
          <MainnetAnalytics />
        </>
      ) : (
        <>
          {titleComponent}
          <Typography>{t("pages.analytics.mainnetOnly")}</Typography>
        </>
      )}
    </Box>
  );
}
