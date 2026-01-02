import {Box, Typography} from "@mui/material";
import {useNetworkName} from "../../global-config/GlobalConfig";
import PageHeader from "../layout/PageHeader";
import ValidatorsPageTabs from "./Tabs";
import ValidatorsMap from "./ValidatorsMap";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {OutOfCommissionPoolsBanner} from "../../components/OutOfCommissionPoolsBanner";

export default function ValidatorsPage() {
  const networkName = useNetworkName();

  return (
    <Box>
      <PageMetadata
        title="Validators"
        description="View all validators on the Aptos blockchain network. Monitor validator performance, stake amounts, commission rates, voting power, and delegation status. Stake your APT with trusted validators."
        type="validator"
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
        canonicalPath="/validators"
      />
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      <OutOfCommissionPoolsBanner />
      {networkName === "mainnet" && <ValidatorsMap />}
      <ValidatorsPageTabs />
    </Box>
  );
}
