import {Box, Typography} from "@mui/material";
import {useNetworkName} from "../../global-config/GlobalConfig";
import PageHeader from "../layout/PageHeader";
import ValidatorsPageTabs from "./Tabs";
import ValidatorsMap from "./ValidatorsMap";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {OutOfCommissionPoolsBanner} from "../../components/OutOfCommissionPoolsBanner";
import {WalletDeprecationBanner} from "../../components/WalletDeprecationBanner";

export default function ValidatorsPage() {
  const networkName = useNetworkName();

  return (
    <Box>
      <PageMetadata
        title="Validators"
        description="View all validators on the Aptos blockchain network. Monitor validator performance, stake amounts, commission rates, and delegation status."
      />
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      <OutOfCommissionPoolsBanner />
      <WalletDeprecationBanner />
      {networkName === "mainnet" && <ValidatorsMap />}
      <ValidatorsPageTabs />
    </Box>
  );
}
