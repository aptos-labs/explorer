import {Box, Typography} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {OutOfCommissionPoolsBanner} from "../../components/OutOfCommissionPoolsBanner";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {useTranslation} from "../../i18n";
import PageHeader from "../layout/PageHeader";
import ValidatorsPageTabs from "./Tabs";
import ValidatorsMap from "./ValidatorsMap";
import {validatorsTabHeadTitle} from "./validatorsTabMeta";

export default function ValidatorsPage() {
  const {t} = useTranslation();
  const networkName = useNetworkName();
  const params = useParams({strict: false}) as {tab?: string};
  const tab = params.tab ?? "all";
  const tabTitle = validatorsTabHeadTitle(tab, t);

  return (
    <Box>
      <PageMetadata
        title={t("pages.validators.metaTitle", {tab: tabTitle})}
        description={t("pages.validators.metaDescription")}
        type="website"
        keywords={[
          "validators",
          "staking",
          "delegation",
          "APT",
          "proof of stake",
          "consensus",
          "rewards",
          "commission",
        ]}
        canonicalPath={`/validators/${tab}`}
      />
      <PageHeader />
      <Typography
        variant="h3"
        component="h1"
        sx={{
          marginBottom: 2,
        }}
      >
        {t("pages.validators.title")}
      </Typography>
      <OutOfCommissionPoolsBanner />
      {networkName === "mainnet" && <ValidatorsMap />}
      <ValidatorsPageTabs />
    </Box>
  );
}
