import {Box, Typography} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {OutOfCommissionPoolsBanner} from "../../components/OutOfCommissionPoolsBanner";
import {useNetworkName} from "../../global-config/GlobalConfig";
import PageHeader from "../layout/PageHeader";
import ValidatorsPageTabs from "./Tabs";
import ValidatorsMap from "./ValidatorsMap";
import {validatorsTabHeadTitle} from "./validatorsTabMeta";

export default function ValidatorsPage() {
  const networkName = useNetworkName();
  const params = useParams({strict: false}) as {tab?: string};
  const tab = params.tab ?? "all";
  const tabTitle = validatorsTabHeadTitle(tab);

  return (
    <Box>
      <PageMetadata
        title={`${tabTitle} | Validators`}
        description="View all validators on the Aptos blockchain network. Monitor validator performance, stake amounts, commission rates, voting power, and delegation status. Stake your APT with trusted validators."
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
      <Typography variant="h3" component="h1" sx={{marginBottom: 2}}>
        Validators
      </Typography>
      <OutOfCommissionPoolsBanner />
      {networkName === "mainnet" && <ValidatorsMap />}
      <ValidatorsPageTabs />
    </Box>
  );
}
